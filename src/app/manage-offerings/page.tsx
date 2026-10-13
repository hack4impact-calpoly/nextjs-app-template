import { headers } from "next/headers";
import { notFound } from "next/navigation";
import ManageOfferings from "@/components/ManageOfferings";
import { hasManagementAccess } from "@/server/management-access";

export const dynamic = "force-dynamic";

export default async function ManageOfferingsPage() {
  // Independently enforce access here as well as in middleware.
  if (!(await hasManagementAccess((await headers()).get("authorization")))) notFound();
  return <ManageOfferings />;
}
