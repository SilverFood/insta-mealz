import Link from "next/link";
import type { ReactNode } from "react";

type AdminShellProps = {
  children: ReactNode;
};

export function AdminShell({ children }: AdminShellProps) {
  return (
    <div className="flex min-h-full flex-col bg-[#fbfaf6] text-[#1d2f16]">
      <header className="border-b border-[#ede4d4] bg-white">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/admin" className="font-sans text-[18px] font-semibold tracking-tight sm:text-[20px]">
            InstaMealz Admin
          </Link>
          <Link
            href="/"
            className="text-[14px] text-[#83957c] underline-offset-2 hover:text-[#1d2f16] hover:underline"
          >
            View store
          </Link>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
