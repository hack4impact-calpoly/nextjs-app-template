import Navbar from "@/app/components/Navbar";
import styles from "./Contacts.module.css";

export default function ContactsPage() {
  return (
    <>
      <Navbar />
      <main className={styles.page}>
        <section className={styles.intro} aria-labelledby="contact-heading">
          <p className={styles.eyebrow}>Get in touch</p>
          <h1 id="contact-heading">Contact us</h1>
          <p className={styles.description}>
            Have a question about memberships, showtimes, or an upcoming visit? Send us a message and our team will get
            back to you soon.
          </p>
        </section>

        <form className={styles.form}>
          <div className={styles.fieldGrid}>
            <div className={styles.field}>
              <label htmlFor="first-name">First name</label>
              <input id="first-name" name="firstName" type="text" autoComplete="given-name" required />
            </div>

            <div className={styles.field}>
              <label htmlFor="last-name">Last name</label>
              <input id="last-name" name="lastName" type="text" autoComplete="family-name" required />
            </div>
          </div>

          <div className={styles.fieldGrid}>
            <div className={styles.field}>
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" autoComplete="email" required />
            </div>

            <div className={styles.field}>
              <label htmlFor="phone">Phone number</label>
              <input id="phone" name="phone" type="tel" autoComplete="tel" />
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="subject">Subject</label>
            <input id="subject" name="subject" type="text" required />
          </div>

          <div className={styles.field}>
            <label htmlFor="message">Message</label>
            <textarea id="message" name="message" rows={6} required />
          </div>

          <button className={styles.submitButton} type="submit">
            Send message
          </button>
        </form>
      </main>
    </>
  );
}
