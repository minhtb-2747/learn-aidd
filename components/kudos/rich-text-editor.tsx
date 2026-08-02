"use client";

import { useEffect, useRef, type MouseEvent } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils/cn.utils";
import { getToolbarButtons, type ToolbarCommand } from "./rich-text-editor-toolbar";

export interface RichTextEditorState {
  hasContent: boolean;
  /** Plain text (`textContent`) — never HTML, so nothing here ever needs sanitisation on render. */
  text: string;
}

export interface RichTextEditorProps {
  placeholder: string;
  communityLabel: string;
  onOpenRules?: () => void;
  onChange?: (state: RichTextEditorState) => void;
  className?: string;
  /** Seed the editor's text (edit mode). Plain text, applied once on mount. */
  initialContent?: string;
}

/**
 * Rich-text field: a `contentEditable` region driven by toolbar buttons via
 * `document.execCommand` — still broadly supported, and light enough that no
 * editor library is warranted.
 */
export default function RichTextEditor({
  placeholder,
  communityLabel,
  onOpenRules,
  onChange,
  className,
  initialContent,
}: RichTextEditorProps) {
  const t = useTranslations("Kudos.editor");
  const editorRef = useRef<HTMLDivElement>(null);
  const toolbarButtons = getToolbarButtons(t);

  // Seeded once; the dialog remounts via a React `key` per edit session.
  useEffect(() => {
    const el = editorRef.current;
    if (!el || !initialContent) return;
    el.textContent = initialContent;
    onChange?.({ hasContent: true, text: initialContent });
  }, [initialContent, onChange]);

  function handleToolbarCommand(command: ToolbarCommand) {
    if (typeof document === "undefined") return;
    const editor = editorRef.current;
    editor?.focus();
    if (command === "link") {
      if (typeof window === "undefined") return;
      const url = window.prompt(t("insertLinkPrompt"));
      if (!url) return;
      // Only safe schemes — a `javascript:`/`data:` href here would be XSS.
      let parsed: URL;
      try {
        parsed = new URL(url, window.location.origin);
      } catch {
        return;
      }
      if (!["http:", "https:", "mailto:"].includes(parsed.protocol)) return;
      document.execCommand("createLink", false, parsed.href);
      return;
    }
    if (command === "quote") {
      document.execCommand("formatBlock", false, "blockquote");
      return;
    }
    document.execCommand(command);
  }

  // Keep the current text selection alive instead of losing it to button focus.
  function preserveSelection(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
  }

  function handleInput() {
    const el = editorRef.current;
    if (!el) return;
    const text = el.textContent ?? "";
    const isEmpty = text.trim().length === 0;
    // Browsers leave a stray <br> after deleting all text, which would stop
    // the CSS `:empty` placeholder from reappearing.
    if (isEmpty && el.innerHTML !== "") el.innerHTML = "";
    onChange?.({ hasContent: !isEmpty, text: isEmpty ? "" : text });
  }

  return (
    <div className={cn("flex w-full flex-col", className)}>
      <div className="flex w-full items-stretch rounded-t-lg border border-b-0 border-gold-line">
        <div className="flex items-stretch">
          {toolbarButtons.map(({ command, label, Icon }, index) => (
            <button
              key={command}
              type="button"
              title={label}
              aria-label={label}
              onMouseDown={preserveSelection}
              onClick={() => handleToolbarCommand(command)}
              className={cn(
                "flex h-10 w-14 cursor-pointer items-center justify-center border-r border-gold-line text-ink transition-colors hover:bg-gold/20",
                index === 0 && "rounded-tl-lg",
              )}
            >
              <Icon className="h-6 w-6" />
            </button>
          ))}
        </div>
        <div className="flex flex-1 items-center justify-end rounded-tr-lg px-6">
          <button
            type="button"
            onClick={onOpenRules}
            className="cursor-pointer text-base leading-6 font-bold tracking-[0.15px] text-danger hover:underline"
          >
            {communityLabel}
          </button>
        </div>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        data-placeholder={placeholder}
        onInput={handleInput}
        className="min-h-30 w-full rounded-b-lg border border-gold-line bg-white px-6 py-4 text-base leading-6 font-bold tracking-[0.15px] text-ink outline-none empty:before:text-black/40 empty:before:content-[attr(data-placeholder)]"
      />
    </div>
  );
}
