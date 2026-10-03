import { notFound } from "next/navigation";
import { db, hasDatabase } from "@/lib/db";
import { PageForm } from "@/components/admin/page-form";

export const metadata = { title: "Edit page" };
export const dynamic = "force-dynamic";

export default async function EditPagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!hasDatabase) notFound();
  const page = await db.page.findUnique({ where: { id } });
  if (!page) notFound();

  return (
    <div>
      <h2 className="text-2xl font-bold">Edit page</h2>
      <p className="mt-1 text-sm text-muted-foreground">/{page.slug}</p>
      <div className="mt-6">
        <PageForm
          page={{
            id: page.id,
            title: page.title,
            slug: page.slug,
            content: page.content,
            seoTitle: page.seoTitle ?? "",
            seoDescription: page.seoDescription ?? "",
            isPublished: page.isPublished,
            showInFooter: page.showInFooter,
            sortOrder: page.sortOrder,
          }}
        />
      </div>
    </div>
  );
}
