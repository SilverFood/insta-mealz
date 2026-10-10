"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "@/components/cart-provider";
import { lineItemVariants, tapScale } from "@/components/motion/presets";
import { RevealOnScroll } from "@/components/motion/reveal-on-scroll";
import { useLiveProducts } from "@/components/use-live-products";
import { getDeliveryEstimate } from "@/lib/checkout/delivery-estimate";
import {
  computeCheckoutTotals,
  FREE_SHIPPING_SUBTOTAL_INR,
  paiseToRupees,
  resolveDiscount,
  rupeesToPaise,
} from "@/lib/checkout/pricing";
import { MAX_ORDER_NOTE_LENGTH } from "@/lib/checkout/types";
import { INDIAN_STATES_AND_UTS } from "@/lib/checkout/india-states";
import { validateCheckoutForm, type CheckoutFieldErrors, type CheckoutFieldKey } from "@/lib/checkout/validate";
import { freeShippingCartMessage, standardShippingCheckoutBlurb } from "@/lib/copy/shipping";
import { QuantityStepper } from "@/components/quantity-stepper";
import { formatInr } from "@/lib/money";

const inputClass =
  "box-border max-w-full text-[16px] text-[#1d2f16] transition-shadow duration-200 outline-none focus:shadow-[0_0_0_3px_rgba(29,47,22,0.12)]";

function fieldBorder(hasError: boolean) {
  return hasError ? "border-[#c4554a]" : "border-[#d9d0c3]";
}

function FieldError({ id, message }: { id?: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1 text-[13px] text-[#c4554a]" role="alert">
      {message}
    </p>
  );
}

function loadRazorpayScript() {
  return new Promise<void>((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load Razorpay checkout"));
    document.body.appendChild(script);
  });
}

export function CartPage() {
  const cart = useCart();
  const { acceptingOrders } = useLiveProducts();
  const remaining = Math.max(0, FREE_SHIPPING_SUBTOTAL_INR - cart.subtotal);
  const progress = Math.min(100, (cart.subtotal / FREE_SHIPPING_SUBTOTAL_INR) * 100);
  const b2g1Hint = cart.count >= 2 && cart.count % 3 !== 0;
  const canCheckout = cart.lines.length > 0 && acceptingOrders;
  return (
    <div className="min-w-0 overflow-x-clip bg-white px-5 py-12 md:px-16">
      <RevealOnScroll className="mx-auto max-w-[1100px] min-w-0">
        <h1 className="text-center font-sans text-[32px] text-[#1d2f16] sm:text-[40px] md:text-[48px]">Your Cart</h1>
        <p className="mt-3 text-center text-[18px] text-[#1d2f16]">{freeShippingCartMessage(remaining)}</p>
        {b2g1Hint ? (
          <p className="mt-2 text-center text-[15px] text-[#1d2f16]/75">
            Add {3 - (cart.count % 3)} more item{3 - (cart.count % 3) === 1 ? "" : "s"} to get one free with Buy 2 get 1 free.
          </p>
        ) : null}
        <div className="mx-auto mt-6 h-1.5 max-w-[640px] overflow-hidden rounded-full bg-[#ece7df]">
          <motion.div
            className="h-full bg-[#1d2f16]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
        </div>
        {cart.lines.length === 0 ? (
          <p className="mt-16 text-center text-[18px]">
            Your cart is empty. <Link href="/products" className="underline">Browse meals</Link>
          </p>
        ) : (
          <>
            <div className="mt-14 hidden grid-cols-[1.4fr_0.6fr_0.6fr_0.6fr] text-[13px] tracking-[0.14em] text-[#1d2f16] md:grid">
              <span>PRODUCT</span>
              <span className="text-center">PRICE</span>
              <span className="text-center">QUANTITY</span>
              <span className="text-right">TOTAL</span>
            </div>
            <AnimatePresence initial={false} mode="popLayout">
            {cart.lines.map((line) => (
              <motion.div
                key={line.id}
                layout
                variants={lineItemVariants}
                initial="hidden"
                animate="show"
                exit="exit"
                className="mt-6 min-w-0 border-t border-[#ece7df] py-6 md:grid md:grid-cols-[1.4fr_0.6fr_0.6fr_0.6fr] md:items-center md:gap-4"
              >
                <div className="flex min-w-0 gap-3 sm:gap-4">
                  <img
                    src={line.image}
                    alt=""
                    className="h-[80px] w-[80px] shrink-0 bg-[#f4efe6] object-contain sm:h-[88px] sm:w-[88px] md:h-[110px] md:w-[110px]"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="break-words font-sans text-[16px] leading-snug sm:text-[17px] md:text-[18px]">{line.name}</p>
                        <p className="mt-0.5 text-[13px] text-[#1d2f16]/80 sm:text-[14px]">{line.variant}</p>
                      </div>
                      <p className="shrink-0 text-[16px] font-semibold md:hidden">{formatInr(line.price * line.qty)}</p>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 md:hidden">
                      <QuantityStepper
                        value={line.qty}
                        onDecrease={() => cart.setQty(line.id, line.qty - 1)}
                        onIncrease={() => cart.setQty(line.id, line.qty + 1)}
                      />
                      <button
                        type="button"
                        className="text-[14px] text-[#1d2f16]/70 underline"
                        onClick={() => cart.removeLine(line.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
                <div className="hidden min-w-0 md:contents">
                  <p className="text-center">{formatInr(line.price)}</p>
                  <div className="flex justify-center">
                    <QuantityStepper
                      value={line.qty}
                      onDecrease={() => cart.setQty(line.id, line.qty - 1)}
                      onIncrease={() => cart.setQty(line.id, line.qty + 1)}
                    />
                  </div>
                  <p className="text-right font-medium">{formatInr(line.price * line.qty)}</p>
                </div>
              </motion.div>
            ))}
            </AnimatePresence>
            <div className="mt-6 border-t border-[#ece7df] pt-5 sm:mt-8 sm:pt-6 md:ml-auto md:max-w-[420px]">
              <div className="flex items-end justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[12px] tracking-[0.12em] sm:text-[13px]">ESTIMATED TOTAL</p>
                  <p className="mt-1.5 text-[13px] leading-snug text-[#1d2f16]/70 sm:mt-2 sm:text-[14px]">
                    Taxes and shipping calculated at checkout
                  </p>
                </div>
                <p className="shrink-0 text-[20px] font-semibold sm:text-[22px]">{formatInr(cart.subtotal)}</p>
              </div>
              {canCheckout ? (
                <motion.div whileTap={tapScale}>
                  <Link
                    href="/checkout"
                    className="mt-6 flex h-14 w-full items-center justify-center rounded-full bg-[#1d2f16] text-[18px] font-semibold text-white transition-colors duration-300 hover:bg-[#314e24] md:mt-8 md:text-[20px]"
                  >
                    Checkout
                  </Link>
                </motion.div>
              ) : (
                <button
                  type="button"
                  disabled
                  aria-disabled
                  className="mt-6 flex h-14 w-full cursor-not-allowed items-center justify-center rounded-full bg-[#1d2f16] text-[18px] font-semibold text-white opacity-60 md:mt-8 md:text-[20px]"
                >
                  Coming soon
                </button>
              )}
            </div>
          </>
        )}
      </RevealOnScroll>
    </div>
  );
}

export function CheckoutPage({ testMode = false }: { testMode?: boolean }) {
  const cart = useCart();
  const router = useRouter();
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<CheckoutFieldErrors>({});
  const [code, setCode] = useState("");
  const [appliedDiscountCode, setAppliedDiscountCode] = useState<string | null>(null);
  const [discountError, setDiscountError] = useState("");
  const [paying, setPaying] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [summaryOpen, setSummaryOpen] = useState(false);

  const unitPricesPaise = useMemo(
    () =>
      cart.lines.flatMap((line) =>
        Array.from({ length: line.qty }, () => rupeesToPaise(line.price)),
      ),
    [cart.lines],
  );

  const checkoutTotals = useMemo(() => {
    const subtotalPaise = rupeesToPaise(cart.subtotal);
    return computeCheckoutTotals(subtotalPaise, appliedDiscountCode, unitPricesPaise);
  }, [cart.subtotal, appliedDiscountCode, unitPricesPaise]);

  const deliveryEstimate = useMemo(() => getDeliveryEstimate(pinInput), [pinInput]);

  const hasItems = cart.lines.length > 0;
  const shippingDisplay = paiseToRupees(checkoutTotals.shippingPaise);
  const b2g1Display = paiseToRupees(checkoutTotals.b2g1Paise);
  const discountDisplay = paiseToRupees(checkoutTotals.discountPaise);
  const totalDisplay = paiseToRupees(checkoutTotals.totalPaise);

  function applyCode(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) {
      setDiscountError("");
      setAppliedDiscountCode(null);
      return;
    }

    const subtotalPaise = rupeesToPaise(cart.subtotal);
    const afterB2g1 = Math.max(0, subtotalPaise - checkoutTotals.b2g1Paise);
    const { discountCode } = resolveDiscount(trimmed, afterB2g1);

    if (!discountCode) {
      setDiscountError("This discount code isn't valid. Check the code and try again.");
      setAppliedDiscountCode(null);
      return;
    }

    setDiscountError("");
    setAppliedDiscountCode(discountCode);
    setCode(discountCode);
  }

  function clearFieldError(key: CheckoutFieldKey) {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setFieldErrors({});

    const data = new FormData(event.currentTarget);
    const validated = validateCheckoutForm(
      {
        email: String(data.get("email") ?? ""),
        country: String(data.get("country") ?? "India"),
        firstName: String(data.get("first") ?? ""),
        lastName: String(data.get("last") ?? ""),
        addressLine1: String(data.get("address") ?? ""),
        addressLine2: String(data.get("apartment") ?? ""),
        city: String(data.get("city") ?? ""),
        state: String(data.get("state") ?? ""),
        postalCode: String(data.get("pin") ?? ""),
      },
      { requireItems: true, hasItems: cart.lines.length > 0 },
    );

    if (!validated.ok) {
      setFieldErrors(validated.errors);
      setError(validated.formError ?? "Fix the highlighted fields and try again.");
      return;
    }

    const { email, firstName, lastName, address } = validated.data;

    const payload = {
      email,
      discountCode: appliedDiscountCode ?? undefined,
      items: cart.lines.map((line) => ({
        slug: line.slug,
        variant: line.variant,
        packageSize: line.variant,
        quantity: line.qty,
      })),
      address,
      note: cart.note.trim().slice(0, MAX_ORDER_NOTE_LENGTH),
      marketingOptIn: data.get("offers") === "on",
    };

    setPaying(true);

    try {
      const createRes = await fetch("/api/checkout/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const createData = await createRes.json();
      if (!createRes.ok) {
        throw new Error(createData.error || "Could not start payment");
      }

      await loadRazorpayScript();
      if (!window.Razorpay) {
        throw new Error("Razorpay checkout is unavailable");
      }

      const orderId = createData.orderId as string;

      const rzp = new window.Razorpay({
        key: createData.keyId,
        amount: createData.amount,
        currency: createData.currency,
        order_id: createData.razorpayOrderId,
        name: "InstaMealz",
        description: "Meal order",
        prefill: { email, name: `${firstName} ${lastName}` },
        handler: async (response) => {
          try {
            const verifyRes = await fetch("/api/checkout/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) {
              throw new Error(verifyData.error || "Payment verification failed");
            }
            cart.clear();
            router.push(`/checkout/success?order=${orderId}`);
          } catch (verifyError) {
            setPaying(false);
            setError(verifyError instanceof Error ? verifyError.message : "Payment verification failed");
          }
        },
        modal: {
          ondismiss: () => setPaying(false),
        },
      });

      rzp.on("payment.failed", (response) => {
        setPaying(false);
        setError(response.error?.description || "Payment failed. Try again.");
      });

      rzp.open();
    } catch (checkoutError) {
      setPaying(false);
      setError(checkoutError instanceof Error ? checkoutError.message : "Checkout failed");
    }
  }

  const payLabel = paying ? "Opening payment…" : hasItems ? "Pay with Razorpay" : "Add items to checkout";

  return (
    <div className="min-w-0 overflow-x-clip bg-[#f7f4ef] pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] lg:pb-0">
      {testMode ? (
        <div className="bg-[#fff8e6] px-6 py-3 text-center text-[14px] text-[#5c4a00]">
          Sandbox mode — Razorpay test keys and the sandbox Turso database are active. No live charges.
        </div>
      ) : null}
      <div className="grid min-w-0 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <aside className="order-1 min-w-0 border-b border-[#e3ddd3] bg-[#f7f4ef] lg:order-2 lg:border-b-0 lg:px-12 lg:py-10">
          <button
            type="button"
            className="flex w-full min-w-0 items-center justify-between gap-3 px-5 py-4 text-left lg:hidden"
            aria-expanded={summaryOpen}
            onClick={() => setSummaryOpen((open) => !open)}
          >
            <span className="flex min-w-0 flex-1 items-center gap-2 text-[14px] font-medium text-[#1d2f16] sm:text-[15px]">
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                aria-hidden
                className={`shrink-0 transition-transform duration-200 ${summaryOpen ? "rotate-180" : ""}`}
              >
                <path d="M2 4.5L6 8.5L10 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span className="truncate">Order summary</span>
              <span className="shrink-0 font-normal text-[#666]">({cart.count})</span>
            </span>
            <span className="shrink-0 text-[16px] font-semibold text-[#1d2f16] sm:text-[17px]">{formatInr(totalDisplay)}</span>
          </button>
          <div className={`min-w-0 px-5 pb-5 lg:px-0 lg:pb-0 ${summaryOpen ? "block" : "hidden"} lg:block`}>
            <AnimatePresence initial={false} mode="popLayout">
              {cart.lines.map((line) => (
                <motion.div
                  key={line.id}
                  layout
                  variants={lineItemVariants}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  className="mb-4 flex min-w-0 items-start gap-3 border-b border-[#e8e2d8] pb-4 last:mb-0 last:border-0 last:pb-0 lg:items-center lg:gap-4 lg:border-0 lg:pb-0"
                >
                  <div className="relative shrink-0">
                    <img
                      src={line.image}
                      alt=""
                      className="h-14 w-14 rounded-md border border-[#ece7df] bg-white object-contain lg:h-16 lg:w-16 lg:border-0"
                    />
                    <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#1d2f16] px-1 text-[11px] font-medium text-white">
                      {line.qty}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="break-words text-[15px] font-medium leading-snug text-[#1d2f16]">{line.name}</p>
                    <p className="mt-0.5 text-[13px] text-[#666]">{line.variant}</p>
                  </div>
                  <p className="shrink-0 text-[15px] font-medium">{formatInr(line.price * line.qty)}</p>
                </motion.div>
              ))}
            </AnimatePresence>
            <form onSubmit={applyCode} className="mt-5 lg:mt-6">
              <div className="flex gap-2 sm:gap-3">
                <input
                  value={code}
                  onChange={(event) => {
                    setCode(event.target.value);
                    if (discountError) setDiscountError("");
                  }}
                  placeholder="Discount code"
                  aria-invalid={Boolean(discountError)}
                  aria-describedby={discountError ? "checkout-discount-error" : undefined}
                  className={`h-12 min-w-0 flex-1 rounded-md border bg-white px-3 ${fieldBorder(Boolean(discountError))} ${inputClass}`}
                />
                <button
                  type="submit"
                  className="h-12 shrink-0 cursor-pointer rounded-md bg-[#e7e2da] px-4 text-[13px] font-medium tracking-wide transition-colors hover:bg-[#ddd6cb] sm:px-5 sm:text-[14px]"
                >
                  Apply
                </button>
              </div>
              <FieldError id="checkout-discount-error" message={discountError} />
              {appliedDiscountCode && !discountError ? (
                <p className="mt-2 text-[13px] text-[#314e24]">Code {appliedDiscountCode} applied.</p>
              ) : null}
            </form>
            <div className="mt-5 min-w-0 space-y-2.5 text-[15px] lg:mt-6">
              <div className="flex justify-between gap-3">
                <span className="min-w-0 text-[#444]">Subtotal · {cart.count} items</span>
                <span className="shrink-0">{formatInr(cart.subtotal)}</span>
              </div>
              {checkoutTotals.b2g1Paise > 0 ? (
                <div className="flex justify-between gap-3">
                  <span className="min-w-0 text-[#444]">Buy 2 get 1 free</span>
                  <span className="shrink-0">-{formatInr(b2g1Display)}</span>
                </div>
              ) : null}
              {checkoutTotals.discountPaise > 0 ? (
                <div className="flex justify-between gap-3">
                  <span className="min-w-0 truncate text-[#444]">{checkoutTotals.discountCode}</span>
                  <span className="shrink-0">-{formatInr(discountDisplay)}</span>
                </div>
              ) : null}
              <div className="flex justify-between gap-3">
                <span className="shrink-0 text-[#444]">Shipping</span>
                <span className="shrink-0 text-right">
                  {cart.subtotal === 0
                    ? "—"
                    : checkoutTotals.shippingPaise === 0
                      ? "Free"
                      : formatInr(shippingDisplay)}
                </span>
              </div>
              <div className="hidden items-end justify-between border-t border-[#e3ddd3] pt-3 text-[18px] font-semibold lg:flex">
                <span>Total</span>
                <span>
                  <span className="mr-2 text-[12px] font-normal text-[#666]">INR</span>
                  {formatInr(totalDisplay)}
                </span>
              </div>
            </div>
          </div>
        </aside>
        <form
          id="checkout-form"
          onSubmit={submit}
          className="order-2 min-w-0 max-w-full bg-white px-5 py-8 md:px-10 md:py-10 lg:order-1 lg:px-16"
        >
          <div className="mb-8 flex items-center justify-between gap-4 lg:mb-10">
            <div>
              <Link href="/cart" className="text-[14px] text-[#1d2f16]/70 underline lg:hidden">
                ← Back to cart
              </Link>
              <h1 className="mt-2 font-sans text-[28px] font-semibold text-[#1d2f16] md:text-[32px] lg:mt-0">
                Checkout
              </h1>
            </div>
            <p className="hidden text-right text-[15px] text-[#666] lg:block">
              {cart.count} item{cart.count === 1 ? "" : "s"} in your cart
            </p>
          </div>
          <section>
            <h2 className="text-[13px] font-medium tracking-[0.16em] text-[#1d2f16]">CONTACT</h2>
            <input
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Email"
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? "checkout-email-error" : undefined}
              onChange={() => clearFieldError("email")}
              className={`mt-4 h-12 w-full rounded-md border px-3 ${fieldBorder(Boolean(fieldErrors.email))} ${inputClass}`}
            />
            <FieldError id="checkout-email-error" message={fieldErrors.email} />
            <label className="mt-3 flex items-start gap-2 text-[14px] leading-snug">
              <input type="checkbox" name="offers" className="mt-0.5 shrink-0" />{" "}
              <span>Email me with news and offers</span>
            </label>
          </section>
          <section className="mt-8">
            <h2 className="text-[13px] font-medium tracking-[0.16em] text-[#1d2f16]">DELIVERY</h2>
            <label className="mt-4 block text-[12px] text-[#666]">
              Country/Region
              <select
                name="country"
                aria-invalid={Boolean(fieldErrors.country)}
                onChange={() => clearFieldError("country")}
                className={`mt-1 h-12 w-full rounded-md border px-3 text-[16px] text-[#1b1b1b] ${fieldBorder(Boolean(fieldErrors.country))} ${inputClass}`}
                defaultValue="India"
              >
                <option>India</option>
              </select>
              <FieldError message={fieldErrors.country} />
            </label>
            <div className="mt-3 grid min-w-0 gap-3 md:grid-cols-2">
              <div className="min-w-0">
                <input
                  name="first"
                  autoComplete="given-name"
                  placeholder="First name"
                  aria-invalid={Boolean(fieldErrors.first)}
                  onChange={() => clearFieldError("first")}
                  className={`h-12 w-full rounded-md border px-3 ${fieldBorder(Boolean(fieldErrors.first))} ${inputClass}`}
                />
                <FieldError message={fieldErrors.first} />
              </div>
              <div className="min-w-0">
                <input
                  name="last"
                  autoComplete="family-name"
                  placeholder="Last name"
                  aria-invalid={Boolean(fieldErrors.last)}
                  onChange={() => clearFieldError("last")}
                  className={`h-12 w-full rounded-md border px-3 ${fieldBorder(Boolean(fieldErrors.last))} ${inputClass}`}
                />
                <FieldError message={fieldErrors.last} />
              </div>
            </div>
            <input
              name="address"
              autoComplete="address-line1"
              placeholder="Address"
              aria-invalid={Boolean(fieldErrors.address)}
              onChange={() => clearFieldError("address")}
              className={`mt-3 h-12 w-full rounded-md border px-3 ${fieldBorder(Boolean(fieldErrors.address))} ${inputClass}`}
            />
            <FieldError message={fieldErrors.address} />
            <input
              name="apartment"
              autoComplete="address-line2"
              placeholder="Apartment, suite, etc. (optional)"
              aria-invalid={Boolean(fieldErrors.apartment)}
              onChange={() => clearFieldError("apartment")}
              className={`mt-3 h-12 w-full rounded-md border px-3 ${fieldBorder(Boolean(fieldErrors.apartment))} ${inputClass}`}
            />
            <FieldError message={fieldErrors.apartment} />
            <div className="mt-3 grid min-w-0 gap-3">
              <div className="min-w-0">
                <input
                  name="city"
                  autoComplete="address-level2"
                  placeholder="City"
                  aria-invalid={Boolean(fieldErrors.city)}
                  onChange={() => clearFieldError("city")}
                  className={`h-12 w-full rounded-md border px-3 ${fieldBorder(Boolean(fieldErrors.city))} ${inputClass}`}
                />
                <FieldError message={fieldErrors.city} />
              </div>
              <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="min-w-0">
                  <label className="sr-only" htmlFor="checkout-state">
                    State
                  </label>
                  <select
                    id="checkout-state"
                    name="state"
                    autoComplete="address-level1"
                    aria-invalid={Boolean(fieldErrors.state)}
                    onChange={() => clearFieldError("state")}
                    className={`h-12 w-full rounded-md border px-3 ${fieldBorder(Boolean(fieldErrors.state))} ${inputClass}`}
                    defaultValue="Gujarat"
                  >
                    {INDIAN_STATES_AND_UTS.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                  <FieldError message={fieldErrors.state} />
                </div>
                <div className="min-w-0">
                  <input
                    name="pin"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    placeholder="PIN code"
                    maxLength={6}
                    aria-invalid={Boolean(fieldErrors.pin)}
                    onChange={(event) => {
                      setPinInput(event.target.value);
                      clearFieldError("pin");
                    }}
                    className={`h-12 w-full rounded-md border px-3 ${fieldBorder(Boolean(fieldErrors.pin))} ${inputClass}`}
                  />
                  <FieldError message={fieldErrors.pin} />
                </div>
              </div>
            </div>
            {deliveryEstimate ? (
              <p className="mt-3 text-[14px] text-[#666]">
                {deliveryEstimate.dispatchNote} {deliveryEstimate.label}.
              </p>
            ) : null}
          </section>
          <section className="mt-8">
            <label className="block text-[15px] font-medium leading-snug text-[#1d2f16] md:text-[13px] md:uppercase md:tracking-[0.16em]" htmlFor="checkout-order-note">
              Add a note to your order
            </label>
            <textarea
              id="checkout-order-note"
              value={cart.note}
              maxLength={MAX_ORDER_NOTE_LENGTH}
              onChange={(event) => cart.setNote(event.target.value)}
              placeholder="Delivery instructions, spice level, or anything we should know"
              className={`mt-3 min-h-[96px] w-full resize-y rounded-md border border-[#d9d0c3] p-3 ${inputClass} md:min-h-[6rem] md:resize-none`}
            />
          </section>
          <section className="mt-8">
            <h2 className="text-[13px] font-medium tracking-[0.16em] text-[#1d2f16]">SHIPPING METHOD</h2>
            <p className="mt-3 rounded-lg border border-[#ece7df] bg-[#f9f7f4] px-4 py-4 text-[14px] leading-relaxed text-[#555]">
              {cart.lines.length === 0
                ? "Add items to your cart to see shipping."
                : standardShippingCheckoutBlurb(checkoutTotals.shippingPaise === 0)}
            </p>
          </section>
          {/* <section className="mt-8">
            <h2 className="text-[13px] tracking-[0.16em]">PAYMENT</h2>
            <p className="mt-2 text-[14px] text-[#666]">
              You will complete payment securely with Razorpay (UPI, cards, netbanking, and more).
            </p>
          </section> */}
          {error ? (
            <p className="mt-4 rounded-lg border border-[#f0d4d1] bg-[#fdf5f4] px-4 py-3 text-[14px] text-[#c4554a]" role="alert">
              {error}
            </p>
          ) : null}
          <motion.button
            type="submit"
            disabled={paying || !hasItems}
            className="mt-6 hidden h-14 w-full items-center justify-center rounded-full bg-[#1d2f16] text-[20px] font-semibold text-white transition-opacity duration-300 disabled:cursor-not-allowed disabled:opacity-60 enabled:cursor-pointer lg:flex"
            whileTap={paying || !hasItems ? undefined : tapScale}
          >
            {payLabel}
          </motion.button>
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-[#ece7df] pt-6 text-[13px] text-[#1d2f16]/80">
            <Link href="/returns" className="underline">Refund policy</Link>
            <Link href="/shipping" className="underline">Shipping policy</Link>
            <Link href="/privacy" className="underline">Privacy policy</Link>
            <Link href="/terms" className="underline">Terms of service</Link>
            <Link href="/contact" className="col-span-2 underline">Contact information</Link>
          </div>
        </form>
      </div>
      <div
        className="fixed inset-x-0 bottom-0 z-40 box-border w-full max-w-[100vw] border-t border-[#e3ddd3] bg-white/95 px-4 py-3 shadow-[0_-8px_24px_rgba(29,47,22,0.08)] backdrop-blur-sm lg:hidden"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto flex w-full max-w-lg items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[12px] tracking-[0.1em] text-[#666]">TOTAL</p>
            <p className="truncate text-[18px] font-semibold text-[#1d2f16] sm:text-[20px]">{formatInr(totalDisplay)}</p>
          </div>
          <motion.button
            type="submit"
            form="checkout-form"
            disabled={paying || !hasItems}
            className="h-11 max-w-[45%] shrink-0 rounded-full bg-[#1d2f16] px-4 text-[14px] font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-60 sm:h-12 sm:max-w-none sm:px-5 sm:text-[15px]"
            whileTap={paying || !hasItems ? undefined : tapScale}
          >
            {paying ? "Please wait…" : hasItems ? "Pay now" : "Add items"}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
