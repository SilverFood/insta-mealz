"use client";

import { processHeading, processSteps } from "@/lib/products";

type ProcessStorySectionProps = {
  sectionClassName?: string;
  innerClassName?: string;
  headingClassName?: string;
  cardClassName?: string;
  bodyClassName?: string;
  stickyTopClassName?: string;
};

function mergeClasses(...parts: Array<string | undefined>) {
  return parts.filter(Boolean).join(" ");
}

const cardLeavesByStep = [
  [
    "absolute -left-16 top-6 w-[30px] -rotate-[34deg] md:-left-20 md:w-[36px]",
    "absolute -right-16 bottom-10 w-[31px] rotate-[198deg] md:-right-20 md:w-[36px]",
  ],
  [
    "absolute -left-28 top-4 w-[30px] -rotate-[74deg] md:-left-32 md:w-[35px]",
    "absolute -left-16 top-20 w-[31px] -rotate-[16deg] md:-left-20 md:w-[36px]",
    "absolute -right-28 bottom-12 w-[31px] rotate-[166deg] md:-right-32 md:w-[36px]",
  ],
  [
    "absolute -left-40 top-2 w-[30px] -rotate-[36deg] md:-left-44 md:w-[35px]",
    "absolute -left-30 top-[72px] w-[31px] -rotate-[78deg] md:-left-34 md:w-[36px]",
    "absolute -left-16 top-32 w-[30px] -rotate-[12deg] md:-left-20 md:w-[35px]",
    "absolute -right-40 bottom-14 w-[31px] rotate-[210deg] md:-right-44 md:w-[36px]",
    "absolute -right-24 bottom-28 w-[30px] rotate-[134deg] md:-right-28 md:w-[35px]",
  ],
  [
    "absolute -left-56 top-0 w-[30px] -rotate-[42deg] md:-left-60 md:w-[35px]",
    "absolute -left-42 top-16 w-[31px] -rotate-[82deg] md:-left-46 md:w-[36px]",
    "absolute -left-24 top-[136px] w-[30px] -rotate-[10deg] md:-left-28 md:w-[35px]",
    "absolute -right-56 bottom-14 w-[31px] rotate-[212deg] md:-right-60 md:w-[36px]",
    "absolute -right-40 bottom-30 w-[30px] rotate-[164deg] md:-right-44 md:w-[35px]",
    "absolute -right-22 bottom-[168px] w-[29px] rotate-[122deg] md:-right-26 md:w-[34px]",
  ],
] as const;

export function ProcessStorySection({
  sectionClassName,
  innerClassName,
  headingClassName,
  cardClassName,
  bodyClassName,
  stickyTopClassName,
}: ProcessStorySectionProps) {
  const headerOffset = "clamp(128px, 15vw, 168px)";
  const headingHeight = "clamp(78px, 10vw, 108px)";
  const headingCardGap = "clamp(22px, 4vw, 36px)";
  const headingClearance = `calc(${headingHeight} + ${headingCardGap})`;
  const cardHeight = "clamp(390px, 42vw, 420px)";
  const cardStackOffset = 12;
  const cardScrollStride = "clamp(46vh, 50vh, 56vh)";
  const finalReleaseSpace = "clamp(70vh, 76vh, 84vh)";
  const headingReleaseBuffer = "clamp(18vh, 22vh, 28vh)";
  const stackTransitions = Math.max(processSteps.length - 1, 1);
  const headingReleaseTrack = `calc(${stackTransitions} * (${cardHeight} + ${cardScrollStride}) + ${headingReleaseBuffer})`;
  const baseCardTop = `max(calc(${headerOffset} + ${headingClearance}), calc(50vh - 210px))`;

  return (
    <section
      id="story"
      className={mergeClasses("scroll-mt-[clamp(132px,16vw,176px)] bg-white px-5 py-8 text-[#1d2f16]", sectionClassName)}
    >
      <div className={mergeClasses("mx-auto max-w-[806px]", innerClassName)}>
        <div className="relative pb-[8vh] md:pb-[10vh]">
          <div className="pointer-events-none absolute inset-x-0 top-0 z-30" style={{ height: headingReleaseTrack }}>
            <div className={mergeClasses("sticky py-2", stickyTopClassName)} style={{ top: headerOffset }}>
              <h2
                className={mergeClasses(
                  "mx-auto max-w-[760px] text-center font-sans text-[26px] leading-snug md:text-[32px]",
                  headingClassName,
                )}
              >
                {processHeading}
              </h2>
            </div>
          </div>

          <div style={{ paddingTop: headingClearance }}>
            {processSteps.map((step, index) => {
              const noteTilt = (index % 2 === 0 ? -1 : 1) * 0.35;
              const leavesForStep = cardLeavesByStep[index] ?? cardLeavesByStep[cardLeavesByStep.length - 1];

              return (
                <article
                  key={step.body}
                  className="sticky mx-auto h-[420px] w-full max-w-[760px] overflow-visible md:h-[390px]"
                  style={{
                    top: `calc(${baseCardTop} + ${index * cardStackOffset}px)`,
                    zIndex: 10 + index,
                    marginBottom: cardScrollStride,
                  }}
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 z-0 hidden md:block"
                  >
                    {leavesForStep.map((leafClassName) => (
                      <img
                        key={`${step.title}-${leafClassName}`}
                        src="/images/leaf-06.png"
                        alt=""
                        className={mergeClasses(
                          "absolute select-none mix-blend-multiply opacity-[0.92] [filter:brightness(0)_saturate(100%)_invert(18%)_sepia(54%)_saturate(562%)_hue-rotate(351deg)_brightness(98%)_contrast(87%)]",
                          leafClassName,
                        )}
                      />
                    ))}
                  </div>
                  <div
                    className={mergeClasses(
                      "relative z-10 flex h-full w-full flex-col justify-center rounded-[16px] border-[3px] border-white/95 text-center shadow-[0_10px_24px_rgba(29,47,22,0.12)] ring-1 ring-[#1d2f16]/8 transition-transform duration-300 ease-out will-change-transform [backface-visibility:hidden] [transform:translateZ(0)] md:rounded-[18px]",
                      step.className,
                      cardClassName,
                    )}
                    style={{ transform: `translateZ(0) rotate(${noteTilt}deg)` }}
                  >
                    <h3 className="mb-5 px-4 font-sans text-[20px] leading-snug md:text-[24px]">{step.title}</h3>
                    <p className={mergeClasses("mx-auto max-w-[34ch] text-[18px] leading-[1.6] tracking-[0.01em] md:text-[20px] md:leading-[1.7]", bodyClassName)}>
                      {step.body}
                    </p>
                  </div>
                </article>
              );
            })}
            <div aria-hidden className="h-[clamp(70vh,76vh,84vh)]" style={{ height: finalReleaseSpace }} />
          </div>
        </div>
      </div>
    </section>
  );
}
