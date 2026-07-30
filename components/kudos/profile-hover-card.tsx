"use client";

import { useRef, useState, type ReactNode } from "react";
import { PenIcon } from "@/icons";
import { cn } from "@/lib/utils/cn.utils";
import type { KudosPerson } from "@/lib/kudos/mock-data";
import { useKudosModals } from "./kudos-modals-provider";
import HeroBadge from "./hero-badge";

const CARD_WIDTH = 344;
const CARD_HEIGHT = 320; // approximate, for the below/above flip decision
const CLOSE_DELAY = 150;
// Mock — the full unit path + kudos counts (design values). Real data would
// come from the user record; every mock person resolves to the same demo card.
const DEPARTMENT_PATH =
  "Culture & Communication Executive/C&C Line/HRD Unit/OPD Center";
const KUDOS_RECEIVED = 25;
const KUDOS_SENT = 25;

export interface ProfileHoverCardProps {
  person: KudosPerson;
  children: ReactNode;
  className?: string;
}

/**
 * Wraps an avatar/name trigger and reveals a mini-profile card on hover
 * (MoMorph node `2268:35101`): name, unit path, Hero badge, kudos counts, and
 * a "Gửi KUDO" button that opens the Write dialog. Fixed-positioned so it
 * escapes card/carousel `overflow`; a short close delay lets the pointer
 * travel into the card to click the button. Unit/counts are mock literals.
 */
export default function ProfileHoverCard({
  person,
  children,
  className,
}: ProfileHoverCardProps) {
  const { openWrite } = useKudosModals();
  const ref = useRef<HTMLSpanElement>(null);
  const timer = useRef<number | null>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  function open() {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const left = Math.min(
      Math.max(rect.left, 8),
      window.innerWidth - CARD_WIDTH - 8,
    );
    // Open below the trigger, or flip above when there isn't room below.
    const roomBelow = window.innerHeight - rect.bottom;
    const top =
      roomBelow >= CARD_HEIGHT + 16
        ? rect.bottom + 8
        : Math.max(8, rect.top - CARD_HEIGHT - 8);
    setPos({ top, left });
  }

  function scheduleClose() {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setPos(null);
      timer.current = null;
    }, CLOSE_DELAY);
  }

  return (
    <span
      ref={ref}
      className={cn("relative", className)}
      onMouseEnter={open}
      onMouseLeave={scheduleClose}
    >
      {children}

      {pos && (
        <div
          style={{ top: pos.top, left: pos.left, width: CARD_WIDTH }}
          onMouseEnter={open}
          onMouseLeave={scheduleClose}
          className="fixed z-60 flex flex-col gap-4 rounded-2xl border border-gold-line/40 bg-[#00101A] p-6 text-left shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
        >
          <div className="flex flex-col gap-2">
            <p className="text-xl leading-7 font-bold text-white">
              {person.name}
            </p>
            <p className="text-sm leading-5 font-bold text-white/70">
              Tên đơn vị: {DEPARTMENT_PATH}
            </p>
            <HeroBadge badge={person.badge} className="mt-1 w-fit" />
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-base leading-6 font-bold text-white">
              Số Kudos nhận được:{" "}
              <span className="text-gold">{KUDOS_RECEIVED}</span>
            </p>
            <p className="text-base leading-6 font-bold text-white">
              Số Kudos đã gửi: <span className="text-gold">{KUDOS_SENT}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={openWrite}
            className="flex items-center justify-center gap-2 rounded-lg bg-gold px-4 py-3 text-base leading-6 font-bold text-ink transition-colors duration-150 hover:bg-gold-glow"
          >
            <PenIcon className="h-5 w-5 shrink-0" />
            Gửi KUDO
          </button>
        </div>
      )}
    </span>
  );
}
