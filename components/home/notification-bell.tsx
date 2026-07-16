"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useClickOutside } from "@/lib/hooks/use-click-outside";
import { BellIcon } from "@/icons";

export interface NotificationItem {
  id: string;
  title: string;
  createdAt: string;
}

export interface NotificationBellProps {
  /** Mock/static notification list — no backend wired at this layer. */
  items?: NotificationItem[];
  /** Whether the unread red dot is shown. */
  hasUnread?: boolean;
}

/**
 * Header notification bell with a mock dropdown panel. Unread badge and
 * panel contents are presentational only; a later integration pass can
 * replace `items`/`hasUnread` with real data.
 */
export default function NotificationBell({
  items = [],
  hasUnread = false,
}: NotificationBellProps) {
  const t = useTranslations("HomePage");
  const [open, setOpen] = useState(false);
  const containerRef = useClickOutside<HTMLDivElement>(() => setOpen(false));

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={t("header.notificationsAria")}
        className="relative flex h-10 w-10 items-center justify-center rounded bg-transparent transition-colors duration-200 hover:bg-white/10"
      >
        <BellIcon className="h-6 w-6 shrink-0 text-white" />
        {hasUnread && (
          <span
            className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#D4271D]"
            aria-hidden="true"
          />
        )}
      </button>

      {open && (
        <div className="absolute top-full right-0 z-20 mt-2 w-72 overflow-hidden rounded-lg bg-[#0B0F12] p-2 shadow-lg ring-1 ring-white/10">
          {items.length === 0 ? (
            <p className="px-3 py-4 text-center text-sm text-white/60">
              {t("header.noNotifications")}
            </p>
          ) : (
            <ul>
              {items.map((item) => (
                <li
                  key={item.id}
                  className="rounded px-3 py-2 hover:bg-white/10"
                >
                  <p className="text-sm font-bold text-white">{item.title}</p>
                  <p className="text-xs text-white/50">{item.createdAt}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
