"use client";

import { RevealOnScroll } from "@/components/motion/reveal-on-scroll";
import { comparisonRows } from "@/lib/products";

type CompetitorComparisonSectionProps = {
  sectionClassName?: string;
};

export function CompetitorComparisonSection({
  sectionClassName = "bg-white px-5 py-16",
}: CompetitorComparisonSectionProps) {
  return (
    <section className={sectionClassName}>
      <RevealOnScroll className="mx-auto mb-8 max-w-[642px] text-center text-[#1d2f16]">
        <h2 className="font-sans text-[28px] md:text-[32px]">Compare us to our competitors</h2>
        <p className="mt-3 text-[18px] md:text-[20px]">
          Retort cooks your food for a second time, then ships the water along with it. We do neither.
        </p>
      </RevealOnScroll>
      <RevealOnScroll className="relative mx-auto max-w-[1012px]">
        <div className="relative -mx-5 overflow-x-auto px-5 md:mx-0 md:overflow-visible md:px-0">
          <div className="relative min-w-[320px] md:min-w-0 md:pb-3 md:pr-3">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 hidden rounded-[27px] bg-[#314e24] md:block md:translate-x-3 md:translate-y-3"
            />
            <div className="relative z-10 min-w-0 rounded-[27px] bg-[#ede4d4]">
              <table className="w-full min-w-[320px] border-collapse text-center text-[14px] text-[#1d2f16] md:text-[20px]">
                <thead>
                  <tr className="font-sans text-[12px] md:text-[24px]">
                    <th className="border-b border-r border-[#1d2f16]/30 p-2 md:p-4" />
                    <th className="border-b border-r border-[#1d2f16]/30 p-2 font-normal md:p-4">
                      <span className="md:hidden">InstaMealz</span>
                      <span className="hidden md:inline">InstaMealz – Freeze</span>
                    </th>
                    <th className="border-b border-[#1d2f16]/30 p-2 font-normal md:p-4">
                      <span className="md:hidden">Retort</span>
                      <span className="hidden md:inline">Retort Pouch</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row) => (
                    <tr key={row.label} className="transition-colors duration-200 hover:bg-[#e5d9c8]/60">
                      <th className="border-b border-r border-[#1d2f16]/30 p-2 text-left font-bold md:p-4 md:text-center">{row.label}</th>
                      <td className="border-b border-r border-[#1d2f16]/30 p-2 md:p-4">{row.freeze}</td>
                      <td className="border-b border-[#1d2f16]/30 p-2 md:p-4">{row.retort}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </RevealOnScroll>
    </section>
  );
}
