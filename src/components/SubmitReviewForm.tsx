"use client";

import { useState, FormEvent } from "react";
import styles from "../styles/review.module.css";

interface SubmitReviewFormProps {
  onSubmitted?: () => void;
}

export default function SubmitReviewForm({ onSubmitted }: SubmitReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    if (rating === 0) {
      setStatus({ type: "error", message: "Please choose a star rating." });
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    setSubmitting(true);
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.get("username"),
          description: formData.get("description"),
          rating,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setStatus({ type: "error", message: data.message ?? "Could not submit your review." });
        return;
      }

      form.reset();
      setRating(0);
      setStatus({ type: "success", message: "Thanks for your review!" });
      onSubmitted?.();
    } catch {
      setStatus({ type: "error", message: "Network error. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.formWrapper}>
      <form className={styles.displayForm} onSubmit={handleSubmit}>
        <label htmlFor="review-username">Username</label>
        <input id="review-username" name="username" className={styles.input} type="text" required />

        <label htmlFor="review-description">Description</label>
        <textarea id="review-description" name="description" className={styles.input} rows={4} required />

        <fieldset className={styles.rating}>
          <legend>Rating</legend>
          <div className={styles.stars} aria-label="Choose a rating from one to five stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={styles.starButton}
                aria-label={`${star} star${star === 1 ? "" : "s"}`}
                aria-pressed={rating === star}
                onClick={() => {
                  setRating(star);
                  setStatus(null);
                }}
              >
                <span aria-hidden="true">{star <= rating ? "★" : "☆"}</span>
              </button>
            ))}
          </div>
        </fieldset>
        <input type="hidden" name="rating" value={rating} />

        {status && (
          <p role="status" className={status.type === "success" ? styles.successMessage : styles.errorMessage}>
            {status.message}
          </p>
        )}

        <button className={styles.submitButton} type="submit" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Review"}
        </button>
      </form>
    </div>
  );
}
