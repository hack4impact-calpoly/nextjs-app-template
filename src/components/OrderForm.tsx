"use client";

import { useState } from "react";
import { Drink } from "@/types/drink";
import { placeOrder } from "@/lib/orders";
import { validateOrderForm } from "@/lib/orderFormValidation";

export function OrderForm({ drink }: { drink: Drink }) {
  const [customerName, setCustomerName] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedMilk, setSelectedMilk] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasMilkOptions = drink.milkOptions.length > 0;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setConfirmation("");
    setErrorMessage("");

    const trimmedName = customerName.trim();
    if (!trimmedName) {
      setErrorMessage("Please enter a name for the order!");
      return;
    }

    const validation = validateOrderForm(drink, selectedSize, selectedMilk);

    if (!validation.valid) {
      setErrorMessage(validation.error);
      return;
    }

    const selectedSizeOption = validation.sizeOption;

    try {
      setIsSubmitting(true);

      await placeOrder({
        drinkId: drink._id,
        customerName: trimmedName,
        size: selectedSizeOption.size,
        ...(hasMilkOptions ? { milk: selectedMilk } : {}),
      });

      const milkDescription = hasMilkOptions ? ` with ${selectedMilk} milk` : "";

      setConfirmation(`Order placed! You ordered a ${selectedSizeOption.size} ${drink.name}${milkDescription}.`);
      setSelectedSize("");
      setSelectedMilk("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to place your order.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="order-form" onSubmit={handleSubmit}>
      <h2>Create your order:</h2>

      <label>
        Name for the order
        <input
          type="text"
          name="customerName"
          value={customerName}
          maxLength={50}
          autoComplete="given-name"
          onChange={(event) => setCustomerName(event.target.value)}
        />
      </label>

      <fieldset>
        <legend>Size:</legend>
        {drink.sizes.map((option) => (
          <label key={option.size}>
            <input
              type="radio"
              name="size"
              value={option.size}
              checked={selectedSize === option.size}
              onChange={(event) => setSelectedSize(event.target.value)}
            />
            {option.size} (${option.price.toFixed(2)})
          </label>
        ))}
      </fieldset>

      {hasMilkOptions && (
        <label>
          Milk choice:
          <select value={selectedMilk} onChange={(event) => setSelectedMilk(event.target.value)}>
            <option value="">Choose milk</option>

            {drink.milkOptions.map((milk) => (
              <option key={milk} value={milk}>
                {milk}
              </option>
            ))}
          </select>
        </label>
      )}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Placing order..." : "Place order"}
      </button>

      {confirmation && (
        <div className="order-confirmation" role="status">
          <p>{confirmation}</p>
          <a href="/orders">View order history</a>
        </div>
      )}

      {errorMessage && (
        <p className="order-error" role="alert">
          {errorMessage}
        </p>
      )}
    </form>
  );
}
