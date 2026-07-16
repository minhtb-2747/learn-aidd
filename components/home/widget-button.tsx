"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { PenIcon } from "@/icons";
import { cn } from "@/lib/utils/cn.utils";

/**
 * Floating bottom-right widget. Closed: a yellow pill (pencil + SAA mark).
 * Open (Figma node 313:9139): the trigger morphs into a red circular close
 * button and a stacked quick-action menu ("Thể lệ" + "Viết KUDOS") animates in
 * above it. The menu stays mounted (positioned absolutely above the trigger) so
 * it can transition both in and out; the trigger cross-fades its icon while its
 * size / colour / radius morph. Actions are mock/static; labels are i18n.
 */
export default function WidgetButton() {
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

  const pillClass =
    "flex items-center gap-2 rounded bg-[#FFEA9E] p-4 shadow-[0_4px_4px_rgba(0,0,0,0.25),0_0_6px_#FAE287] transition-transform duration-200 hover:scale-[1.03]";
  const pillLabel =
    "text-2xl leading-8 font-bold text-[#00101A] no-wrap text-nowrap";

  return (
    <div ref={containerRef} className="fixed right-35.75 bottom-30 z-40 ">
      {/* Quick-action menu — stays mounted, animates in/out above the trigger */}
      <div
        className={cn(
          "absolute right-0 bottom-full mb-5 flex flex-col items-end gap-5 transition-all duration-300 ease-out",
          open
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0",
        )}
      >
        <a
          href="#"
          className={pillClass}
          style={{ transitionDelay: open ? "80ms" : "0ms" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- static presentational icon */}
          <img
            src="/images/home/widget-saa.svg"
            alt=""
            width={24}
            height={24}
            className="h-6 w-6 shrink-0"
          />
          <span className={pillLabel}>{t("widget.awardRules")}</span>
        </a>

        <a
          href="#"
          className={pillClass}
          style={{ transitionDelay: open ? "40ms" : "0ms" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- static presentational icon */}
          <img
            src="/images/home/widget-pen.svg"
            alt=""
            width={24}
            height={24}
            className="h-6 w-6 shrink-0"
          />
          <span className={pillLabel}>{t("widget.writeKudos")}</span>
        </a>
      </div>

      {/* Trigger ⇄ close — morphs size / colour / radius, cross-fades its icon */}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={open ? t("widget.close") : t("widget.aria")}
        className={cn(
          "cursor-pointer relative ml-auto flex items-center justify-center overflow-hidden rounded-full shadow-[0_4px_4px_rgba(0,0,0,0.25),0_0_6px_#FAE287] transition-all duration-300 ease-out hover:scale-105",
          open ? "h-14 w-14 bg-[#D4271D]" : "h-16 w-[106px] bg-[#FFEA9E]",
        )}
      >
        {/* closed content: pencil + SAA mark */}
        <span
          className={cn(
            "flex items-center gap-2 transition-opacity duration-200",
            open ? "opacity-0" : "opacity-100",
          )}
        >
          <PenIcon className="h-6 w-6 shrink-0 text-[#00101A]" />
          {/* eslint-disable-next-line @next/next/no-img-element -- static presentational icon */}
          <img
            src="/images/home/icon-widget-kudos.svg"
            alt=""
            width={20}
            height={18}
            className="h-[18px] w-5"
          />
        </span>

        {/* open content: close (✕) */}
        {/* eslint-disable-next-line @next/next/no-img-element -- static presentational icon */}
        <img
          src="/images/home/widget-close.svg"
          alt=""
          width={24}
          height={24}
          className={cn(
            "absolute h-6 w-6 transition-opacity duration-200",
            open ? "opacity-100" : "opacity-0",
          )}
        />
      </button>
    </div>
  );
}
