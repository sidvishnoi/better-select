declare function css(args: any): string;

export default css`
  :host {
    --input-color: #000;
    --input-background: #fff;
    --input-border-width: 2px;
    --input-border-color: #718096;
    --outline-width: 3px;
    --outline-color: #ecc94b;
    --menu-background: var(--input-background);
    --menu-max-height: 16em;
    --item-color: #000;
    --item-background: #fff;
    --item-active-color: #fff;
    --item-active-background: #111;
    --caret-color: var(--input-color);
    --item-padding: 0.5em;
    display: inline-block;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  ::slotted(*),
  .vhide {
    border: 0;
    clip: rect(0 0 0 0);
    height: 1px;
    margin: -1px;
    overflow: hidden;
    padding: 0;
    position: absolute;
    width: 1px;
  }

  .hide {
    display: none;
  }

  :host > * {
    position: relative;
    --input-border: var(--input-border-width) solid var(--input-border-color);
  }

  input {
    border-radius: 0;
    width: 100%;
    font: inherit;
    line-height: inherit;
    color: var(--input-color);
    background: var(--input-background);
    padding: var(--item-padding);
    border: var(--input-border);
  }

  input.focus {
    outline: var(--outline-width) solid var(--outline-color);
  }

  svg {
    position: absolute;
    width: 1.5em;
    right: 0;
    fill: var(--caret-color);
    transform: translate(-50%, 50%);
    cursor: default;
  }

  ul {
    max-height: var(--menu-max-height);
    overflow-y: auto;
    position: absolute;
    top: 100%;
    width: 100%;
    z-index: 2;
    background-color: var(--menu-background);
    border: var(--input-border);
  }

  li {
    padding: var(--item-padding);
    display: block;
    outline: none;
    color: var(--item-color);
    background-color: var(--item-background);
    border-bottom: var(--input-border);
    border-width: 1px;
  }

  li:hover,
  li[aria-selected="true"] {
    color: var(--item-active-color);
    background-color: var(--item-active-background);
    cursor: default;
  }

  .empty {
    cursor: not-allowed;
  }
`;
