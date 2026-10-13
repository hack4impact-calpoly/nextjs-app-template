import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import OfferingsPage from "@/components/OfferingsPage";
import SpecialOfferingControl from "@/components/SpecialOfferingControl";

const scenario = new URLSearchParams(window.location.search).get("scenario") ?? "starting";
const originalFetch = window.fetch.bind(window);
window.fetch = (input, init) =>
  originalFetch(input === "/api/offerings" ? `/api/offerings?scenario=${scenario}` : input, init);

function Preview() {
  const [checked, setChecked] = useState(false);
  return (
    <>
      <section style={{ maxWidth: "56rem", margin: "auto", padding: "1.5rem" }}>
        <h1>Controlled-response verification</h1>
        <p>Test-only preview. No database or persistence. Scenario: {scenario}.</p>
        <nav aria-label="Preview scenarios">
          {["starting", "new-special", "empty", "failure", "loading"].map((name) => (
            <a key={name} href={`?scenario=${name}`} style={{ display: "inline-block", padding: "0.75rem" }}>
              {name}
            </a>
          ))}
        </nav>
        <SpecialOfferingControl checked={checked} onChange={setChecked} />
        <p role="status">specialOffer: {String(checked)}</p>
      </section>
      <OfferingsPage title="Menu" intro="All controlled response items" emptyMessage="No offerings available." />
      <OfferingsPage
        title="Specials"
        intro="Only special offerings"
        emptyMessage="No special offerings available."
        specialsOnly
      />
    </>
  );
}

createRoot(document.getElementById("root")!).render(<Preview />);
