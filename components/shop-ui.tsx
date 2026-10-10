"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "@/components/cart-provider";
import { QuantityStepper } from "@/components/quantity-stepper";
import { AnimatedOverlay } from "@/components/motion/animated-overlay";
import { hoverLift, lineItemVariants, tapScale } from "@/components/motion/presets";
import { MAX_ORDER_NOTE_LENGTH } from "@/lib/checkout/types";
import { formatInr } from "@/lib/money";
import { DEFAULT_PACKAGE_SIZE_ID, unitPriceInr } from "@/lib/products/package-sizes";
import { categories, type Category, type Product } from "@/lib/products";

export function CartDrawer() {
  const cart = useCart();
  const hasItems = cart.lines.length > 0;
  return (
    <AnimatedOverlay
      open={cart.drawerOpen}
      onClose={cart.closeDrawer}
      side="right"
      ariaLabel="Your cart"
      panelClassName="flex h-full w-full max-w-[796px] flex-col bg-white px-5 py-6 max-md:max-w-none sm:px-6 sm:py-8 md:px-[42px] md:py-[50px]"
    >
      <div className="flex shrink-0 items-center justify-between">
        <h2 className="font-sans text-[24px] text-[#1d2f16] sm:text-[28px]">Your cart</h2>
        <motion.button
          type="button"
          aria-label="Close cart"
          onClick={cart.closeDrawer}
          className="text-2xl leading-none text-[#1d2f16]"
          whileTap={tapScale}
        >
          ×
        </motion.button>
      </div>
      <div className="mt-6 flex min-h-0 flex-1 flex-col sm:mt-8">
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <AnimatePresence initial={false} mode="popLayout">
          {cart.lines.length === 0 ? (
            <motion.p
              key="empty"
              className="text-[18px] text-[#1d2f16]"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              Your cart is empty.
            </motion.p>
          ) : (
            cart.lines.map((line) => (
              <motion.div
                key={line.id}
                layout
                variants={lineItemVariants}
                initial="hidden"
                animate="show"
                exit="exit"
                className="mb-6 flex gap-4 border-b border-[#ede4d4] pb-6 sm:gap-6"
              >
                <img
                  src={line.image}
                  alt=""
                  width={180}
                  height={180}
                  className="h-[96px] w-[96px] shrink-0 object-contain sm:h-[140px] sm:w-[140px]"
                />
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-sans text-[16px] leading-snug text-[#1b1b1b] sm:text-[18px]">{line.name}</p>
                      <p className="mt-1 text-[14px] text-[#1d2f16] sm:text-[16px]">{line.variant}</p>
                    </div>
                    <p className="shrink-0 text-[16px] font-medium sm:text-[18px]">{formatInr(line.price * line.qty)}</p>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                    <QuantityStepper
                      variant="emphasis"
                      value={line.qty}
                      onDecrease={() => cart.setQty(line.id, line.qty - 1)}
                      onIncrease={() => cart.setQty(line.id, line.qty + 1)}
                    />
                    <button type="button" className="text-[14px] underline" onClick={() => cart.removeLine(line.id)}>
                      Remove
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
        </div>
        <div className="mt-4 shrink-0 rounded-lg border border-[#ede4d4] bg-[#f9f7f4] p-4 sm:mt-5">
          <label className="block text-[14px] font-medium leading-snug text-[#1d2f16] sm:text-[16px]" htmlFor="cart-order-note">
            Add a note to your order
          </label>
          <textarea
            id="cart-order-note"
            value={cart.note}
            maxLength={MAX_ORDER_NOTE_LENGTH}
            onChange={(event) => cart.setNote(event.target.value)}
            placeholder="Delivery instructions, spice level, etc."
            className="mt-2 min-h-[72px] w-full resize-none rounded-md border border-[#d9d0c3] bg-white p-3 text-[16px] text-[#1d2f16] outline-none transition-shadow duration-200 focus:border-[#1d2f16] focus:shadow-[0_0_0_3px_rgba(29,47,22,0.12)] sm:min-h-[60px]"
          />
        </div>
      </div>
      <div className="shrink-0 border-t border-[#ede4d4] pt-4">
        <div className="flex justify-between text-[18px]">
          <span>Subtotal</span>
          <span>{formatInr(cart.subtotal)}</span>
        </div>
        <p className="mt-2 text-[16px]">Shipping & Taxes calculated at checkout</p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <motion.div className="w-full min-w-0" whileHover={hoverLift} whileTap={tapScale}>
            <Link
              href="/cart"
              onClick={cart.closeDrawer}
              className="btn-outline flex h-[60px] w-full items-center justify-center font-sans text-[20px]"
            >
              View Cart
            </Link>
          </motion.div>
          {hasItems ? (
            <motion.div className="w-full min-w-0" whileHover={hoverLift} whileTap={tapScale}>
              <Link
                href="/checkout"
                onClick={cart.closeDrawer}
                className="flex h-[60px] w-full items-center justify-center rounded-full bg-[#1d2f16] font-sans text-[20px] font-semibold text-white transition-colors duration-300 hover:bg-[#314e24]"
              >
                Checkout
              </Link>
            </motion.div>
          ) : (
            <button
              type="button"
              disabled
              aria-disabled
              className="flex h-[60px] w-full cursor-not-allowed items-center justify-center rounded-full bg-[#1d2f16] font-sans text-[20px] font-semibold text-white opacity-50"
            >
              Checkout
            </button>
          )}
        </div>
      </div>
    </AnimatedOverlay>
  );
}

const sortOptions = [
  "Featured",
  "Best selling",
  "Alphabetically, A-Z",
  "Alphabetically, Z-A",
  "Price, low to high",
  "Price, high to low",
  "Date, old to new",
  "Date, new to old",
];

function SortFilterShell({
  open,
  onClose,
  title,
  ariaLabel,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  ariaLabel: string;
  children: ReactNode;
}) {
  return (
    <>
      <AnimatedOverlay
        open={open}
        onClose={onClose}
        side="bottom"
        ariaLabel={ariaLabel}
        className="md:hidden"
        panelClassName="w-full max-w-[796px] rounded-t-3xl bg-white p-8"
      >
        <DialogHeader title={title} onClose={onClose} />
        {children}
      </AnimatedOverlay>
      <AnimatedOverlay
        open={open}
        onClose={onClose}
        side="center"
        ariaLabel={ariaLabel}
        className="hidden md:flex"
        panelClassName="w-full max-w-[796px] rounded-3xl bg-white p-8"
      >
        <DialogHeader title={title} onClose={onClose} />
        {children}
      </AnimatedOverlay>
    </>
  );
}

function DialogHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <h2 className="font-sans text-[28px] text-[#1d2f16]">{title}</h2>
      <motion.button type="button" aria-label={`Close ${title.toLowerCase()}`} onClick={onClose} className="text-2xl" whileTap={tapScale}>
        ×
      </motion.button>
    </div>
  );
}

export function SortDialog({
  open,
  value,
  onClose,
  onApply,
}: {
  open: boolean;
  value: string;
  onClose: () => void;
  onApply: (value: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setDraft(value);
  }

  return (
    <SortFilterShell open={open} onClose={onClose} title="Sort" ariaLabel="Sort products">
      <div className="flex flex-col gap-4">
        {sortOptions.map((option) => (
          <label key={option} className="flex items-center gap-4 text-[18px] text-[#1d2f16]">
            <input type="radio" name="sort" checked={draft === option} onChange={() => setDraft(option)} />
            {option}
          </label>
        ))}
      </div>
      <motion.button
        type="button"
        className="mt-8 flex h-12 w-full items-center justify-center rounded-full bg-[#1d2f16] text-[18px] text-white"
        onClick={() => onApply(draft)}
        whileTap={tapScale}
      >
        Apply
      </motion.button>
    </SortFilterShell>
  );
}

export function FilterDialog({
  open,
  inStockOnly,
  inStockCount,
  outOfStockCount,
  priceFrom,
  priceTo,
  onClose,
  onApply,
}: {
  open: boolean;
  inStockOnly: boolean | null;
  inStockCount: number;
  outOfStockCount: number;
  priceFrom: string;
  priceTo: string;
  onClose: () => void;
  onApply: (next: { inStockOnly: boolean | null; priceFrom: string; priceTo: string }) => void;
}) {
  const [stock, setStock] = useState<boolean | null>(inStockOnly);
  const [from, setFrom] = useState(priceFrom);
  const [to, setTo] = useState(priceTo);
  const [filterPrevOpen, setFilterPrevOpen] = useState(open);
  if (open !== filterPrevOpen) {
    setFilterPrevOpen(open);
    if (open) {
      setStock(inStockOnly);
      setFrom(priceFrom);
      setTo(priceTo);
    }
  }

  return (
    <SortFilterShell open={open} onClose={onClose} title="Filter" ariaLabel="Filter products">
      <p className="mb-3 text-[18px]">Availability</p>
      <label className="mb-3 flex items-center gap-3 text-[18px]">
        <input type="checkbox" checked={stock === true} onChange={() => setStock(stock === true ? null : true)} />
        In stock ({inStockCount})
      </label>
      <label className="flex items-center gap-3 text-[18px]">
        <input type="checkbox" checked={stock === false} onChange={() => setStock(stock === false ? null : false)} />
        Out of stock ({outOfStockCount})
      </label>
      <p className="mb-3 mt-6 text-[18px]">Price</p>
      <div className="flex items-center gap-3">
        <label className="flex h-11 flex-1 items-center gap-2 rounded-md border border-[#1d2f16] px-3">
          ₹
          <input value={from} onChange={(event) => setFrom(event.target.value)} placeholder="From" className="w-full outline-none" />
        </label>
        <span>-</span>
        <label className="flex h-11 flex-1 items-center gap-2 rounded-md border border-[#1d2f16] px-3">
          ₹
          <input value={to} onChange={(event) => setTo(event.target.value)} placeholder="To" className="w-full outline-none" />
        </label>
      </div>
      <motion.button
        type="button"
        className="mt-8 flex h-12 w-full items-center justify-center rounded-full bg-[#1d2f16] text-[18px] text-white"
        onClick={() => onApply({ inStockOnly: stock, priceFrom: from, priceTo: to })}
        whileTap={tapScale}
      >
        Apply
      </motion.button>
    </SortFilterShell>
  );
}

export function ProductCard({
  product,
  action = "Add to cart",
  actionShort,
  onAction,
}: {
  product: Product;
  action?: string;
  actionShort?: string;
  onAction?: () => void;
}) {
  const cart = useCart();
  const inCart = !onAction && cart.hasProduct(product.slug);
  const [added, setAdded] = useState(false);
  const productHref = `/products/${product.slug}`;

  useEffect(() => {
    if (!added) return;
    const timer = window.setTimeout(() => setAdded(false), 600);
    return () => window.clearTimeout(timer);
  }, [added]);

  return (
    <motion.article className="flex h-full w-full flex-col" layout>
      <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
        <Link
          href={productHref}
          className="flex h-[220px] items-center justify-center overflow-hidden rounded-t-2xl bg-white md:h-[291px]"
        >
          <motion.img
            src={product.image}
            alt={product.name}
            width={280}
            height={280}
            className="h-full w-full object-contain"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35 }}
          />
        </Link>
      </motion.div>
      <div className="min-w-0 px-1 pt-3">
        <Link
          href={productHref}
          title={product.name}
          className="line-clamp-2 block min-h-[calc(2*1.375*1em)] font-sans text-[16px] font-medium leading-snug text-[#1b1b1b] md:text-[18px]"
        >
          {product.name}
        </Link>
        <p className="mt-1 text-[18px] text-[#1b1b1b]">{formatInr(product.price, false)}</p>
        <div className="mt-3 flex items-center gap-2">
          {inCart ? (
            <Link
              href="/cart"
              className="flex h-9 min-w-0 flex-1 items-center justify-center whitespace-nowrap rounded-full border border-[#1d2f16] bg-[#f6efe4] px-2 text-[13px] font-bold text-[#1d2f16] sm:h-8 sm:min-w-[136px] sm:flex-none sm:px-4 sm:text-[16px] md:text-[18px]"
            >
              In cart
            </Link>
          ) : (
            <motion.button
              type="button"
              disabled={!product.inStock}
              onClick={() => {
                if (onAction) onAction();
                else {
                  cart.addLine({
                    slug: product.slug,
                    name: product.name,
                    price: unitPriceInr(product.price, DEFAULT_PACKAGE_SIZE_ID),
                    image: product.image,
                    variant: DEFAULT_PACKAGE_SIZE_ID,
                    qty: 1,
                  });
                  setAdded(true);
                }
              }}
              className="flex h-9 min-w-0 flex-1 items-center justify-center whitespace-nowrap rounded-full border border-[#1d2f16] px-2 text-[13px] font-bold text-[#1d2f16] disabled:opacity-40 sm:h-8 sm:min-w-[136px] sm:flex-none sm:px-4 sm:text-[16px] md:text-[18px]"
              whileTap={product.inStock ? tapScale : undefined}
              animate={added ? { scale: [1, 1.06, 1] } : { scale: 1 }}
              transition={{ duration: 0.35 }}
            >
              {product.inStock ? (
                added ? (
                  "Added ✓"
                ) : (
                  <>
                    <span className="sm:hidden">{actionShort ?? action}</span>
                    <span className="hidden sm:inline">{action}</span>
                  </>
                )
              ) : (
                "Sold out"
              )}
            </motion.button>
          )}
          <motion.div whileTap={tapScale}>
            <Link href={productHref} aria-label={`View ${product.name}`} className="shrink-0">
              <img src="/icons/arrow-right.svg" alt="" width={24} height={24} className="-rotate-45" />
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.article>
  );
}

export function CategoryPills({
  value,
  onChange,
}: {
  value: "All" | Category;
  onChange: (value: "All" | Category) => void;
}) {
  const options = categories;
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {options.map((option) => {
        const active = value === option;
        return (
          <motion.button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`relative h-11 rounded-full px-4 text-[16px] sm:px-8 sm:text-[18px] ${active ? "text-white" : "border border-[#1d2f16] text-[#1d2f16]"}`}
            whileTap={tapScale}
          >
            {active ? (
              <motion.span
                layoutId="category-pill-active"
                className="absolute inset-0 rounded-full bg-[#1d2f16]"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            ) : null}
            <span className="relative z-10">{option}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
