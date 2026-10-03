import { PageForm } from "@/components/admin/page-form";

export const metadata = { title: "New page" };
export const dynamic = "force-dynamic";

export default async function NewPagePage() {
  return (
    <div>
      <h2 className="text-2xl font-bold">New page</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Add a page like About us, a size guide or a policy.
      </p>
      <div className="mt-6">
        <PageForm />
      </div>
    </div>
  );
}
