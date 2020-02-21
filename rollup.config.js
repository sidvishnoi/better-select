import typescript from "@rollup/plugin-typescript";
import taggedMinify from "rollup-plugin-minify-html-literals";
import compiler from "@ampproject/rollup-plugin-closure-compiler";

// remove those fake `css` and `html` tags used for syntax highlighting
function removeTag() {
  return {
    name: "removeTag",
    transform(code, id) {
      return { code: code.replace(/(css|html)\s*`/g, "`") };
    },
  };
}

const isProduction = process.env.NODE_ENV === "production";

/** @type {import("rollup").RollupOptions} */
const config = {
  input: "src/better-select.ts",
  output: {
    dir: ".",
    format: "esm",
  },
  plugins: [
    typescript(),
    isProduction && taggedMinify(),
    removeTag(),
    isProduction && compiler({ compilation_level: "ADVANCED" }),
  ],
};

export default config;
