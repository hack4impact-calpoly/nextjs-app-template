import { isOfferingCategory } from "@/lib/offerings";
import styles from "@/styles/manage-offerings.module.css";
import { DEFAULT_SPECIAL_OFFER, OFFERING_INPUT_LIMITS, type OfferingCategory } from "@/types/offering";

export type OfferingFormValues = {
  name: string;
  description: string;
  price: string;
  category: OfferingCategory;
};

type OfferingFormProps = {
  formValues: OfferingFormValues;
  errors: Record<string, string>;
  isSubmitting: boolean;
  onFieldChange: <K extends keyof OfferingFormValues>(field: K, value: OfferingFormValues[K]) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>, specialOffer: boolean) => Promise<void>;
  specialOffer?: boolean;
  submitLabel?: string;
};

export default function OfferingForm({
  formValues,
  errors,
  isSubmitting,
  onFieldChange,
  onSubmit,
  specialOffer = DEFAULT_SPECIAL_OFFER,
  submitLabel = "Save offering",
}: OfferingFormProps) {
  return (
    <form className={styles.form} onSubmit={(event) => onSubmit(event, specialOffer)} noValidate>
      <div className={styles.field}>
        <label htmlFor="offering-name">Name</label>
        <input
          id="offering-name"
          disabled={isSubmitting}
          className={styles.input}
          type="text"
          value={formValues.name}
          maxLength={OFFERING_INPUT_LIMITS.name}
          aria-describedby={errors.name ? "offering-name-error" : undefined}
          onChange={(event) => onFieldChange("name", event.target.value)}
          aria-invalid={Boolean(errors.name)}
        />
        {errors.name ? (
          <p id="offering-name-error" className={styles.inlineError}>
            {errors.name}
          </p>
        ) : null}
      </div>

      <div className={styles.field}>
        <label htmlFor="offering-description">Description</label>
        <textarea
          id="offering-description"
          disabled={isSubmitting}
          className={styles.textarea}
          value={formValues.description}
          maxLength={OFFERING_INPUT_LIMITS.description}
          aria-describedby={errors.description ? "offering-description-error" : undefined}
          onChange={(event) => onFieldChange("description", event.target.value)}
          aria-invalid={Boolean(errors.description)}
        />
        {errors.description ? (
          <p id="offering-description-error" className={styles.inlineError}>
            {errors.description}
          </p>
        ) : null}
      </div>

      <div className={styles.field}>
        <label htmlFor="offering-price">Price</label>
        <input
          id="offering-price"
          disabled={isSubmitting}
          className={styles.input}
          type="number"
          min="0"
          step="0.01"
          value={formValues.price}
          aria-describedby={errors.price ? "offering-price-error" : undefined}
          onChange={(event) => onFieldChange("price", event.target.value)}
          aria-invalid={Boolean(errors.price)}
        />
        {errors.price ? (
          <p id="offering-price-error" className={styles.inlineError}>
            {errors.price}
          </p>
        ) : null}
      </div>

      <div className={styles.field}>
        <label htmlFor="offering-category">Category</label>
        <select
          id="offering-category"
          disabled={isSubmitting}
          className={styles.select}
          value={formValues.category}
          aria-describedby={errors.category ? "offering-category-error" : undefined}
          onChange={(event) => {
            const category = event.target.value;
            if (isOfferingCategory(category)) {
              onFieldChange("category", category);
            }
          }}
          aria-invalid={Boolean(errors.category)}
        >
          <option value="Coffee">Coffee</option>
          <option value="Tea">Tea</option>
          <option value="Smoothie">Smoothie</option>
        </select>
        {errors.category ? (
          <p id="offering-category-error" className={styles.inlineError}>
            {errors.category}
          </p>
        ) : null}
      </div>

      <button type="submit" className={styles.button} disabled={isSubmitting}>
        {isSubmitting ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
