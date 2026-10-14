"use client";

import { useState } from "react";

const emptyForm = {
  name: "",
  phone: "",
  email: "",
  address: "",
  message: "",
};

export default function Contact() {
  const [formData, setFormData] = useState(emptyForm);
  const [confirmation, setConfirmation] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setConfirmation("");
    setErrorMessage("");

    const contact = {
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      address: formData.address.trim(),
      message: formData.message.trim(),
    };

    // address is the only optional field
    if (!contact.name || !contact.phone || !contact.email || !contact.message) {
      setErrorMessage("Please fill in your name, phone, email, and message.");
      return;
    }

    // not saved anywhere yet, the form has no backend
    console.log("Contact form submitted:", contact);

    setConfirmation(`Thanks, ${contact.name}! We got your message and will reply to ${contact.email}.`);
    setFormData(emptyForm);
  }

  return (
    <main className="contact-page">
      <h1>Contact</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Name </label>
          <input id="name" name="name" value={formData.name} onChange={handleChange} required />
        </div>

        <div>
          <label>Phone </label>
          <input id="phone" name="phone" value={formData.phone} onChange={handleChange} required />
        </div>

        <div>
          <label>Email </label>
          <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
        </div>

        <div>
          <label>Address (optional) </label>
          <input id="address" name="address" value={formData.address} onChange={handleChange} />
        </div>

        <div>
          <label>Message </label>
          <textarea id="message" name="message" value={formData.message} onChange={handleChange} required />
        </div>

        <button type="submit">Submit</button>

        {confirmation && (
          <p className="page-message" role="status">
            {confirmation}
          </p>
        )}

        {errorMessage && (
          <p className="page-message" role="alert">
            {errorMessage}
          </p>
        )}
      </form>
    </main>
  );
}
