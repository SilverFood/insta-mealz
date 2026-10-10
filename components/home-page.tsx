"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ProductCard } from "@/components/shop-ui";
import { useCart } from "@/components/cart-provider";
import { CompetitorComparisonSection } from "@/components/competitor-comparison-section";
import { RevealOnScroll } from "@/components/motion/reveal-on-scroll";
import { ProcessStorySection } from "@/components/process-story-section";
import {
  heroItemVariants,
  heroStaggerVariants,
  hoverLift,
  staggerContainerVariants,
  staggerItemVariants,
  tapScale,
  easeOut,
} from "@/components/motion/presets";
import { featuredSlides, products, type Product } from "@/lib/products";
import { formatInr } from "@/lib/money";
import { DEFAULT_PACKAGE_SIZE_ID } from "@/lib/products/package-sizes";

export function HomePage() {
  const router = useRouter();
  const reducedMotion = useReducedMotion() ?? false;
  const [slide, setSlide] = useState(0);
  const [direction, setDirection] = useState(0);
  const [carouselBusy, setCarouselBusy] = useState(false);
  const [bundle, setBundle] = useState<string[]>([]);
  const [bundleFullHint, setBundleFullHint] = useState(false);
  const cart = useCart();
  const current = featuredSlides[slide % featuredSlides.length];
  const prev = featuredSlides[(slide + featuredSlides.length - 1) % featuredSlides.length];
  const next = featuredSlides[(slide + 1) % featuredSlides.length];
  const previousFrameRef = useRef<{ prev: string; current: string; next: string } | null>(null);
  const carouselUnlockRef = useRef<number | null>(null);
  const queuedSlideDeltaRef = useRef(0);
  const incomingDirection = useMemo(() => {
    const previousFrame = previousFrameRef.current;
    if (!previousFrame) return direction === 0 ? 1 : direction;
    if (current.slug === previousFrame.next) return 1;
    if (current.slug === previousFrame.prev) return -1;
    return direction === 0 ? 1 : direction;
  }, [current.slug, direction]);

  const bundleProducts = useMemo(
    () => bundle.map((slug) => products.find((product) => product.slug === slug)).filter(Boolean),
    [bundle],
  );
  const bundleTotal = bundleProducts.reduce((sum, product) => sum + (product?.price ?? 0), 0);
  const discounted = Math.round(bundleTotal * 0.67);
  const carouselMotionDuration = reducedMotion ? 0 : 1.5;
  const captionDirection = incomingDirection;

  useEffect(() => {
    previousFrameRef.current = { prev: prev.slug, current: current.slug, next: next.slug };
  }, [prev.slug, current.slug, next.slug]);

  useEffect(
    () => () => {
      if (carouselUnlockRef.current != null) window.clearTimeout(carouselUnlockRef.current);
    },
    [],
  );

  const runSlideTransition = useCallback(
    (delta: number) => {
      if (featuredSlides.length <= 1) return;
      const step = delta > 0 ? 1 : -1;
      setDirection(step);
      setSlide((value) => (value + step + featuredSlides.length) % featuredSlides.length);
      if (reducedMotion) return;
      setCarouselBusy(true);
      if (carouselUnlockRef.current != null) window.clearTimeout(carouselUnlockRef.current);
      carouselUnlockRef.current = window.setTimeout(() => {
        setCarouselBusy(false);
        carouselUnlockRef.current = null;
      }, Math.max(220, carouselMotionDuration * 1000));
    },
    [carouselMotionDuration, reducedMotion],
  );

  useEffect(() => {
    if (carouselBusy || reducedMotion) return;
    if (queuedSlideDeltaRef.current === 0) return;
    const nextStep = queuedSlideDeltaRef.current > 0 ? 1 : -1;
    queuedSlideDeltaRef.current -= nextStep;
    runSlideTransition(nextStep);
  }, [carouselBusy, reducedMotion, runSlideTransition]);

  function goSlide(delta: number) {
    const step = delta > 0 ? 1 : -1;
    if (!reducedMotion && carouselBusy) {
      queuedSlideDeltaRef.current += step;
      return;
    }
    runSlideTransition(step);
  }

  function toggleBundle(slug: string) {
    setBundle((currentSlugs) => {
      if (currentSlugs.includes(slug)) return currentSlugs.filter((item) => item !== slug);
      if (currentSlugs.length >= 3) return currentSlugs;
      return [...currentSlugs, slug];
    });
  }

  function tryToggleBundle(slug: string) {
    if (!bundle.includes(slug) && bundle.length >= 3) {
      setBundleFullHint(true);
      window.setTimeout(() => setBundleFullHint(false), 3200);
      return;
    }
    toggleBundle(slug);
  }

  function addBundle() {
    if (bundleProducts.length !== 3) return;
    const share = Math.round(discounted / 3);
    bundleProducts.forEach((product, index) => {
      if (!product) return;
      cart.addLine({
        slug: product.slug,
        name: product.name,
        price: index === 2 ? discounted - share * 2 : share,
        image: product.image,
        variant: DEFAULT_PACKAGE_SIZE_ID,
        qty: 1,
      });
    });
    setBundle([]);
  }

  return (
    <div>
      <section className="relative min-h-[520px] overflow-hidden bg-[#8a5520] md:h-[663px]">
        <img
          src="/images/home-page.png"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover object-[center_40%] [-webkit-mask-image:linear-gradient(90deg,rgba(0,0,0,0.25)_0%,rgba(0,0,0,0.5)_32%,black_50%)] [mask-image:linear-gradient(90deg,rgba(0,0,0,0.25)_0%,rgba(0,0,0,0.5)_32%,black_50%)]"
        />
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-[min(100%,720px)] bg-[linear-gradient(90deg,rgba(136,80,19,0.72)_0%,rgba(136,80,19,0.35)_48%,transparent_88%)]"
          aria-hidden
        />
        <motion.div
          className="relative z-10 flex h-full min-h-[520px] flex-col justify-end px-6 pb-10 pt-16 md:min-h-[663px] md:px-16 md:pb-12"
          variants={heroStaggerVariants}
          initial="hidden"
          animate="show"
        >
          <motion.h1
            variants={heroItemVariants}
            className="max-w-[642px] font-sans text-[32px] font-semibold leading-tight text-white md:text-[48px] md:leading-[60px]"
          >
            Real Indian meals. Ready in 5 minutes. No fridge, no compromise.
          </motion.h1>
          <motion.p variants={heroItemVariants} className="mt-4 max-w-[420px] text-[18px] leading-7 text-white md:text-[20px]">
            Freeze-dried, not freeze-fried. Just add some hot water and your meal is ready!
          </motion.p>
          <motion.div variants={heroItemVariants}>
            <motion.div whileHover={hoverLift} whileTap={tapScale}>
              <Link
                href="/products"
                className="btn-primary mt-6 flex h-[42px] w-[200px] text-[18px] md:h-[60px] md:w-[225px] md:text-[20px]"
              >
                View products
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_center,#fff_0%,#f9e7d2_100%)] py-12 md:py-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#8a5520]/25 to-transparent"
        />
        <motion.div
          className="relative mx-auto max-w-[720px] px-6 text-center text-[#1d2f16]"
          variants={heroStaggerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-12% 0px" }}
        >
          <motion.h2
            variants={heroStaggerVariants}
            className="font-sans text-[26px] leading-snug md:text-[32px]"
          >
            {(["12 meals.", "One kitchen.", "Zero preservatives."] as const).map((phrase) => (
              <motion.span key={phrase} variants={heroItemVariants} className="inline-block">
                {phrase}{" "}
              </motion.span>
            ))}
          </motion.h2>
          <motion.p variants={heroItemVariants} className="mt-2 text-[18px] md:text-[20px]">
            From Paneer Butter Masala to Veg Dum Biryani — every meal is cooked fresh in Valsad, then freeze-dried to lock in the taste.
          </motion.p>
          <motion.div variants={heroItemVariants}>
            <motion.div whileHover={{ x: 4 }} transition={{ duration: 0.2, ease: easeOut }}>
              <Link
                href="/products"
                className="mt-4 inline-flex items-center gap-2 text-[22px] transition-opacity hover:opacity-80 md:text-[24px]"
              >
                Explore All <img src="/icons/explore.svg" alt="" width={20} height={20} />
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
        <motion.div
          className="relative mx-auto mt-8 h-[460px] max-w-[1100px] overflow-hidden md:h-[680px]"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.55, ease: easeOut, delay: 0.12 }}
        >
          <AnimatePresence initial={false} mode="sync">
            {(
              [
                { product: prev, slot: "prev" },
                { product: current, slot: "current" },
                { product: next, slot: "next" },
              ] as const
            ).map(({ product, slot }) => {
              const isCurrent = slot === "current";
              const sideOffset = slot === "prev" ? -120 : slot === "next" ? 120 : incomingDirection > 0 ? 140 : -140;
              const stackTilt = 0;
              return (
                <motion.button
                  key={product.slug}
                  type="button"
                  layout
                  aria-label={isCurrent ? `Open ${product.name}` : undefined}
                  aria-hidden={isCurrent ? undefined : true}
                  tabIndex={isCurrent ? 0 : -1}
                  onClick={isCurrent ? () => router.push(`/products/${product.slug}`) : undefined}
                  initial={reducedMotion ? false : { opacity: 0, x: sideOffset, scale: isCurrent ? 0.98 : 0.9, rotate: stackTilt }}
                  animate={{ opacity: isCurrent ? 1 : 0.7, x: 0, scale: isCurrent ? 1 : 0.92, rotate: stackTilt }}
                  exit={reducedMotion ? { opacity: 0, rotate: stackTilt } : { opacity: 0, x: sideOffset, scale: isCurrent ? 0.98 : 0.9, rotate: stackTilt }}
                  transition={{
                    layout: { duration: carouselMotionDuration, ease: easeOut },
                    opacity: { duration: carouselMotionDuration * 0.85, ease: easeOut },
                    x: { duration: carouselMotionDuration, ease: easeOut },
                    scale: { duration: carouselMotionDuration, ease: easeOut },
                    rotate: { duration: carouselMotionDuration, ease: easeOut },
                  }}
                  style={{ willChange: "transform, opacity" }}
                  className={
                    isCurrent
                      ? "absolute bottom-0 left-1/2 top-0 z-10 my-auto h-[380px] w-[304px] -ml-[152px] translate-y-6 cursor-pointer border-0 bg-transparent p-0 md:h-[540px] md:w-[432px] md:-ml-[216px] md:translate-y-10 lg:h-[600px] lg:w-[480px] lg:-ml-[240px] lg:translate-y-12"
                      : slot === "prev"
                      ? "pointer-events-none absolute bottom-0 top-0 my-auto h-[248px] w-[198px] -translate-y-12 object-contain max-md:-left-[13.5rem] md:-left-3 md:h-[286px] md:w-[228px] md:-translate-y-16 lg:-left-1 lg:h-[324px] lg:w-[258px] lg:-translate-y-20"
                      : "pointer-events-none absolute bottom-0 top-0 my-auto h-[248px] w-[198px] -translate-y-12 object-contain max-md:-right-[13.5rem] md:-right-3 md:h-[286px] md:w-[228px] md:-translate-y-16 lg:-right-1 lg:h-[324px] lg:w-[258px] lg:-translate-y-20"
                  }
                >
                  <img
                    src={product.image}
                    alt={isCurrent ? product.name : ""}
                    className={`h-full w-full object-contain ${isCurrent ? "scale-[1.02]" : "scale-[0.96]"}`}
                  />
                </motion.button>
              );
            })}
          </AnimatePresence>
          <motion.button
            type="button"
            aria-label="Previous meal"
            onClick={() => goSlide(-1)}
            className="absolute left-2 top-1/2 z-20 flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#1d2f16] bg-white/80 p-3 md:left-3 lg:left-4"
            whileHover={{ scale: 1.06 }}
            whileTap={tapScale}
          >
            <img src="/icons/arrow-prev.svg" alt="" width={27} height={27} />
          </motion.button>
          <motion.button
            type="button"
            aria-label="Next meal"
            onClick={() => goSlide(1)}
            className="absolute right-2 top-1/2 z-20 flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#1d2f16] bg-white/80 p-3 md:right-3 lg:right-4"
            whileHover={{ scale: 1.06 }}
            whileTap={tapScale}
          >
            <img src="/icons/arrow-next.svg" alt="" width={27} height={27} />
          </motion.button>
        </motion.div>
        <div className="mx-auto flex w-[225px] flex-col items-center text-center text-[#1d2f16]">
          <AnimatePresence mode="wait" initial={false} custom={captionDirection}>
            <motion.div
              key={current.slug}
              custom={captionDirection}
              initial={{
                opacity: 0,
                x: captionDirection > 0 ? 24 : -24,
                y: 2,
              }}
              animate={{
                opacity: 1,
                x: 0,
                y: 0,
                transition: { duration: carouselMotionDuration, ease: easeOut },
              }}
              exit={{
                opacity: 0,
                x: captionDirection > 0 ? -20 : 20,
                y: -2,
                transition: { duration: carouselMotionDuration * 0.7, ease: easeOut },
              }}
              className="flex w-full flex-col items-center"
            >
              <p className="font-sans text-[20px] font-semibold">{current.name}</p>
              <p className="text-[20px] tabular-nums">{formatInr(current.price)}</p>
            </motion.div>
          </AnimatePresence>
          {cart.hasProduct(current.slug) ? (
            <Link href="/cart" className="btn-outline mt-2 flex h-[60px] w-full items-center justify-center text-[20px]">
              In cart
            </Link>
          ) : (
            <motion.button
              type="button"
              onClick={() =>
                cart.addLine({
                  slug: current.slug,
                  name: current.name,
                  price: current.price,
                  image: current.image,
                  variant: DEFAULT_PACKAGE_SIZE_ID,
                })
              }
              className="btn-outline mt-2 h-[60px] w-full text-[20px]"
              whileHover={hoverLift}
              whileTap={tapScale}
            >
              Add to Cart
            </motion.button>
          )}
        </div>
      </section>

      <section className="bg-white px-5 py-16 md:px-[70px]">
        <RevealOnScroll className="mx-auto mb-10 max-w-[642px] text-center text-[#1d2f16]">
          <h2 className="font-sans text-[28px] md:text-[32px]">Create your own combo</h2>
          <p className="mt-3 text-[18px] md:text-[20px]">Combine 3 products and get 33% off</p>
        </RevealOnScroll>
        <div className="mx-auto flex max-w-[1297px] flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="grid flex-1 grid-cols-2 gap-4 md:grid-cols-3 md:gap-x-[15px] md:gap-y-8">
            {products.slice(0, 9).map((product) => {
              const selected = bundle.includes(product.slug);
              return (
                <div
                  key={product.slug}
                  className={`relative h-full rounded-2xl p-2.5 transition-shadow duration-300 md:p-3 ${
                    selected
                      ? "bg-[#fbfaf6] shadow-[0_4px_20px_rgba(29,47,22,0.08)] ring-1 ring-[#1d2f16]/15"
                      : "ring-1 ring-transparent"
                  }`}
                >
                  {selected ? (
                    <span
                      className="absolute right-4 top-4 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-[#1d2f16] text-sm font-bold text-white shadow-sm md:right-5 md:top-5"
                      aria-hidden
                    >
                      ✓
                    </span>
                  ) : null}
                  <ProductCard
                    product={product}
                    action={selected ? "Added" : "Add to Bundle"}
                    actionShort={selected ? "Added" : "Add"}
                    onAction={() => tryToggleBundle(product.slug)}
                  />
                </div>
              );
            })}
          </div>
          <motion.aside
            layout
            className="flex h-auto w-full flex-col justify-between rounded-[20px] border border-[#1d2f16]/10 bg-white p-5 shadow-lg lg:sticky lg:top-[130px] lg:min-h-[423px] lg:w-[313px]"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <p className="font-sans text-[18px] font-semibold text-[#1d2f16]">Your combo</p>
                <span className="rounded-full bg-[#f1e9dd] px-3 py-1 text-[13px] font-medium text-[#1d2f16]">
                  {bundle.length} / 3 meals
                </span>
              </div>
              <AnimatePresence>
                {bundleFullHint ? (
                  <motion.p
                    key="full-hint"
                    className="mt-2 text-center text-[14px] text-[#5b350d] md:text-left"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    Combo is full — remove one to swap.
                  </motion.p>
                ) : null}
              </AnimatePresence>
              <div className="mt-4 flex flex-col gap-3.5 rounded-2xl bg-[#f1e9dd]/50 p-4">
                {[0, 1, 2].map((slot) => (
                  <BundleSlot
                    key={`slot-${slot}`}
                    slotIndex={slot}
                    product={bundleProducts[slot]}
                    onRemove={bundleProducts[slot] ? () => toggleBundle(bundleProducts[slot]!.slug) : undefined}
                  />
                ))}
              </div>
              <AnimatePresence mode="wait">
                {bundle.length === 3 ? (
                  <motion.p
                    key="combo-price"
                    className="mt-4 text-center text-[16px] text-[#1d2f16] lg:text-left"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    Combo {formatInr(discounted)} <span className="line-through opacity-60">{formatInr(bundleTotal, false)}</span>
                  </motion.p>
                ) : (
                  <motion.p
                    key="combo-hint"
                    className="mt-4 text-center text-[14px] text-[#83957c] lg:text-left"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    Select 3 meals to unlock 33% off
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
            <motion.button
              type="button"
              disabled={bundle.length !== 3}
              onClick={addBundle}
              className="mt-6 flex h-[60px] w-full items-center justify-center rounded-full border border-[#83957c] text-[20px] font-bold text-[#83957c] transition-colors duration-300 enabled:border-[#1d2f16] enabled:bg-[#1d2f16] enabled:text-white"
              whileTap={bundle.length === 3 ? tapScale : undefined}
            >
              Add to Cart
            </motion.button>
          </motion.aside>
        </div>
      </section>

      <ProcessStorySection
        sectionClassName="bg-white px-5 py-8 text-[#1d2f16] md:px-0"
        innerClassName="mx-auto max-w-[806px]"
        headingClassName="mx-auto max-w-[760px] text-center font-sans text-[26px] leading-snug md:text-[32px]"
        cardClassName="px-8 py-12 md:px-16 md:py-16"
        bodyClassName="text-[18px] leading-7 md:text-[20px]"
      />

      <CompetitorComparisonSection />

      <section className="relative overflow-hidden bg-[#233102] px-6 py-16 text-center text-[#ede4d4]">
        <img src="/images/leaf-01.png" alt="" className="pointer-events-none absolute -left-6 top-6 hidden w-[180px] md:block" />
        <img src="/images/leaf-04.png" alt="" className="pointer-events-none absolute bottom-8 left-6 hidden w-[140px] md:block" />
        <img src="/images/leaf-03.png" alt="" className="pointer-events-none absolute -right-4 top-10 hidden w-[180px] md:block" />
        <img src="/images/leaf-06.png" alt="" className="pointer-events-none absolute bottom-10 right-16 hidden w-[110px] rotate-12 md:block" />
        <RevealOnScroll className="relative mx-auto max-w-[593px] text-[18px] md:text-[24px]">
          <p className="font-sans">Three friends. One problem.</p>
          <p className="mt-6">
            Travel anywhere and you cannot get Indian food that tastes right, or be certain it is truly vegetarian. You ask, someone nods, you eat anyway, and you are still not sure.
          </p>
          <p className="mt-6">
            So we built a factory in Valsad and made twelve meals that fix it. Real food, cooked properly, then freeze-dried. Add hot water, wait five minutes.
          </p>
          <p className="mt-6 font-sans">Certain, every time.</p>
        </RevealOnScroll>
      </section>

      <section className="bg-[#fbfaf6] px-5 py-16">
        <RevealOnScroll>
          <h2 className="text-center font-sans text-[28px] font-semibold text-[#1d2f16] md:text-[32px]">What makes us different</h2>
        </RevealOnScroll>
        <motion.div
          className="mx-auto mt-10 grid max-w-[1360px] grid-cols-1 gap-6 md:grid-cols-2"
          variants={staggerContainerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-8% 0px" }}
        >
          <div className="flex flex-col gap-6">
            <motion.div variants={staggerItemVariants}>
              <DiffCard title="No added preservatives" body="Not because we left them out, but because there is nothing for them to do. Preservatives stop water from spoiling food. There is no water in ours." />
            </motion.div>
            <motion.div variants={staggerItemVariants}>
              <DiffCard title="100% Vegetarian" body="Every meal, every batch, no exceptions." />
            </motion.div>
          </div>
          <div className="flex flex-col gap-6">
            <motion.div variants={staggerItemVariants}>
              <DiffCard title="No added colours" body="What you see is what the food looked like when it came out of the pan." />
            </motion.div>
            <motion.div variants={staggerItemVariants}>
              <DiffCard title="Made in our own factory" body="Not contract-packed, not white-labelled. Cooked, frozen, dried and sealed under one roof in Valsad, Gujarat." />
            </motion.div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

function BundleSlot({
  slotIndex,
  product,
  onRemove,
}: {
  slotIndex: number;
  product?: Product;
  onRemove?: () => void;
}) {
  const label = `Meal ${slotIndex + 1}`;

  if (!product) {
    return (
      <div className="flex items-center gap-3.5 rounded-xl border-2 border-dashed border-[#1d2f16]/20 bg-white/70 px-4 py-3.5">
        <div
          className="flex h-[62px] w-[62px] shrink-0 items-center justify-center rounded-full border-2 border-dashed border-[#1d2f16]/25 bg-[#fbfaf6] text-[22px] text-[#83957c]"
          aria-hidden
        >
          +
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-medium text-[#1d2f16]/70">{label}</p>
          <p className="text-[13px] text-[#83957c]">Pick from the grid</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.22 }}
      className="flex items-center gap-3.5 rounded-xl border border-[#1d2f16]/10 bg-white px-4 py-3.5 shadow-sm"
    >
      <img src={product.image} alt="" width={62} height={62} className="h-[62px] w-[62px] shrink-0 rounded-full object-cover ring-1 ring-[#1d2f16]/10" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-medium text-[#1d2f16]">{product.name}</p>
        <p className="text-[15px] text-[#1d2f16]">{formatInr(product.price, false)}</p>
      </div>
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          className="-mr-0.5 shrink-0 rounded-full p-1.5 text-[#83957c] transition-colors hover:bg-[#f1e9dd] hover:text-[#1d2f16]"
          aria-label={`Remove ${product.name} from combo`}
        >
          <span className="text-xl leading-none" aria-hidden>×</span>
        </button>
      ) : null}
    </motion.div>
  );
}

function DiffCard({ title, body }: { title: string; body: string }) {
  return (
    <article className="flex min-h-[180px] flex-col items-center justify-center rounded-[7.5px] bg-[#ede4d4] px-8 py-8 text-center text-[#1d2f16] transition-shadow duration-300 hover:shadow-md md:min-h-[220px]">
      <h3 className="text-[20px] font-bold">{title}</h3>
      <p className="mt-3 text-[16px] leading-snug">{body}</p>
    </article>
  );
}
