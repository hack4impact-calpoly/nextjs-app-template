import ConcessionMenu from "@/app/components/ConcessionMenu";
import Navbar from "@/app/components/Navbar";

export default function ConcessionsPage() {
  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="mb-8 text-4xl font-semibold">Concessions</h1>
        <ConcessionMenu />
      </main>
    </div>
  );
}
