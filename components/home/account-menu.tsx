"use client";

import Link from "next/link";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { signOut } from "@/app/actions/auth";
import { useClickOutside } from "@/lib/hooks/use-click-outside";
import { UserIcon } from "@/icons";

export interface AccountMenuUser {
  name: string;
  isAdmin?: boolean;
  /** Link to the viewer's own profile. Falls back to "#" when absent. */
  profileHref?: string;
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
  const containerRef = useClickOutside<HTMLDivElement>(() => setOpen(false));

  if (!user) {
    return (
      <Link
        href="/login"
        className="flex h-10 w-10 items-center justify-center rounded border border-gold-line transition-colors duration-200 hover:bg-white/10"
        aria-label={t("header.signIn")}
      >
        <UserIcon className="h-6 w-6 shrink-0 text-white" />
      </Link>
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
        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded border border-gold-line transition-colors duration-200 hover:bg-white/10"
      >
        <UserIcon className="h-6 w-6 shrink-0 text-white" />
      </button>

      {open && (
        <ul className="absolute top-full right-0 z-20 mt-2 w-48 overflow-hidden rounded-lg bg-surface shadow-lg ring-1 ring-white/10">
          <li className="px-4 py-3 text-sm font-bold text-white">
            {user.name}
          </li>
          <li>
            <Link
              href={user.profileHref ?? "#"}
              className="block px-4 py-3 text-sm text-white hover:bg-white/10"
              onClick={() => setOpen(false)}
            >
              {t("account.profile")}
            </Link>
          </li>
          {/* `isAdmin` correctly gates visibility, but there is no admin route
              to point at yet — deliberately left as a stub. */}
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
                className="block w-full cursor-pointer px-4 py-3 text-left text-sm text-white hover:bg-white/10"
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
