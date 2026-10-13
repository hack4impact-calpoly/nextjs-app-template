"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import OfferingForm, { type OfferingFormValues } from "@/components/OfferingForm";
import SpecialOfferingControl from "@/components/SpecialOfferingControl";
import {
  fetchOfferings,
  OfferingApiError,
  parseOfferingPrice,
  sortOfferings,
  submitOffering,
  validateOfferingInput,
  updateOffering,
  deleteOffering,
} from "@/lib/offerings";
import { DEFAULT_SPECIAL_OFFER, type CreateOfferingInput, type Offering } from "@/types/offering";
import styles from "@/styles/manage-offerings.module.css";

const initialFormState: OfferingFormValues = {
  name: "",
  description: "",
  price: "",
  category: "Coffee",
};

export default function ManageOfferings() {
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [formValues, setFormValues] = useState<OfferingFormValues>(initialFormState);
  const [specialOffer, setSpecialOffer] = useState(DEFAULT_SPECIAL_OFFER);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pending = useRef(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    tone: "info" | "success" | "error";
    text: string;
  } | null>(null);

  const loadOfferings = useCallback(async () => {
    setIsLoading(true);
    try {
      const nextOfferings = await fetchOfferings();
      setOfferings(sortOfferings(nextOfferings));
      setLoadError("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "The offering list could not be loaded.";
      setLoadError(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOfferings().catch(() => undefined);
  }, [loadOfferings]);

  const updateField = <K extends keyof OfferingFormValues>(field: K, value: OfferingFormValues[K]) => {
    setFormValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>, submittedSpecialOffer: boolean) => {
    event.preventDefault();
    if (pending.current) {
      return;
    }

    const submission: Partial<CreateOfferingInput> = {
      name: formValues.name,
      description: formValues.description,
      category: formValues.category,
      price: parseOfferingPrice(formValues.price),
      specialOffer: submittedSpecialOffer,
    };

    const nextErrors = validateOfferingInput(submission);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setFeedback({
        tone: "error",
        text: "Please fix the highlighted fields before saving.",
      });
      return;
    }

    const savedAttempt = { ...formValues };
    pending.current = true;
    setIsSubmitting(true);
    setFeedback({ tone: "info", text: "Saving offering..." });
    setErrors({});

    try {
      const createdOffering = editingId
        ? await updateOffering(editingId, submission)
        : await submitOffering(submission);
      setOfferings((current) =>
        sortOfferings([...current.filter((offering) => offering.ID !== createdOffering.ID), createdOffering]),
      );
      setFormValues(initialFormState);
      setSpecialOffer(DEFAULT_SPECIAL_OFFER);
      setEditingId(null);
      setFeedback({
        tone: "success",
        text: editingId ? "Offering updated successfully." : "Offering saved successfully.",
      });

      try {
        await loadOfferings();
      } catch {
        setFeedback({
          tone: "success",
          text: "Offering saved, but the list could not refresh. Please reload the page to confirm the update.",
        });
      }
    } catch (error) {
      setFormValues(savedAttempt);
      if (error instanceof OfferingApiError) {
        setErrors(error.fields);
      }
      setFeedback({
        tone: "error",
        text: error instanceof Error ? error.message : "The offering could not be saved.",
      });
    } finally {
      pending.current = false;
      setIsSubmitting(false);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormValues(initialFormState);
    setSpecialOffer(DEFAULT_SPECIAL_OFFER);
    setErrors({});
  };

  const beginEdit = (offering: Offering) => {
    setEditingId(offering.ID);
    setFormValues({
      name: offering.name,
      description: offering.description,
      price: String(offering.price),
      category: offering.category,
    });
    setSpecialOffer(offering.specialOffer);
    setErrors({});
    setFeedback(null);
    setDeletingId(null);
    document.getElementById("offering-name")?.focus();
  };

  const confirmDelete = async (offering: Offering) => {
    if (pending.current) return;
    pending.current = true;
    setIsSubmitting(true);
    setFeedback({ tone: "info", text: "Deleting offering..." });
    try {
      await deleteOffering(offering.ID);
      setOfferings((current) => current.filter((item) => item.ID !== offering.ID));
      if (editingId === offering.ID) cancelEdit();
      setDeletingId(null);
      setFeedback({ tone: "success", text: "Offering deleted successfully." });
      try {
        await loadOfferings();
      } catch {
        setFeedback({
          tone: "success",
          text: "Offering deleted, but the list could not refresh. Please retry loading the list.",
        });
      }
    } catch (error) {
      setFeedback({
        tone: "error",
        text: error instanceof Error ? error.message : "The offering could not be deleted.",
      });
    } finally {
      pending.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1>Manage offerings</h1>
        <p>Add, edit, and remove offerings shown on the Menu and Specials pages.</p>
      </header>

      {feedback ? (
        <div
          role={feedback.tone === "error" ? "alert" : "status"}
          aria-live="polite"
          className={`${styles.feedback} ${
            feedback.tone === "success"
              ? styles.feedbackSuccess
              : feedback.tone === "error"
                ? styles.feedbackError
                : styles.feedbackInfo
          }`}
        >
          {feedback.text}
        </div>
      ) : null}

      <div className={styles.layout}>
        <section className={styles.panel} aria-label="Offerings list">
          <h2>Current offerings</h2>

          {isLoading ? (
            <p role="status" className={styles.helperText}>
              Loading current offerings…
            </p>
          ) : loadError ? (
            <div>
              <p role="alert" className={styles.inlineError}>
                {loadError}
              </p>
              <button
                className={styles.button}
                disabled={isSubmitting}
                onClick={() => void loadOfferings().catch(() => undefined)}
              >
                Retry loading offerings
              </button>
            </div>
          ) : offerings.length === 0 ? (
            <div className={styles.empty}>No offerings are available right now.</div>
          ) : (
            <div className={styles.list}>
              {offerings.map((offering) => (
                <article key={offering.ID} className={styles.offerItem}>
                  <h3>{offering.name}</h3>
                  <div className={styles.offerMeta}>
                    <span>{offering.category}</span>
                    <span>{`$${offering.price.toFixed(2)}`}</span>
                    {offering.specialOffer ? <span className={styles.badge}>Special offer</span> : null}
                  </div>
                  <p>{offering.description}</p>
                  <div className={styles.actions}>
                    <button
                      className={styles.button}
                      disabled={isSubmitting}
                      aria-label={`Edit ${offering.name}`}
                      onClick={() => beginEdit(offering)}
                    >
                      Edit
                    </button>
                    <button
                      className={styles.button}
                      disabled={isSubmitting}
                      aria-label={`Delete ${offering.name}`}
                      onClick={() => setDeletingId(offering.ID)}
                    >
                      Delete
                    </button>
                  </div>
                  {deletingId === offering.ID && (
                    <div
                      className={styles.confirmation}
                      role="group"
                      aria-label={`Confirm deletion of ${offering.name}`}
                    >
                      <p>Delete {offering.name}? This removes it from the customer pages.</p>
                      <div className={styles.actions}>
                        <button
                          className={styles.button}
                          disabled={isSubmitting}
                          onClick={() => void confirmDelete(offering)}
                        >
                          Confirm delete
                        </button>
                        <button className={styles.button} disabled={isSubmitting} onClick={() => setDeletingId(null)}>
                          Cancel deletion
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        <section className={styles.panel} aria-label={editingId ? "Edit offering form" : "Create offering form"}>
          <h2>{editingId ? "Edit offering" : "Add offering"}</h2>

          <SpecialOfferingControl checked={specialOffer} onChange={setSpecialOffer} disabled={isSubmitting} />

          <OfferingForm
            formValues={formValues}
            errors={errors}
            isSubmitting={isSubmitting}
            onFieldChange={updateField}
            onSubmit={handleSubmit}
            specialOffer={specialOffer}
            submitLabel={editingId ? "Save changes" : "Save offering"}
          />
          {editingId && (
            <button className={styles.button} disabled={isSubmitting} onClick={cancelEdit}>
              Cancel editing
            </button>
          )}
        </section>
      </div>
    </main>
  );
}
