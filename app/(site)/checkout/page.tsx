import Link from "next/link";

export default function Page() {
  return (
    <main className="min-w-0 overflow-x-clip bg-[#f7f4ef] px-5 py-16 md:px-10 md:py-24">
      <section className="mx-auto max-w-[700px] rounded-2xl border border-[#e3ddd3] bg-white px-6 py-12 text-center shadow-[0_10px_30px_rgba(29,47,22,0.06)] sm:px-10">
        <p className="text-[13px] font-medium tracking-[0.14em] text-[#1d2f16]/70">CHECKOUT</p>
        <h1 className="mt-3 font-sans text-[34px] text-[#1d2f16] sm:text-[42px]">Coming soon</h1>
        <p className="mx-auto mt-4 max-w-[520px] text-[16px] leading-relaxed text-[#1d2f16]/80">
          We are finalizing the checkout experience and it will be available shortly.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/cart"
            className="flex h-12 min-w-[160px] items-center justify-center rounded-full border border-[#1d2f16] px-6 text-[15px] font-medium text-[#1d2f16] transition-colors hover:bg-[#f7f4ef]"
          >
            Back to cart
          </Link>
          <Link
            href="/products"
            className="flex h-12 min-w-[160px] items-center justify-center rounded-full bg-[#1d2f16] px-6 text-[15px] font-semibold text-white transition-colors hover:bg-[#314e24]"
          >
            Browse meals
          </Link>
        </div>
      </section>
    </main>
  );
}
