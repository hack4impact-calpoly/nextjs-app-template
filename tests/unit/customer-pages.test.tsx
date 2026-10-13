// @vitest-environment jsdom
import React from "react";
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import OfferingsPage from "@/components/OfferingsPage";
import { jsonResponse, sampleOffering } from "./helpers/offerings";

afterEach(cleanup);
const props = { title: "Menu", intro: "Our drinks", emptyMessage: "No offerings yet." };
const item = {
  ID: "saved",
  name: "Latte",
  description: "Espresso and milk",
  price: 4.25,
  category: "Coffee",
  specialOffer: false,
};
const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });

// Agent-written foundation/reference coverage, not a personal contribution.
it("announces loading while a request is pending", () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(() => new Promise(() => {})),
  );
  render(<OfferingsPage {...props} />);
  expect(screen.getByRole("status").textContent).toBe("Loading menu...");
});

it("filters Specials by the saved boolean flag", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(response([item, { ...item, ID: "special", name: "Seasonal latte", specialOffer: true }])),
  );
  render(<OfferingsPage {...props} title="Specials" specialsOnly />);
  await screen.findByRole("heading", { name: "Seasonal latte" });
  expect(screen.queryByRole("heading", { name: "Latte" })).toBeNull();
});

it("treats malformed success data as an error rather than crashing the page", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response([{ ...item, price: "4.25" }])));
  render(<OfferingsPage {...props} />);
  expect((await screen.findByRole("alert")).textContent).toBe("Unable to load menu.");
});

it("shows an empty state for an empty successful response", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response([])));
  render(<OfferingsPage {...props} />);
  await screen.findByText("No offerings yet.");
  expect(screen.queryByRole("alert")).toBeNull();
});

it("shows a readable failure and can retry successfully", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValueOnce(response({ error: { message: "Please try again." } }, 503))
      .mockResolvedValueOnce(response([item])),
  );
  render(<OfferingsPage {...props} />);
  expect((await screen.findByRole("alert")).textContent).toBe("Please try again.");
  expect(screen.queryByText("No offerings yet.")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  await screen.findByRole("heading", { name: "Latte" });
  expect(screen.queryByRole("alert")).toBeNull();
});

// Vedika's three contributed cases from PR #39; keep separate from agent coverage.
it("Specials shows empty feedback when none are special", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse([sampleOffering])));

  render(
    <OfferingsPage {...props} title="Specials" emptyMessage="No specials are available right now." specialsOnly />,
  );

  expect(await screen.findByText("No specials are available right now.")).toBeTruthy();
  expect(screen.queryByText("Latte")).toBeNull();
});

it("network failure shows error instead of empty menu", async () => {
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

  render(<OfferingsPage {...props} />);

  expect(await screen.findByText("Unable to load menu.")).toBeTruthy();
  expect(screen.queryByText(props.emptyMessage)).toBeNull();
});

it("unreadable API errors show useful fallback feedback", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("not json", { status: 500 })));

  render(<OfferingsPage {...props} />);

  expect(await screen.findByText("Unable to load menu.")).toBeTruthy();
  expect(screen.queryByText(props.emptyMessage)).toBeNull();
});

// Agent-added regression coverage, not a personal contribution.
it("clears a previous error and announces loading when the title changes", async () => {
  let finishRequest!: (response: Response) => void;
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValueOnce(response({ error: { message: "Please try again." } }, 503))
      .mockReturnValueOnce(new Promise<Response>((resolve) => (finishRequest = resolve))),
  );
  const { rerender } = render(<OfferingsPage {...props} />);
  await screen.findByRole("alert");

  rerender(<OfferingsPage {...props} title="Specials" specialsOnly />);
  expect((await screen.findByRole("status")).textContent).toBe("Loading specials...");
  expect(screen.queryByRole("alert")).toBeNull();

  finishRequest(response([{ ...item, specialOffer: true }]));
  await screen.findByRole("heading", { name: "Latte" });
  expect(screen.queryByRole("status")).toBeNull();
});
