import { notFound } from "next/navigation";
import EntityPage from "@/components/admin/EntityPage";
import { ENTITIES } from "@lib/admin/entities";

export const metadata = { title: "Content · ISTE-MHSSCE Admin" };

const VALID = new Set(ENTITIES.map((e) => e.key));

export default async function AdminEntityPage({
  params,
}: {
  params: Promise<{ entity: string }>;
}) {
  const { entity } = await params;
  if (!VALID.has(entity)) notFound();
  return <EntityPage entity={entity} />;
}