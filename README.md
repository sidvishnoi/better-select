# better-select

A progressively enhanced, lightweight, customizable, and accessible `<select>` custom element with text input.

## Features

### Lightweight

A single file, weighing only 7KB (2.6KB gzip), and having no dependencies.

### Accessible

Based on Adam Silver's article [Building an accessible auto-complete control](https://adamsilver.io/articles/building-an-accessible-autocomplete-control/), and some improvements of my own.

### Progressively enhanced

All you need to do is wrap your `<select>` element inside a `<better-select>` element, and the `<select>` will be enhanced. If for some reason, your JavaScript fails to load (or until it loads), users will still be able to access a working `<select>` menu. You don't need to change your forms input handling either.

## Basic Usage

```html
<script src="./better-select.js" type="module"></script>

<better-select>
  <select name="country" id="country">
    <option value="">Select</option>
    <option value="in">India</option>
    <option value="au">Australia</option>
    <option value="ja">Japan</option>
  </select>
</better-select>
```

You can import better-select.js from CDNs like [unpkg](https://unpkg.com/better-select/better-select.js). The package is also available on [npm](https://www.npmjs.com/package/better-select).

## Advanced Usage

### Need to use some other name for custom element?

```html
<script type="module">
  import BetterSelect from "./better-select.js";
  customElements.define("my-better-select", BetterSelect);
</script>
```

### Styling?

The custom element can be styled using CSS custom properties. Following properties are presently available along with their default values:

```css
better-select {
  /* input box */
  --input-color: #000;
  --input-background: #fff;
  --input-border-width: 2px;
  --input-border-color: #718096;
  /* focused/active input box */
  --focus-outline-width: 3px;
  --focus-outline-color: #ecc94b;
  /* options list wrapper */
  --menu-max-height: 16em;
  /* options */
  --item-padding: 0.5em;
  --item-color: #000;
  --item-background: #fff;
  --item-color-active: #fff;
  --item-background-active: #111;
  /* dropdown arrow */
  --caret-color: var(--input-color);
}
```

### Custom filter function

**Method 1:** Extend `isMatch` method of `BetterSelect` class:

```js
import BetterSelect from "./better-select.js";

class MyBetterSelect extends BetterSelect {
  constructor() {
    super();
  }

  /**
   * @param {HTMLOptionElement} option an option from select element
   * @param {string} value the value user has typed
   * @returns {boolean} whether this option be listed or not
   */
  isMatch(option, value) {
    return option.getAttribute("data-value").startsWith(value);
  }
}

customElements.define("my-better-select", MyBetterSelect);
```

**Method 2:** Add a globally available function name as an attribute to the element

```html
<better-select match="myMatcherFunction">
  <select name="country" id="country">
    <option value="in">India</option>
    <!-- … -->
  </select>
</better-select>

<script>
  function myMatcherFunction(option, value) {
    return option.value.startsWith(value);
  }
</script>
```

## Contributing

- Reporting issues is welcome.
- Sending pull requests is more welcome.
