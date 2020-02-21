declare function css(args: any): string;

export default css`
  :host {
    --input-color: #000;
    --input-background: #fff;
    --input-border-width: 2px;
    --input-border-color: #718096;
    --focus-outline-width: 3px;
    --focus-outline-color: #ecc94b;
    --menu-max-height: 16em;
    --item-color: #000;
    --item-background: #fff;
    --item-color-active: #fff;
    --item-background-active: #111;
    --caret-color: var(--input-color);
    --item-padding: 0.5em;
    display: inline-block;
  }

  ::slotted(*),
  .visually-hidden {
    border: 0;
    clip: rect(0 0 0 0);
    height: 1px;
    margin: -1px;
    overflow: hidden;
    padding: 0;
    position: absolute;
    width: 1px;
  }

  .hidden {
    display: none;
  }

  .autocomplete {
    position: relative;
    --input-border: var(--input-border-width) solid var(--input-border-color);
  }

  input[type="text"] {
    border-radius: 0;
    box-sizing: border-box;
    width: 100%;
    font-size: inherit;
    font-family: inherit;
    line-height: inherit;
    color: var(--input-color);
    background: var(--input-background);
    padding: var(--item-padding);
    border: var(--input-border);
  }

  input[type="text"].focus {
    outline-offset: 0;
    outline: var(--focus-outline-width) solid var(--focus-outline-color);
  }

  svg {
    position: absolute;
    width: 1.5em;
    height: 1.5em;
    right: 0;
    top: 0;
    fill: var(--caret-color);
    transform: translate(-50%, 50%);
    cursor: default;
  }

  [role="listbox"] {
    margin: 0;
    padding: 0;
    max-height: var(--menu-max-height);
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    position: absolute;
    top: 100%;
    width: 100%;
    background-color: #f7fafc;
    border-radius: 0;
    box-sizing: border-box;
    z-index: 2;
    border: var(--input-border);
  }

  [role="option"],
  .no-result {
    padding: var(--item-padding);
    display: block;
    outline: none;
    margin: 0;
    color: var(--item-color);
    background-color: var(--item-background);
    border-bottom: var(--input-border);
    border-width: 1px;
  }

  [role="option"]:hover,
  [role="option"][aria-selected="true"] {
    color: var(--item-color-active);
    background-color: var(--item-background-active);
    cursor: default;
  }

  .no-result {
    cursor: not-allowed;
  }
`;
