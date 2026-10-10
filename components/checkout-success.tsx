"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PageEntrance } from "@/components/motion/page-entrance";
import { hoverLift, tapScale } from "@/components/motion/presets";

export function CheckoutSuccess({ order }: { order?: string }) {
  return (
    <div className="bg-white px-5 py-16 text-center text-[#1d2f16] md:px-6 md:py-24">
      <PageEntrance>
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 420, damping: 24 }}
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#1d2f16] text-2xl text-white"
          aria-hidden
        >
          ✓
        </motion.div>
        <h1 className="font-sans text-[32px] font-semibold md:text-[40px]">Order received</h1>
        <p className="mx-auto mt-4 max-w-md text-[16px] leading-relaxed md:text-[18px]">
          Thank you — your payment was successful. We will prepare your meals for delivery.
        </p>
        {order ? (
          <p className="mt-4 text-[15px] text-[#666]">
            Order ID: <span className="font-semibold text-[#1d2f16]">{order}</span>
          </p>
        ) : null}
        <motion.div className="mt-8 inline-block" whileHover={hoverLift} whileTap={tapScale}>
          <Link href="/products" className="inline-flex h-12 items-center rounded-full bg-[#1d2f16] px-8 text-white transition-colors duration-300 hover:bg-[#314e24]">
            Back to products
          </Link>
        </motion.div>
      </PageEntrance>
    </div>
  );
}
