export type ContactField = "name" | "email" | "message";
export type ContactErrors = Partial<Record<ContactField, string>>;

export interface ContactInput {
  name: string;
  email: string;
  message: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// validates contact form data. kept separate from the component so it can be reused by an API route later
export function validateContact(input: ContactInput): ContactErrors {
  const errors: ContactErrors = {};

  //checks name field is present and not too long
  const name = input.name.trim();
  if (!name) {
    errors.name = "Name is required.";
  } else if (name.length > 100) {
    errors.name = "Name must be 100 characters or fewer.";
  }

  //checks email field is present and in a valid format
  const email = input.email.trim();
  if (!email) {
    errors.email = "Email is required.";
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = "Please enter a valid email address.";
  }

  //checks message field is present and not too long
  const message = input.message.trim();
  if (!message) {
    errors.message = "Message is required.";
  } else if (message.length > 1000) {
    errors.message = "Message must be 1000 characters or fewer.";
  }

  return errors;
}
