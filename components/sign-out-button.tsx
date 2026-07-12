"use client";

import { useTransition } from "react";
import { signOut } from "@/app/actions/auth";

/** Client button that invokes the server-side sign-out action. */
export function SignOutButton({ label }: { label: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => signOut())}
      className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
    >
      {label}
    </button>
  );
}
