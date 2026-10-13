import OfferingsPage from "@/components/OfferingsPage";

export default function SpecialsPage() {
  return (
    <OfferingsPage
      title="Specials"
      intro="Discover the drinks we are featuring right now."
      emptyMessage="No specials are available right now."
      specialsOnly
    />
  );
}
