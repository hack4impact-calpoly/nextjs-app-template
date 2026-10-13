// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import ManageOfferings from "@/components/ManageOfferings";

// Aditi's three issue #34 cases; agent reconciliation updates the component seam
// and extends the successful-reset case to cover category restoration.

afterEach(cleanup);

function mockOfferingsApi() {
  const fetchMock = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
    if (!init || init.method === "GET") {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    throw new Error(`Unexpected ${init.method} request`);
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

it("rejects invalid submission before sending a write request", async () => {
  const fetchMock = mockOfferingsApi();
  render(<ManageOfferings />);

  await waitFor(() => expect(fetchMock).toHaveBeenCalled());
  fireEvent.click(screen.getByRole("button", { name: /save offering/i }));

  expect(screen.getByText("Name is required.").textContent).toBe("Name is required.");
  expect(screen.getByText("Description is required.").textContent).toBe("Description is required.");
  expect(screen.getByText("Price must be a valid number.").textContent).toBe("Price must be a valid number.");
  expect(fetchMock.mock.calls.some(([, init]) => init?.method === "POST")).toBe(false);
});

it("clears only the corrected field error after a user fixes one input", async () => {
  const fetchMock = mockOfferingsApi();
  render(<ManageOfferings />);

  await waitFor(() => expect(fetchMock).toHaveBeenCalled());
  fireEvent.click(screen.getByRole("button", { name: /save offering/i }));
  expect(screen.getByText("Name is required.").textContent).toBe("Name is required.");
  expect(screen.getByText("Description is required.").textContent).toBe("Description is required.");

  fireEvent.change(screen.getByRole("textbox", { name: /name/i }), { target: { value: "Latte" } });

  expect(screen.queryByText("Name is required.")).toBeNull();
  expect(screen.getByText("Description is required.").textContent).toBe("Description is required.");
});

it("resets the form and special-offer checkbox after a successful save", async () => {
  const fetchMock = mockOfferingsApi();
  fetchMock.mockImplementation(async (_input, init) => {
    if (!init || init.method === "GET") {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (init.method === "POST") {
      return new Response(
        JSON.stringify({
          ID: "created-1",
          name: "Honey Cinnamon Latte",
          description: "Velvety latte with a touch of cinnamon.",
          price: 6.5,
          category: "Coffee",
          specialOffer: true,
        }),
        { status: 201, headers: { "Content-Type": "application/json" } },
      );
    }

    throw new Error(`Unexpected ${init.method} request`);
  });
  render(<ManageOfferings />);

  await waitFor(() => expect(fetchMock).toHaveBeenCalled());
  fireEvent.change(screen.getByRole("textbox", { name: /name/i }), {
    target: { value: "Honey Cinnamon Latte" },
  });
  fireEvent.change(screen.getByRole("textbox", { name: /description/i }), {
    target: { value: "Velvety latte with a touch of cinnamon." },
  });
  fireEvent.change(screen.getByRole("spinbutton", { name: /price/i }), { target: { value: "6.5" } });
  fireEvent.change(screen.getByRole("combobox", { name: /category/i }), { target: { value: "Tea" } });
  fireEvent.click(screen.getByRole("checkbox", { name: /special offer/i }));
  fireEvent.click(screen.getByRole("button", { name: /save offering/i }));

  await waitFor(() => expect(fetchMock.mock.calls.some(([, init]) => init?.method === "POST")).toBe(true));
  await waitFor(() => {
    expect((screen.getByRole("textbox", { name: /name/i }) as HTMLInputElement).value).toBe("");
    expect((screen.getByRole("textbox", { name: /description/i }) as HTMLTextAreaElement).value).toBe("");
    expect((screen.getByRole("spinbutton", { name: /price/i }) as HTMLInputElement).value).toBe("");
    expect((screen.getByRole("combobox", { name: /category/i }) as HTMLSelectElement).value).toBe("Coffee");
    expect((screen.getByRole("checkbox", { name: /special offer/i }) as HTMLInputElement).checked).toBe(false);
  });
});
