"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useCart } from "@/components/cart-provider";
import { AnimatedOverlay } from "@/components/motion/animated-overlay";
import { staggerContainerVariants, staggerItemVariants, tapScale } from "@/components/motion/presets";

function getAboutHref(pathname: string) {
  return pathname.startsWith("/products/") ? "#story" : "/#story";
}

export function SiteHeader() {
  const { count, openDrawer } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const router = useRouter();
  const pathname = usePathname();
  const aboutHref = getAboutHref(pathname);
  const menuLinks = [
    { href: "/products", label: "Products", activePath: "/products" },
    { href: aboutHref, label: "About us" },
    { href: "/contact", label: "Contact us" },
    { href: "/cart", label: "Cart" },
  ];

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 8);
  });

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    const next = query.trim();
    router.push(next ? `/products?q=${encodeURIComponent(next)}` : "/products");
    setSearchOpen(false);
    setMenuOpen(false);
  }

  return (
    <header
      className={`sticky top-0 z-40 overflow-x-clip bg-white transition-shadow duration-300 ${scrolled ? "border-b border-[#ede4d4]/90 shadow-sm" : ""}`}
    >
      <div className="relative mx-auto flex h-[70px] items-center justify-between px-5 md:h-[100px] md:px-[69px]">
        <button
          type="button"
          className="md:hidden"
          aria-label="Open menu"
          onClick={() => setMenuOpen(true)}
        >
          <span className="block h-0.5 w-5 bg-[#314e24]" />
          <span className="mt-1.5 block h-0.5 w-5 bg-[#314e24]" />
          <span className="mt-1.5 block h-0.5 w-5 bg-[#314e24]" />
        </button>
        <nav className="hidden items-center gap-8 font-sans text-[20px] font-medium leading-5 text-[#314e24] md:flex lg:gap-16">
          <Link href="/products" className="link-nav">Products</Link>
          <Link href={aboutHref} className="link-nav">About us</Link>
        </nav>
        <Link href="/" className="absolute left-1/2 -translate-x-1/2">
          <img src="/images/logo.png" alt="InstaMealz" width={159} height={66} className="h-11 w-auto md:h-14 lg:h-[66px]" />
        </Link>
        <div className="flex items-center gap-5 md:gap-[18px]">
          <motion.button type="button" aria-label="Search" onClick={() => setSearchOpen((open) => !open)} whileTap={tapScale}>
            <img src="/icons/search.svg" alt="" width={24} height={24} />
          </motion.button>
          <motion.button type="button" aria-label="Cart" className="relative" onClick={openDrawer} whileTap={tapScale}>
            <img src="/icons/cart.svg" alt="" width={24} height={24} />
            <AnimatePresence>
              {count > 0 ? (
                <motion.span
                  key={count}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 22 }}
                  className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#314e24] px-1 text-[10px] text-white"
                >
                  {count}
                </motion.span>
              ) : null}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
      <AnimatePresence>
        {searchOpen ? (
          <motion.form
            key="search"
            onSubmit={submitSearch}
            className="overflow-hidden border-t border-[#ede4d4] px-5 md:px-[69px]"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="py-3">
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search meals"
                className="h-11 w-full rounded-full border border-[#1d2f16] px-5 text-[16px] outline-none transition-shadow duration-200 focus:shadow-[0_0_0_3px_rgba(29,47,22,0.15)]"
              />
            </div>
          </motion.form>
        ) : null}
      </AnimatePresence>
      <AnimatedOverlay
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        side="left"
        ariaLabel="Main menu"
        className="md:hidden"
        panelClassName="h-full w-[82%] max-w-[320px] bg-[#fbfaf6] p-6"
      >
        <div className="mb-8 flex items-center justify-between">
          <img src="/images/logo.png" alt="InstaMealz" width={120} height={50} className="h-12 w-auto" />
          <motion.button
            type="button"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
            className="text-2xl text-[#1d2f16]"
            whileTap={tapScale}
          >
            ×
          </motion.button>
        </div>
        <motion.nav
          className="flex flex-col gap-5 font-sans text-[20px] font-medium text-[#314e24]"
          variants={staggerContainerVariants}
          initial="hidden"
          animate="show"
        >
          {menuLinks.map((item) => (
            <motion.div key={item.href} variants={staggerItemVariants}>
              <Link
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={item.activePath && pathname === item.activePath ? "underline" : "link-nav"}
              >
                {item.label}
              </Link>
            </motion.div>
          ))}
        </motion.nav>
      </AnimatedOverlay>
    </header>
  );
}

function FooterNavSection({
  title,
  children,
  className = "",
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const panelId = `footer-${title.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className={className}>
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 py-3 text-left md:hidden"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="font-sans text-[16px] uppercase tracking-[1.32px]">{title}</span>
        <span className="shrink-0 text-[22px] leading-none text-[#1d2f16]/70" aria-hidden="true">
          {open ? "−" : "+"}
        </span>
      </button>
      <p className="hidden font-sans text-[22px] uppercase tracking-[1.32px] md:block">{title}</p>
      <ul
        id={panelId}
        className={`mt-0 space-y-2.5 pb-3 md:mt-3 md:block md:space-y-3 md:pb-0 ${open ? "block" : "hidden md:block"}`}
      >
        {children}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  const pathname = usePathname();
  const aboutHref = getAboutHref(pathname);

  return (
    <footer className="overflow-x-clip bg-[#ede4d4] text-[#1d2f16]">
      <div className="mx-auto grid max-w-[1440px] gap-8 px-5 py-10 md:grid-cols-[minmax(0,305px)_1fr] md:gap-16 md:px-[70px] md:py-[90px]">
        <div className="flex min-w-0 flex-col items-center gap-5 text-center md:items-start md:gap-6 md:text-left">
          <img
            src="/images/logo-footer.png"
            alt="InstaMealz"
            width={305}
            height={127}
            className="h-auto w-[min(100%,220px)] sm:w-[240px] md:w-[305px]"
          />
          <p className="max-w-[280px] font-sans text-[18px] font-semibold leading-snug sm:max-w-[320px] md:text-[20px]">
            We make real food, and take the water out.
          </p>
        </div>
        <nav
          aria-label="Footer"
          className="grid min-w-0 w-full grid-cols-1 divide-y divide-[#1d2f16]/10 text-left md:ml-auto md:w-fit md:max-w-full md:grid-cols-3 md:gap-x-12 md:divide-y-0 md:pt-4"
        >
          <FooterNavSection title="Help" className="min-w-0">
            <li>
              <Link href="/contact" className="link-footer text-[16px] leading-6 md:text-[18px]">
                Contact us
              </Link>
            </li>
            <li>
              <Link href="/track" className="link-footer text-[16px] leading-6 md:text-[18px]">
                Track order
              </Link>
            </li>
          </FooterNavSection>
          <FooterNavSection title="Corporate" className="min-w-0">
            <li>
              <Link href={aboutHref} className="link-footer text-[16px] leading-6 md:text-[18px]">
                About us
              </Link>
            </li>
            <li>
              <Link href="/shipping" className="link-footer text-[16px] leading-6 md:text-[18px]">
                Shipping policy
              </Link>
            </li>
            <li>
              <Link href="/returns" className="link-footer text-[16px] leading-6 md:text-[18px]">
                Return & Exchange
              </Link>
            </li>
          </FooterNavSection>
          <FooterNavSection title="Get in touch" className="min-w-0">
            <li>
              <a
                href="mailto:info@instamealz.in"
                className="link-footer text-[16px] leading-6 whitespace-normal break-words md:whitespace-nowrap md:text-[18px]"
              >
                info@instamealz.in
              </a>
            </li>
          </FooterNavSection>
        </nav>
      </div>
      <div className="border-t border-[#1d2f16]/10">
        <div className="mx-auto flex max-w-[1440px] min-w-0 flex-col gap-3 px-5 py-6 text-center text-[13px] leading-relaxed text-black/35 sm:text-[14px] md:flex-row md:items-center md:justify-between md:gap-8 md:px-[70px] md:py-8 md:text-left">
          <p className="min-w-0 font-[family-name:var(--font-legal)]">
            <span className="block sm:inline">© 2026 InstaMealz. All rights reserved.</span>{" "}
            <span className="block sm:inline">Designed by Gauraangee P Agarwal.</span>
          </p>
          <div className="flex shrink-0 flex-wrap justify-center gap-x-6 gap-y-2 font-[family-name:var(--font-legal)] md:justify-end">
            <Link href="/privacy" className="link-footer whitespace-nowrap">
              Privacy Policy
            </Link>
            <Link href="/terms" className="link-footer whitespace-nowrap">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
