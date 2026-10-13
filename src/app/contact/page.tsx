import ContactForm from "@/components/ContactForm";

export default function ContactPage() {
  return (
    <main className="page">
      <h1>Contact Us!</h1>

      <section className="contact-info">
        <h2>Address</h2>
        <dd>
          123 Main Street
          <br />
          San Luis Obispo, CA 93401
        </dd>

        <h2>Email</h2>
        <dd>
          <a href="mailto:hello@krispicafe.com">hello@krispicafe.com</a>
        </dd>

        <h2>Hours</h2>
        <dd>
          Mon–Thu: 11am – 9pm
          <br />
          Fri–Sat: 11am – 11pm
          <br />
          Sun: Closed
        </dd>
      </section>

      <h2>Send us a message</h2>
      <ContactForm />

      <footer className="footer">© 2026 Krispi Cafe | All Rights Reserved</footer>
    </main>
  );
}
