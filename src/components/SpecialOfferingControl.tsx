"use client";

import { useId } from "react";
import styles from "@/styles/special-offering-control.module.css";

type SpecialOfferingControlProps = {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
};

export default function SpecialOfferingControl({ checked, onChange, disabled = false }: SpecialOfferingControlProps) {
  const id = useId();
  return (
    <label className={styles.control} htmlFor={id}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.currentTarget.checked)}
      />
      <span>Special offering</span>
    </label>
  );
}
