import { notFound } from "next/navigation";
import { getAdminProductById } from "@/lib/admin-data";
import { getAllCategories } from "@/lib/categories";
import { ProductForm } from "@/components/admin/product-form";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getAdminProductById(id),
    getAllCategories(),
  ]);
  if (!product) notFound();

  return (
    <div>
      <h2 className="text-2xl font-bold">Edit product</h2>
      <p className="mt-1 text-sm text-muted-foreground">{product.name}</p>
      <div className="mt-6">
        <ProductForm product={product} categories={categories} />
      </div>
    </div>
  );
}
