"use client";

import type { ReactNode } from "react";
import { PageEntrance } from "@/components/motion/page-entrance";
import { RevealOnScroll } from "@/components/motion/reveal-on-scroll";

export default function InfoPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-white px-6 py-16 text-[#1d2f16]">
      <PageEntrance>
        <article className="mx-auto max-w-[720px]">
          <h1 className="font-sans text-[28px] font-semibold sm:text-[36px]">{title}</h1>
          <RevealOnScroll className="mt-6 space-y-4 text-[18px] leading-7">{children}</RevealOnScroll>
        </article>
      </PageEntrance>
    </div>
  );
}
