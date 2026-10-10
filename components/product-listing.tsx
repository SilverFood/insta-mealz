"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { CategoryPills, FilterDialog, ProductCard, SortDialog } from "@/components/shop-ui";
import { gridContainerVariants, gridItemVariants, tapScale } from "@/components/motion/presets";
import { useLiveProducts } from "@/components/use-live-products";
import type { Category, Product } from "@/lib/products";

function sortProducts(list: Product[], sort: string) {
  const next = [...list];
  if (sort === "Best selling") next.sort((a, b) => a.rank - b.rank);
  if (sort === "Alphabetically, A-Z") next.sort((a, b) => a.name.localeCompare(b.name));
  if (sort === "Alphabetically, Z-A") next.sort((a, b) => b.name.localeCompare(a.name));
  if (sort === "Price, low to high") next.sort((a, b) => a.price - b.price);
  if (sort === "Price, high to low") next.sort((a, b) => b.price - a.price);
  if (sort === "Date, old to new") next.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  if (sort === "Date, new to old") next.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return next;
}

export function ProductListing() {
  const { products } = useLiveProducts();
  const params = useSearchParams();
  const query = params.get("q")?.trim().toLowerCase() ?? "";
  const [category, setCategory] = useState<"All" | Category>("All");
  const [sort, setSort] = useState("Featured");
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [inStockOnly, setInStockOnly] = useState<boolean | null>(null);
  const [priceFrom, setPriceFrom] = useState("");
  const [priceTo, setPriceTo] = useState("");

  const filtered = useMemo(() => {
    const from = Number(priceFrom);
    const to = Number(priceTo);
    return sortProducts(
      products.filter((product) => {
        if (category !== "All" && product.category !== category) return false;
        if (query && !product.name.toLowerCase().includes(query)) return false;
        if (inStockOnly !== null && product.inStock !== inStockOnly) return false;
        if (priceFrom && product.price < from) return false;
        if (priceTo && product.price > to) return false;
        return true;
      }),
      sort,
    );
  }, [products, category, query, inStockOnly, priceFrom, priceTo, sort]);
  const inStockCount = useMemo(
    () => products.filter((product) => product.inStock).length,
    [products],
  );
  const outOfStockCount = products.length - inStockCount;

  const gridKey = `${category}-${sort}-${query}-${inStockOnly}-${priceFrom}-${priceTo}`;

  return (
    <div className="bg-white pb-16">
      <div className="px-5 pt-6 text-center text-[14px] text-[#1d2f16] md:px-[69px]">
        <p>
          <Link href="/">Home</Link> <span className="px-2">›</span> All Products
        </p>
        <h1 className="mt-6 font-sans text-[28px] font-semibold text-[#1d2f16] sm:text-[36px] md:text-[48px]">All Products</h1>
      </div>
      <div className="mt-6">
        <CategoryPills
          value={category}
          onChange={setCategory}
        />
      </div>
      <div className="mx-auto mt-8 flex max-w-[1200px] items-center justify-between px-5">
        <motion.button
          type="button"
          onClick={() => setFilterOpen(true)}
          className="h-10 rounded-full border border-[#1d2f16] px-6 text-[16px]"
          whileTap={tapScale}
        >
          Filter
        </motion.button>
        <motion.button
          type="button"
          onClick={() => setSortOpen(true)}
          className="h-10 rounded-full border border-[#1d2f16] px-6 text-[16px]"
          whileTap={tapScale}
        >
          Sort
        </motion.button>
      </div>
      {query ? <p className="mt-6 text-center text-[16px] text-[#1d2f16]">Results for “{query}”</p> : null}
      <AnimatePresence mode="wait">
        <motion.div
          key={gridKey}
          className="mx-auto mt-8 grid max-w-[1200px] grid-cols-2 gap-x-4 gap-y-10 px-5 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4"
          variants={gridContainerVariants}
          initial="hidden"
          animate="show"
          exit="exit"
        >
          {filtered.map((product, index) => (
            <motion.div key={product.slug} className="h-full" variants={gridItemVariants} custom={index}>
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
      <AnimatePresence>
        {filtered.length === 0 ? (
          <motion.p
            key="empty"
            className="mt-10 text-center text-[18px]"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            No meals match those filters.
          </motion.p>
        ) : null}
      </AnimatePresence>
      <SortDialog
        open={sortOpen}
        value={sort}
        onClose={() => setSortOpen(false)}
        onApply={(value) => {
          setSort(value);
          setSortOpen(false);
        }}
      />
      <FilterDialog
        open={filterOpen}
        inStockOnly={inStockOnly}
        inStockCount={inStockCount}
        outOfStockCount={outOfStockCount}
        priceFrom={priceFrom}
        priceTo={priceTo}
        onClose={() => setFilterOpen(false)}
        onApply={(next) => {
          setInStockOnly(next.inStockOnly);
          setPriceFrom(next.priceFrom);
          setPriceTo(next.priceTo);
          setFilterOpen(false);
        }}
      />
    </div>
  );
}
