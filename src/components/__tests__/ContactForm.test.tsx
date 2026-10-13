import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import ContactForm from "@/components/ContactForm";

describe("ContactForm", () => {
  it("renders the name, email, and message fields", () => {
    render(<ContactForm />);

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
  });

  it("shows validation errors and no confirmation when submitted empty", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    await user.click(screen.getByRole("button", { name: /submit/i }));

    expect(screen.getByText("Name is required.")).toBeInTheDocument();
    expect(screen.getByText("Email is required.")).toBeInTheDocument();
    expect(screen.getByText("Message is required.")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("shows an email error and no confirmation for an invalid email", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    await user.type(screen.getByLabelText(/name/i), "Jane Doe");
    await user.type(screen.getByLabelText(/email/i), "not-an-email");
    await user.type(screen.getByLabelText(/message/i), "Hello!");
    await user.click(screen.getByRole("button", { name: /submit/i }));

    expect(screen.getByText("Please enter a valid email address.")).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toHaveAttribute("aria-invalid", "true");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("shows the completion message and clears the fields for valid data", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    await user.type(screen.getByLabelText(/name/i), "Jane Doe");
    await user.type(screen.getByLabelText(/email/i), "jane@example.com");
    await user.type(screen.getByLabelText(/message/i), "Love the milk tea!");
    await user.click(screen.getByRole("button", { name: /submit/i }));

    expect(screen.getByRole("status")).toHaveTextContent(/submission completed/i);
    expect(screen.queryAllByRole("alert")).toHaveLength(0);
    expect(screen.getByLabelText(/name/i)).toHaveValue("");
    expect(screen.getByLabelText(/email/i)).toHaveValue("");
    expect(screen.getByLabelText(/message/i)).toHaveValue("");
  });
});
