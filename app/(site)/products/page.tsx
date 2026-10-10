import { Suspense } from "react";
import { ProductListing } from "@/components/product-listing";

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="px-6 py-20 text-center">Loading meals…</div>}>
      <ProductListing />
    </Suspense>
  );
}
