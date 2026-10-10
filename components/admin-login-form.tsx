"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PageEntrance } from "@/components/motion/page-entrance";
import { hoverLift, tapScale } from "@/components/motion/presets";

const inputClass =
  "text-[16px] text-[#1b1b1b] outline-none focus:ring-2 focus:ring-[rgba(29,47,22,0.15)]";

type AdminLoginFormProps = {
  configured: boolean;
};

export function AdminLoginForm({ configured }: AdminLoginFormProps) {
  const router = useRouter();
  const [key, setKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!configured) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Could not sign in");
        return;
      }
      router.refresh();
    } catch {
      setError("Could not sign in. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="px-4 py-16 text-center text-[#1d2f16] sm:px-6 sm:py-20">
      <PageEntrance>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.35 }}
          className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#f1e9dd] text-[#314e24]"
          aria-hidden
        >
          <img src="/icons/user.svg" alt="" width={28} height={28} />
        </motion.div>
        <h1 className="font-sans text-[36px] font-semibold">Admin</h1>
        {!configured ? (
          <p className="mx-auto mt-4 max-w-md text-[18px] text-[#83957c]">
            Admin access is not configured. Set <span className="font-semibold text-[#1d2f16]">ADMIN_ACCESS_KEY</span> in
            your environment file.
          </p>
        ) : (
          <>
            <p className="mx-auto mt-4 max-w-md text-[18px]">Enter your access key to view orders.</p>
            <form onSubmit={onSubmit} className="mx-auto mt-8 max-w-sm text-left">
              <label htmlFor="admin-key" className="sr-only">
                Access key
              </label>
              <input
                id="admin-key"
                type="password"
                autoComplete="off"
                value={key}
                onChange={(event) => setKey(event.target.value)}
                placeholder="Access key"
                className={`h-12 w-full rounded-full border border-[#1d2f16] px-5 ${inputClass}`}
              />
              {error ? <p className="mt-3 text-center text-[15px] text-[#c4554a]">{error}</p> : null}
              <motion.div className="mt-6 text-center" whileHover={hoverLift} whileTap={tapScale}>
                <button
                  type="submit"
                  disabled={submitting || !key.trim()}
                  className="btn-primary inline-flex h-12 min-w-[160px] items-center justify-center px-8 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Signing in…" : "Continue"}
                </button>
              </motion.div>
            </form>
          </>
        )}
      </PageEntrance>
    </div>
  );
}
