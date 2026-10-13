import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";
import React, { act } from "react";
import { JSDOM } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
Object.defineProperty(globalThis, "navigator", { value: dom.window.navigator, configurable: true });
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
// Node does not load CSS Modules; styles are irrelevant to these interaction checks.
const require = createRequire(import.meta.url);
require.extensions[".css"] = (module) => {
  module.exports = {};
};
// tsx uses classic JSX for this Next.js project's preserve setting.
globalThis.React = React;
const { createRoot } = await import("react-dom/client");
const OfferingForm = require("../src/components/OfferingForm.tsx").default;
const ManageOfferingsPage = require("../src/components/ManageOfferings.tsx").default;
const { submitOffering } = require("../src/lib/offerings.ts");
const values = { name: "Latte", description: "Espresso and milk", price: "4.25", category: "Coffee" };

async function mount(component) {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  await act(async () => root.render(component));
  return {
    container,
    async cleanup() {
      await act(async () => root.unmount());
      container.remove();
    },
  };
}

test("the reusable form sends its supplied special flag and defaults omission to false", async () => {
  const originalFetch = globalThis.fetch;
  const sent = [];
  globalThis.fetch = async (_url, init) => {
    const input = JSON.parse(init.body);
    sent.push(input);
    return new Response(JSON.stringify({ ID: "saved", ...input }), { status: 201 });
  };
  try {
    for (const props of [{ specialOffer: true }, { specialOffer: false }, {}]) {
      const mounted = await mount(
        React.createElement(OfferingForm, {
          formValues: values,
          errors: {},
          isSubmitting: false,
          onFieldChange() {},
          async onSubmit(event, specialOffer) {
            event.preventDefault();
            await submitOffering({ ...values, price: 4.25, specialOffer });
          },
          ...props,
        }),
      );
      try {
        await act(async () => {
          mounted.container
            .querySelector("form")
            .dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true }));
        });
      } finally {
        await mounted.cleanup();
      }
    }
    assert.deepEqual(
      sent.map((input) => input.specialOffer),
      [true, false, false],
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("pending saves lock every control, prevent duplicates, retain failures, and clear confirmed saves", async () => {
  const originalFetch = globalThis.fetch;
  try {
    for (const succeeds of [false, true]) {
      let resolveSave;
      let postCount = 0;
      let getCount = 0;
      let submitted;
      globalThis.fetch = async (_url, init) => {
        if (init.method === "POST") {
          postCount++;
          submitted = JSON.parse(init.body);
          return new Promise((resolve) => {
            resolveSave = resolve;
          });
        }
        getCount++;
        return getCount === 1
          ? new Response("[]", { status: 200 })
          : new Response(JSON.stringify({ error: { message: "Refresh unavailable." } }), { status: 503 });
      };
      const mounted = await mount(React.createElement(ManageOfferingsPage));
      const field = (id) => mounted.container.querySelector(`#${id}`);
      try {
        await act(async () => {
          for (const [id, value] of [
            ["offering-name", "Latte"],
            ["offering-description", "Espresso and milk"],
            ["offering-price", "4.25"],
          ]) {
            const element = field(id);
            const prototype =
              element.tagName === "TEXTAREA" ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
            Object.getOwnPropertyDescriptor(prototype, "value").set.call(element, value);
            element.dispatchEvent(new window.Event("input", { bubbles: true }));
          }
          mounted.container.querySelector('input[type="checkbox"]').click();
        });
        const form = mounted.container.querySelector("form");
        await act(async () => form.dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true })));
        assert.equal(postCount, 1);
        assert.equal(submitted.specialOffer, true);
        for (const control of mounted.container.querySelectorAll("input, textarea, select, button")) {
          assert.equal(
            control.matches(":disabled"),
            true,
            `${control.id || control.tagName} must be disabled while saving`,
          );
        }
        await act(async () => form.dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true })));
        assert.equal(postCount, 1);
        await act(async () =>
          resolveSave(
            succeeds
              ? new Response(JSON.stringify({ ID: "saved", ...submitted }), { status: 201 })
              : new Response(JSON.stringify({ error: { message: "Save unavailable." } }), { status: 503 }),
          ),
        );
        assert.equal(field("offering-name").value, succeeds ? "" : "Latte");
        assert.equal(field("offering-description").value, succeeds ? "" : "Espresso and milk");
        assert.equal(field("offering-price").value, succeeds ? "" : "4.25");
        assert.equal(mounted.container.querySelector('input[type="checkbox"]').checked, !succeeds);
        assert.equal(field("offering-name").matches(":disabled"), false);
        assert.match(
          mounted.container.textContent,
          succeeds ? /Offering saved, but the list could not refresh/ : /Save unavailable/,
        );
        assert.equal(getCount, succeeds ? 2 : 1);
      } finally {
        await mounted.cleanup();
      }
    }
  } finally {
    globalThis.fetch = originalFetch;
  }
});
