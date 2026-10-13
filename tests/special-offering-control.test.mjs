import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";
import React, { act } from "react";
import { JSDOM } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body></body></html>");
globalThis.window = dom.window;
globalThis.document = dom.window.document;
Object.defineProperty(globalThis, "navigator", { value: dom.window.navigator, configurable: true });
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.React = React;
const require = createRequire(import.meta.url);
require.extensions[".css"] = (module) => {
  module.exports = {};
};
const { createRoot } = await import("react-dom/client");

test("the labeled special control follows its parent and emits true and false", async () => {
  const SpecialOfferingControl = require("../src/components/SpecialOfferingControl.tsx").default;
  const changes = [];
  function Parent() {
    const [checked, setChecked] = React.useState(false);
    return React.createElement(SpecialOfferingControl, {
      checked,
      onChange(next) {
        changes.push(next);
        setChecked(next);
      },
    });
  }
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  try {
    await act(async () => root.render(React.createElement(Parent)));
    const checkbox = container.querySelector('input[type="checkbox"]');
    assert.ok(checkbox.labels[0].textContent.includes("Special offering"));
    assert.equal(checkbox.checked, false);
    await act(async () => checkbox.click());
    assert.equal(checkbox.checked, true);
    await act(async () => checkbox.click());
    assert.equal(checkbox.checked, false);
    assert.deepEqual(changes, [true, false]);
    await act(async () => root.render(React.createElement(SpecialOfferingControl, { checked: true, onChange() {} })));
    assert.equal(container.querySelector("input").checked, true);
  } finally {
    await act(async () => root.unmount());
    container.remove();
    dom.window.close();
  }
});
