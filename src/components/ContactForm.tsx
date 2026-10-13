"use client";

import { FormEvent, useState } from "react";
import { ContactErrors, ContactInput, validateContact } from "@/lib/validateContact";

const emptyForm: ContactInput = {
  name: "",
  email: "",
  message: "",
};

export default function ContactForm() {
  const [values, setValues] = useState<ContactInput>(emptyForm);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const updateField = (field: keyof ContactInput, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setSubmitted(false);
    // Clear a field's error once the user starts fixing it
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validationErrors = validateContact(values);
    if (Object.keys(validationErrors).length > 0) {
      // Block submission: show every error and no confirmation
      setErrors(validationErrors);
      setSubmitted(false);
      return;
    }

    setErrors({});
    setValues(emptyForm);
    setSubmitted(true);
  };

  return (
    <form id="contact-form" onSubmit={handleSubmit} noValidate className="form">
      <div className="form-field">
        <label htmlFor="name">Name:</label>
        <input
          id="name"
          name="name"
          type="text"
          required
          value={values.name}
          onChange={(e) => updateField("name", e.target.value)}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "name-error" : undefined}
        />
        {errors.name && (
          <p id="name-error" role="alert" className="field-error">
            {errors.name}
          </p>
        )}
      </div>

      <div className="form-field">
        <label htmlFor="email">Email:</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={values.email}
          onChange={(e) => updateField("email", e.target.value)}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
        />
        {errors.email && (
          <p id="email-error" role="alert" className="field-error">
            {errors.email}
          </p>
        )}
      </div>

      <div className="form-field">
        <label htmlFor="message">Message:</label>
        <textarea
          id="message"
          name="message"
          rows={4}
          required
          value={values.message}
          onChange={(e) => updateField("message", e.target.value)}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "message-error" : undefined}
        />
        {errors.message && (
          <p id="message-error" role="alert" className="field-error">
            {errors.message}
          </p>
        )}
      </div>

      <input type="submit" value="Submit" />

      {submitted && (
        <p role="status" className="status-success">
          Submission completed! Thanks for reaching out — we&apos;ll get back to you soon.
        </p>
      )}
    </form>
  );
}
