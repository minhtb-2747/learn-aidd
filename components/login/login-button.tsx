"use client";

import { useFormStatus } from "react-dom";
import { GoogleIcon } from "./icons";

export interface LoginButtonProps {
  /** Button label (translated). */
  label: string;
  /** Error message (e.g. from `?error=auth`) shown below the button. */
  error?: string;
}

/**
 * Yellow "LOGIN With Google" submit button. Must be rendered inside a
 * `<form action={signInWithGoogle}>` — `useFormStatus` reads that form's
 * pending state to drive the disabled + spinner UI.
 */
export default function LoginButton({ label, error }: LoginButtonProps) {
  const { pending } = useFormStatus();

  return (
    <div className="flex flex-col items-start gap-3">
      <button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className="group flex items-center gap-2 rounded-lg bg-gold px-6 py-4 transition-shadow duration-200 hover:shadow-[0_8px_24px_rgba(255,234,158,0.35)] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:shadow-none"
      >
        <span className="text-[22px] leading-7 font-bold text-ink">
          {label}
        </span>
        {pending ? (
          <span
            className="h-6 w-6 shrink-0 animate-spin rounded-full border-2 border-ink/30 border-t-ink"
            aria-hidden="true"
          />
        ) : (
          <GoogleIcon className="h-6 w-6 shrink-0" />
        )}
      </button>

      {error && (
        <p role="alert" className="text-sm font-medium text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
