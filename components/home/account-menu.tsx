"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { signOut } from "@/app/actions/auth";
import { UserIcon } from "@/icons";

export interface AccountMenuUser {
  name: string;
  isAdmin?: boolean;
}

export interface AccountMenuProps {
  /** Logged-in user; `null`/`undefined` renders a sign-in affordance instead. */
  user?: AccountMenuUser | null;
}

/**
 * Header account control. Logged-in state opens a dropdown (name / admin link /
 * sign out); logged-out state is a link to /login. Auth state is resolved
 * server-side and passed in as `user`; sign-out calls the real Supabase server
 * action. Admin link + profile are stubs (homepage-only scope).
 */
export default function AccountMenu({ user }: AccountMenuProps) {
  const t = useTranslations("HomePage");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) {
    return (
      <a
        href="/login"
        className="flex h-10 w-10 items-center justify-center rounded border border-[#998C5F] transition-colors duration-200 hover:bg-white/10"
        aria-label={t("header.signIn")}
      >
        <UserIcon className="h-6 w-6 shrink-0 text-white" />
      </a>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={t("header.accountAria")}
        className="flex h-10 w-10 items-center justify-center rounded border border-[#998C5F] transition-colors duration-200 hover:bg-white/10"
      >
        <UserIcon className="h-6 w-6 shrink-0 text-white" />
      </button>

      {open && (
        <ul className="absolute top-full right-0 z-20 mt-2 w-48 overflow-hidden rounded-lg bg-[#0B0F12] shadow-lg ring-1 ring-white/10">
          <li className="px-4 py-3 text-sm font-bold text-white">
            {user.name}
          </li>
          <li>
            <a
              href="#"
              className="block px-4 py-3 text-sm text-white hover:bg-white/10"
            >
              {t("account.profile")}
            </a>
          </li>
          {user.isAdmin && (
            <li>
              <a
                href="#"
                className="block px-4 py-3 text-sm text-white hover:bg-white/10"
              >
                {t("account.adminDashboard")}
              </a>
            </li>
          )}
          <li>
            <form action={signOut}>
              <button
                type="submit"
                className="block w-full px-4 py-3 text-left text-sm text-white hover:bg-white/10"
              >
                {t("account.signOut")}
              </button>
            </form>
          </li>
        </ul>
      )}
    </div>
  );
}
