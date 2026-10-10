"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "@/components/cart-provider";
import { CompetitorComparisonSection } from "@/components/competitor-comparison-section";
import { QuantityStepper } from "@/components/quantity-stepper";
import { ProductCard } from "@/components/shop-ui";
import { ProcessStorySection } from "@/components/process-story-section";
import { easeOut, tapScale } from "@/components/motion/presets";
import { faqs, products, type Product } from "@/lib/products";
import { formatInr } from "@/lib/money";
import { PACKAGE_SIZES, unitPriceInr } from "@/lib/products/package-sizes";

const sizes = PACKAGE_SIZES;

const heroStagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const heroItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easeOut } },
};

const galleryImages = (product: Product) =>
  product.slide && product.slide !== product.image ? [product.image, product.slide] : [product.image];

export function ProductView({ product }: { product: Product }) {
  const cart = useCart();
  const router = useRouter();
  const images = galleryImages(product);
  const [primaryImage, setPrimaryImage] = useState(product.image);
  const [size, setSize] = useState(sizes[0]);
  const [qty, setQty] = useState(1);
  const [open, setOpen] = useState<string | null>("origin");
  const [faq, setFaq] = useState<string | null>(faqs[0].q);
  const [more, setMore] = useState(false);
  const price = unitPriceInr(product.price, size.id);
  const related = products.filter((item) => item.slug !== product.slug).slice(0, 4);
  useEffect(() => {
    setPrimaryImage(product.image);
    setSize(sizes[0]);
    setQty(1);
    setOpen("origin");
    setFaq(faqs[0].q);
    setMore(false);
  }, [product.image, product.slug]);

  const cartLine = cart.findLine(product.slug, size.id, price);

  function add() {
    cart.addLine({
      slug: product.slug,
      name: product.name,
      price,
      image: product.image,
      variant: size.id,
      qty,
    });
  }

  return (
    <div className="bg-white">
      <motion.section
        className="mx-auto grid max-w-[1144px] gap-10 px-5 py-8 md:grid-cols-2 md:py-12"
        variants={heroStagger}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={heroItem}>
          <div
            className="relative aspect-square overflow-hidden rounded-[28px] bg-gradient-to-b from-[#faf6ef] to-[#ede4d4] shadow-[0_8px_32px_rgba(29,47,22,0.08)] ring-1 ring-[#1d2f16]/10"
          >
            <img
              key={primaryImage}
              src={primaryImage}
              alt={product.name}
              className="h-full w-full object-contain p-8 transition-opacity duration-300 md:p-10"
            />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {images.map((src, index) => {
              const selected = primaryImage === src;
              return (
                <button
                  key={`${src}-${index}`}
                  type="button"
                  aria-label={`Show image ${index + 1}`}
                  aria-pressed={selected}
                  onClick={() => setPrimaryImage(src)}
                  className={`relative aspect-square overflow-hidden rounded-2xl bg-[#f6efe4] transition-all duration-200 ${
                    selected
                      ? "scale-[1.02] shadow-[0_4px_16px_rgba(29,47,22,0.12)] ring-2 ring-[#1d2f16] ring-offset-2 ring-offset-white"
                      : "opacity-65 ring-1 ring-[#1d2f16]/12 hover:opacity-100 hover:ring-[#1d2f16]/35"
                  }`}
                >
                  <img src={src} alt="" className="pointer-events-none h-full w-full object-contain p-2.5" />
                </button>
              );
            })}
          </div>
        </motion.div>
        <motion.div className="text-[#1d2f16]" variants={heroItem}>
          <h1 className="font-sans text-[28px] font-semibold leading-tight sm:text-[36px] md:text-[48px]">{product.name}</h1>
          <p className="mt-3 text-[20px]">{formatInr(price)}</p>
          <p className="mt-4 max-w-[533px] text-[16px] leading-6">
            {more ? product.blurb : product.blurb.slice(0, 110)}
            {product.blurb.length > 110 ? (
              <button type="button" className="ml-2 underline" onClick={() => setMore((value) => !value)}>
                {more ? "Read less" : "Read more"}
              </button>
            ) : null}
          </p>
          <fieldset className="mt-6">
            <legend className="text-[18px]">
              Size: <span className="font-semibold">{size.note}</span>
            </legend>
            <div className="mt-3 flex gap-3">
              {sizes.map((option) => (
                <motion.button
                  key={option.id}
                  type="button"
                  onClick={() => setSize(option)}
                  className={`h-12 w-[102px] rounded-md border ${size.id === option.id ? "border-[#1d2f16] bg-[#f6efe4]" : "border-[#d9d0c3]"}`}
                  whileTap={tapScale}
                >
                  {option.label}
                </motion.button>
              ))}
            </div>
          </fieldset>
          <QuantityStepper
            className="mt-6 h-12 w-[8.5rem]"
            variant="emphasis"
            value={qty}
            onDecrease={() => setQty((value) => Math.max(1, value - 1))}
            onIncrease={() => setQty((value) => value + 1)}
          />
          {cartLine ? (
            <div className="mt-6 rounded-full border border-[#1d2f16] bg-[#f6efe4] px-4 py-3 text-center text-[16px] text-[#1d2f16]">
              In your cart ({cartLine.qty}) —{" "}
              <Link href="/cart" className="font-semibold underline">
                View cart
              </Link>
            </div>
          ) : (
            <motion.button
              type="button"
              disabled={!product.inStock}
              onClick={add}
              className="mt-6 flex h-10 w-full items-center justify-center rounded-full bg-[#1d2f16] text-white disabled:opacity-40"
              whileTap={product.inStock ? tapScale : undefined}
            >
              Add to cart - {formatInr(price * qty)}
            </motion.button>
          )}
          <motion.button
            type="button"
            disabled={!product.inStock}
            onClick={() => {
              if (!cartLine) add();
              router.push("/checkout");
            }}
            className="mt-3 flex h-10 w-full items-center justify-center rounded-full border border-[#1d2f16] disabled:opacity-40"
            whileTap={product.inStock ? tapScale : undefined}
          >
            Buy it now
          </motion.button>
          <div className="mt-8 divide-y divide-[#e5dccb] border-y border-[#e5dccb]">
            <Accordion title="Origin & recipe" id="origin" open={open} setOpen={setOpen}>
              Cooked fresh in our own kitchen in Valsad, Gujarat, then freeze-dried. {product.blurb}
            </Accordion>
            <Accordion title="Ingredients" id="ingredients" open={open} setOpen={setOpen}>
              Vegetables, spices, and dairy used in {product.name}. No added preservatives and no added colours.
            </Accordion>
            <Accordion title="Nutrition" id="nutrition" open={open} setOpen={setOpen}>
              A prepared serving is about {size.id}. Heat-sensitive nutrients stay closer to the fresh cook because the meal is never boiled a second time.
            </Accordion>
          </div>
        </motion.div>
      </motion.section>

      <ProcessStorySection
        sectionClassName="mx-auto max-w-[806px] px-5 py-10 text-[#1d2f16]"
        headingClassName="mx-auto max-w-[760px] text-center font-sans text-[24px] leading-tight md:text-[32px]"
        cardClassName="px-8 py-12"
        bodyClassName="text-[18px] leading-7"
      />

      <CompetitorComparisonSection />

      <section className="px-5 py-12">
        <h2 className="text-center font-sans text-[32px] text-[#1d2f16]">You may also like</h2>
        <div className="mx-auto mt-8 grid max-w-[1100px] grid-cols-2 gap-6 md:grid-cols-4">
          {related.map((item) => (
            <div key={item.slug} className="h-full">
              <ProductCard product={item} />
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[800px] px-5 pb-16">
        <h2 className="mb-4 text-center font-sans text-[32px] text-[#1d2f16]">FAQs</h2>
        {faqs.map((item) => (
          <FaqItem
            key={item.q}
            question={item.q}
            answer={item.a}
            expanded={faq === item.q}
            onToggle={() => setFaq(faq === item.q ? null : item.q)}
          />
        ))}
        <p className="mt-6 text-center">
          <Link href="/contact" className="underline">
            Contact us
          </Link>
        </p>
      </section>
    </div>
  );
}

function CollapsibleBody({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.28, ease: easeOut }}
      className="overflow-hidden"
    >
      <div className="pb-4 text-[16px] leading-6">{children}</div>
    </motion.div>
  );
}

function Accordion({
  title,
  id,
  open,
  setOpen,
  children,
}: {
  title: string;
  id: string;
  open: string | null;
  setOpen: (id: string | null) => void;
  children: ReactNode;
}) {
  const expanded = open === id;
  return (
    <div>
      <button
        type="button"
        className="flex w-full items-center justify-between py-4 text-left font-sans text-[20px]"
        onClick={() => setOpen(expanded ? null : id)}
      >
        {title}
        <span>{expanded ? "−" : "+"}</span>
      </button>
      <AnimatePresence initial={false}>
        {expanded ? <CollapsibleBody>{children}</CollapsibleBody> : null}
      </AnimatePresence>
    </div>
  );
}

function FaqItem({
  question,
  answer,
  expanded,
  onToggle,
}: {
  question: string;
  answer: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-[#e5dccb]">
      <button type="button" className="flex w-full items-center justify-between py-4 text-left text-[18px]" onClick={onToggle}>
        {question}
        <span>{expanded ? "−" : "+"}</span>
      </button>
      <AnimatePresence initial={false}>
        {expanded ? (
          <CollapsibleBody>
            <p className="text-[#1d2f16]">{answer}</p>
          </CollapsibleBody>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
