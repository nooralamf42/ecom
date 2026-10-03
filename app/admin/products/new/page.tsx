import { ProductForm } from "@/components/admin/product-form";
import { getAllCategories } from "@/lib/categories";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await getAllCategories();
  return (
    <div>
      <h2 className="text-2xl font-bold">New product</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Add a product to your storefront.
      </p>
      <div className="mt-6">
        <ProductForm categories={categories} />
      </div>
    </div>
  );
}
