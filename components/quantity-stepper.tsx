"use client";

const stepperButtonClass =
  "flex h-9 w-9 shrink-0 items-center justify-center text-[22px] leading-none text-[#1d2f16] transition-colors hover:bg-[#f6efe4] active:bg-[#ede4d4]";

type QuantityStepperProps = {
  value: number;
  onDecrease: () => void;
  onIncrease: () => void;
  /** Product page / cart drawer use a stronger border */
  variant?: "default" | "emphasis";
  className?: string;
};

export function QuantityStepper({
  value,
  onDecrease,
  onIncrease,
  variant = "default",
  className = "",
}: QuantityStepperProps) {
  const borderClass = variant === "emphasis" ? "border-[#1d2f16]" : "border-[#d9d0c3]";

  return (
    <div
      className={`inline-flex h-11 w-[7.75rem] shrink-0 items-center justify-between rounded-md border bg-white px-1 ${borderClass} ${className}`}
    >
      <button type="button" aria-label="Decrease quantity" className={stepperButtonClass} onClick={onDecrease}>
        −
      </button>
      <span className="min-w-[1.25rem] text-center text-[16px] font-medium tabular-nums">{value}</span>
      <button type="button" aria-label="Increase quantity" className={stepperButtonClass} onClick={onIncrease}>
        +
      </button>
    </div>
  );
}
