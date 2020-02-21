import styles from "./style.css";

declare function html(s: TemplateStringsArray, ...t: any[]): string;
interface Option {
  text: string;
  value: string;
}
type Nullable<T> = T | null;
type Item = HTMLLIElement;

const enum Key {
  enter = 13,
  esc = 27,
  space = 32,
  up = 38,
  down = 40,
  tab = 9,
  left = 37,
  right = 39,
  shift = 16,
}

export class BetterSelect extends HTMLElement {
  private select: HTMLSelectElement;
  private input: HTMLInputElement;
  private status: HTMLElement;
  private activeOptionId: string;
  private menu: HTMLUListElement;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.activeOptionId = "";
  }

  connectedCallback() {
    if (this.getAttribute("match")) {
      // @ts-ignore
      const matcher = window[this.getAttribute("match")!];
      if (typeof matcher === "function" && matcher.length == 2) {
        this.isMatch = matcher;
      } else {
        throw new Error("Invalid `match` attribute");
      }
    }

    this.select = this.querySelector("select")!;
    const sr = this.shadowRoot!;
    sr.innerHTML = markup(this.select);
    this.hideSelectBox();

    this.input = sr.querySelector("input")!;
    this.status = sr.querySelector('[role="status"]')! as HTMLElement;
    this.menu = sr.querySelector("ul")!;

    document.addEventListener("click", this.onDocumentClick);
    this.input.addEventListener("click", this.onInputClick);
    this.input.addEventListener("keydown", this.onInputKeyDown);
    this.input.addEventListener("keyup", this.onInputKeyUp);
    this.input.addEventListener("focus", this.onInputFocus);
    this.menu.addEventListener("click", this.onOptionClick);
    this.menu.addEventListener("keydown", this.onMenuKeyDown);
    const arrow = sr.querySelector("svg")!;
    arrow.addEventListener("click", this.onArrowClick);
  }

  disconnectedCallback() {
    document.removeEventListener("click", this.onDocumentClick);
    this.input.removeEventListener("click", this.onInputClick);
    this.input.removeEventListener("keydown", this.onInputKeyDown);
    this.input.removeEventListener("keyup", this.onInputKeyUp);
    this.input.removeEventListener("focus", this.onInputFocus);
    this.menu.removeEventListener("click", this.onOptionClick);
    this.menu.removeEventListener("keydown", this.onMenuKeyDown);
    const arrow = this.shadowRoot!.querySelector("svg")!;
    arrow.removeEventListener("click", this.onArrowClick);
  }

  /**
   * Override this function for a custom matcher. For example, you can filter
   * over `option.dataset.alt` or make it case sensitive or prefix matching.
   *
   * Alternatively, instead of sub-classing and overriding this method, you
   * can create a global function of same signature and reference it using the
   * `match` attribute of this element.
   */
  isMatch(option: HTMLOptionElement, value: string): boolean {
    value = value.toLowerCase();
    return (
      option.text.toLowerCase().includes(value) ||
      (!!option.dataset.alt && option.dataset.alt.toLowerCase().includes(value))
    );
  }

  /**
   * Override this function if want to use a more efficient algorithm for
   * filtering. You can access `this.select.options` to get a
   * `HTMLOptionsCollection` and filter over them, or you can add better data
   * structures in the constructor and access them. Only override this if
   * `isMatch` is not working out good enough for you.
   */
  getMatches(value: string): Option[] {
    return Array.from(this.select.options)
      .filter(option => option.value && this.isMatch(option, value))
      .map(({ text, value }) => ({ text, value }));
  }

  private onDocumentClick = (ev: MouseEvent) => {
    if (!this.contains(ev.target as Node)) {
      this.hideMenu();
      this.removeTextBoxFocus();
    }
  };

  private onInputClick = (ev: MouseEvent) => {
    this.clearOptions();
    const options = this.getAllOptions();
    this.buildMenu(options);
    this.updateStatus(options.length);
    this.showMenu();
    if (ev.currentTarget instanceof HTMLInputElement) {
      ev.currentTarget.select();
    }
  };

  private onInputKeyDown = (ev: KeyboardEvent) => {
    if (ev.keyCode !== Key.tab) return;
    // This ensures that when users tabs away from textbox that the normal
    // tab sequence is adhered to. We hide the options, which removes the
    // ability to focus the options
    this.hideMenu();
    this.removeTextBoxFocus();
  };

  private onInputKeyUp = (ev: KeyboardEvent) => {
    switch (ev.keyCode) {
      case Key.down:
        this.onTextBoxDownPressed(ev);
        break;
      case Key.esc:
      case Key.up:
      case Key.left:
      case Key.right:
      case Key.space:
      case Key.enter:
      case Key.tab:
      case Key.shift:
        // ignore these keys otherwise the menu will show briefly
        break;
      default:
        this.onTextBoxType(ev);
    }
  };

  private onInputFocus = () => {
    this.input.classList.add("focus");
  };

  private onArrowClick = (ev: MouseEvent) => {
    this.onInputClick(ev);
    this.focusTextBox();
  };

  private onMenuKeyDown = (ev: KeyboardEvent) => {
    switch (ev.keyCode) {
      case Key.up: // highlight previous option
        return this.onOptionUpArrow(ev);
      case Key.down: // highlight next suggestion
        return this.onOptionDownArrow(ev);
      case Key.enter: // select the suggestion
        return this.onOptionEnter(ev);
      case Key.space: // select the suggestion
        return this.onOptionSpace(ev);
      case Key.esc: // hide options
        return this.onOptionEscape(ev);
      case Key.tab:
        this.hideMenu();
        return this.removeTextBoxFocus();
      default:
        this.focusTextBox();
    }
  };

  private onTextBoxType = (ev: KeyboardEvent) => {
    const value = this.input.value.trim();
    if (value.length > 0) {
      const options = this.getMatches(value.toLowerCase());
      this.buildMenu(options);
      this.showMenu();
      this.updateStatus(options.length);
    } else {
      this.hideMenu();
    }
    this.updateSelectBox();
  };

  private onOptionEscape = (ev: KeyboardEvent) => {
    this.clearOptions();
    this.hideMenu();
    this.focusTextBox();
  };

  private onOptionEnter = (ev: KeyboardEvent) => {
    if (this.isOptionSelected()) {
      this.selectActiveOption();
    }
    // we don't want form to submit
    ev.preventDefault();
  };

  private onOptionSpace = (ev: KeyboardEvent) => {
    if (this.isOptionSelected()) {
      this.selectActiveOption();
      // we don't want a space to be added to text box
      ev.preventDefault();
    }
  };

  private onOptionClick = (ev: MouseEvent) => {
    const el = ev.target;
    if (el instanceof HTMLLIElement) {
      this.selectOption(el);
    }
  };

  private onTextBoxDownPressed = (ev: KeyboardEvent) => {
    const value = this.input.value;
    const showAll = !value || !!this.getMatchingOption(value);
    const options = showAll ? this.getAllOptions() : this.getMatches(value);
    if (!options.length) return;

    this.buildMenu(options);
    this.showMenu();
    const option = this.getFirstOption();
    this.highlightOption(option);
  };

  private onOptionDownArrow = (ev: KeyboardEvent) => {
    const option = this.getNextOption();
    if (option) {
      this.highlightOption(option);
    }
    ev.preventDefault();
  };

  private onOptionUpArrow = (ev: KeyboardEvent) => {
    if (this.isOptionSelected()) {
      const option = this.getPreviousOption();
      if (option) {
        this.highlightOption(option);
      } else {
        this.focusTextBox();
        this.hideMenu();
      }
    }
    ev.preventDefault();
  };

  private removeTextBoxFocus() {
    this.input.classList.remove("focus");
  }

  private focusTextBox() {
    this.input.focus();
  }

  private updateSelectBox() {
    const value = this.input.value;
    const option = this.getMatchingOption(value);
    this.select.value = option ? option.value : "";
  }

  private selectActiveOption() {
    const option = this.getActiveOption();
    this.selectOption(option);
  }

  private selectOption(item: Item) {
    this.setValue(item.dataset.value!);
    this.hideMenu();
    this.focusTextBox();
  }

  private isOptionSelected() {
    return !!this.activeOptionId;
  }

  private getActiveOption() {
    return this.shadowRoot!.getElementById(this.activeOptionId) as Item;
  }

  private getFirstOption() {
    return this.menu.querySelector("li")!;
  }

  private getPreviousOption() {
    return this.getActiveOption().previousElementSibling as Nullable<Item>;
  }

  private getNextOption() {
    return this.getActiveOption().nextElementSibling as Nullable<Item>;
  }

  private highlightOption(item: Item) {
    if (this.activeOptionId) {
      this.getActiveOption().setAttribute("aria-selected", "false");
    }

    item.scrollIntoView({ block: "center" });

    this.activeOptionId = item.id;
    item.setAttribute("aria-selected", "true");
    item.focus();
  }

  private showMenu() {
    this.menu.classList.remove("hide");
    this.input.setAttribute("aria-expanded", "true");
  }

  private hideMenu() {
    this.menu.classList.add("hide");
    this.input.setAttribute("aria-expanded", "false");
    this.activeOptionId = "";
    this.clearOptions();
  }

  private clearOptions() {
    while (this.menu.firstChild) {
      this.menu.firstChild.remove();
    }
  }

  private getAllOptions() {
    return Array.from(this.select.options)
      .filter(option => option.value)
      .map(({ text, value }) => ({ text, value }));
  }

  private getMatchingOption(value: string) {
    value = value.toLowerCase();
    return Array.from(this.select.options).find(
      option => option.text.toLowerCase() === value,
    );
  }

  private buildMenu(options: Option[]): void {
    this.clearOptions();
    this.activeOptionId = "";

    const frag = document.createElement("div");
    if (options.length) {
      frag.innerHTML = Object.entries(options)
        .map(([i, option]) => this.getOptionHtml(i, option))
        .join("");
    } else {
      frag.innerHTML = this.getNoResultsOptionHtml();
    }
    this.menu.append(...Array.from(frag.children));
    this.menu.scrollTop = 0;
  }

  private getNoResultsOptionHtml() {
    return html`
      <li class="empty">No results</li>
    `;
  }

  private getOptionHtml(i: number | string, option: Option) {
    return html`
      <li
        tabindex="-1"
        role="option"
        aria-selected="false"
        data-value="${option.value}"
        id="option-${i}"
      >
        ${option.text}
      </li>
    `;
  }

  private updateStatus(count: number): void {
    const status = count === 0 ? "No results." : `${count} results available.`;
    this.status.textContent = status;
  }

  private hideSelectBox() {
    const select = this.select;
    select.setAttribute("aria-hidden", "true");
    select.classList.add("vhide");
    select.tabIndex = -1;
    select.id = "";
  }

  private setValue(value: string) {
    const { select, input } = this;
    select.value = value;
    input.value = select.options[select.selectedIndex].text || "";

    const ev = document.createEvent("HTMLEvents");
    ev.initEvent("change", true, true);
    select.dispatchEvent(ev);
  }
}

function markup(select: HTMLSelectElement) {
  const { id, selectedIndex, options } = select;
  const selected = options[selectedIndex];
  const value = selected && selected.value != "" ? selected.text : null;
  const listId = `list-${id}`;
  const label =
    document.querySelector(`label[for="${id}"]`) || select.closest("label");

  return html`
    <div>
      <style>
        ${styles}
      </style>
      <slot></slot>
      <input
        autocapitalize="none"
        type="text"
        autocomplete="off"
        aria-autocomplete="list"
        role="combobox"
        aria-owns="${listId}"
        id=${id}
        ${label ? `aria-label="${label.textContent}"` : ""}
        ${value ? `value="${value}"` : ""}
      />
      <svg focusable="false" viewBox="0 0 25 25" aria-hidden="true">
        <g><polygon points="0 0 22 0 11 17"></polygon></g>
      </svg>
      <ul role="listbox" class="hide" id="${listId}"></ul>
      <div aria-live="polite" role="status" class="vhide"></div>
    </div>
  `;
}

const name = "better-select";
if (document.querySelector(name) && !customElements.get(name)) {
  customElements.define(name, BetterSelect);
}
