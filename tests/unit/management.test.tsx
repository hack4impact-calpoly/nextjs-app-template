// @vitest-environment jsdom
import React from "react";
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import ManageOfferings from "@/components/ManageOfferings";

const offering = {
  ID: "0123456789abcdef01234567",
  name: "Latte",
  description: "Espresso and milk",
  price: 4.25,
  category: "Coffee",
  specialOffer: false,
};
const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
afterEach(cleanup);

it("keeps the form usable when a failed API returns malformed display fields", async () => {
  const fetcher = vi
    .fn()
    .mockResolvedValueOnce(response([]))
    .mockResolvedValueOnce(
      response(
        { error: { message: {}, fields: { name: { invalid: true }, description: "Try a shorter description." } } },
        503,
      ),
    );
  vi.stubGlobal("fetch", fetcher);
  render(<ManageOfferings />);
  await screen.findByText("No offerings are available right now.");
  fireEvent.change(screen.getByLabelText("Name"), { target: { value: "New latte" } });
  fireEvent.change(screen.getByLabelText("Description"), { target: { value: "Oat milk" } });
  fireEvent.change(screen.getByLabelText("Price"), { target: { value: "4.25" } });
  fireEvent.click(screen.getByRole("button", { name: "Save offering" }));
  await screen.findByText("The offering could not be saved.");
  expect(screen.getByText("Try a shorter description.")).toBeTruthy();
  expect((screen.getByLabelText("Name") as HTMLInputElement).value).toBe("New latte");
});

it("edits the selected offering and sends its persisted identity", async () => {
  const fetcher = vi
    .fn()
    .mockResolvedValueOnce(response([offering]))
    .mockResolvedValueOnce(response({ ...offering, name: "Oat latte" }))
    .mockResolvedValueOnce(response([{ ...offering, name: "Oat latte" }]));
  vi.stubGlobal("fetch", fetcher);
  render(<ManageOfferings />);
  fireEvent.click(await screen.findByRole("button", { name: "Edit Latte" }));
  const name = screen.getByLabelText("Name");
  expect((name as HTMLInputElement).value).toBe("Latte");
  fireEvent.change(name, { target: { value: "Oat latte" } });
  fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
  await screen.findByText("Offering updated successfully.");
  expect(fetcher.mock.calls[1][0]).toBe(`/api/offerings/${offering.ID}`);
  expect(fetcher.mock.calls[1][1].method).toBe("PUT");
  await waitFor(() => expect(screen.queryByRole("button", { name: "Edit Latte" })).toBeNull());
});

it("requires confirmation before deleting an offering", async () => {
  const fetcher = vi
    .fn()
    .mockResolvedValueOnce(response([offering]))
    .mockResolvedValueOnce(new Response(null, { status: 204 }))
    .mockResolvedValueOnce(response([]));
  vi.stubGlobal("fetch", fetcher);
  render(<ManageOfferings />);
  fireEvent.click(await screen.findByRole("button", { name: "Delete Latte" }));
  expect(fetcher).toHaveBeenCalledTimes(1);
  expect(screen.getByRole("group", { name: "Confirm deletion of Latte" })).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Confirm delete" }));
  await screen.findByText("Offering deleted successfully.");
  await screen.findByText("No offerings are available right now.");
  expect(fetcher.mock.calls[1][1].method).toBe("DELETE");
});

it("locks all inputs during saving and retains values after failure", async () => {
  let finishSave!: (value: Response) => void;
  const fetcher = vi
    .fn()
    .mockResolvedValueOnce(response([]))
    .mockImplementationOnce(
      () =>
        new Promise<Response>((resolve) => {
          finishSave = resolve;
        }),
    );
  vi.stubGlobal("fetch", fetcher);
  render(<ManageOfferings />);
  await screen.findByText("No offerings are available right now.");
  fireEvent.change(screen.getByLabelText("Name"), { target: { value: "New latte" } });
  fireEvent.change(screen.getByLabelText("Description"), { target: { value: "Oat milk" } });
  fireEvent.change(screen.getByLabelText("Price"), { target: { value: "4.25" } });
  fireEvent.click(screen.getByRole("checkbox", { name: "Special offering" }));
  fireEvent.click(screen.getByRole("button", { name: "Save offering" }));
  expect((screen.getByLabelText("Name") as HTMLInputElement).disabled).toBe(true);
  expect((screen.getByRole("checkbox") as HTMLInputElement).disabled).toBe(true);
  finishSave(response({ error: { message: "Saving is unavailable." } }, 503));
  await screen.findByText("Saving is unavailable.");
  expect((screen.getByLabelText("Name") as HTMLInputElement).value).toBe("New latte");
  expect((screen.getByRole("checkbox") as HTMLInputElement).checked).toBe(true);
  expect(screen.getByRole("button", { name: "Save offering" }).hasAttribute("disabled")).toBe(false);
});

it("reports successful saving separately from a failed list reload", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValueOnce(response([offering]))
      .mockResolvedValueOnce(response(offering, 201))
      .mockResolvedValueOnce(response({ error: { message: "Reload failed." } }, 503)),
  );
  render(<ManageOfferings />);
  await screen.findByRole("button", { name: "Edit Latte" });
  for (const [label, value] of [
    ["Name", "Latte"],
    ["Description", "Espresso and milk"],
    ["Price", "4.25"],
  ]) {
    fireEvent.change(screen.getByLabelText(label), { target: { value } });
  }
  fireEvent.click(screen.getByRole("button", { name: "Save offering" }));
  await screen.findByText(
    "Offering saved, but the list could not refresh. Please reload the page to confirm the update.",
  );
  expect((screen.getByLabelText("Name") as HTMLInputElement).value).toBe("");
  expect(screen.getByRole("button", { name: "Retry loading offerings" })).toBeTruthy();
});
