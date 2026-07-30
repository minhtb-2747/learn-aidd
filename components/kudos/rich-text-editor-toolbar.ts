import type { JSX } from "react";
import { LinkIcon } from "@/icons";
import {
  type IconProps,
  BoldIcon,
  ItalicIcon,
  StrikethroughIcon,
  OrderedListIcon,
  BulletListIcon,
  QuoteIcon,
} from "./rich-text-editor-icons";

export type ToolbarCommand =
  | "bold"
  | "italic"
  | "strikeThrough"
  | "insertOrderedList"
  | "insertUnorderedList"
  | "link"
  | "quote";

export interface ToolbarButtonConfig {
  command: ToolbarCommand;
  label: string;
  Icon: (props: IconProps) => JSX.Element;
}

/**
 * Builds the `RichTextEditor` toolbar button config with translated labels.
 * Split out of `rich-text-editor.tsx` to keep that file under the 200-line
 * guideline once it grew a translation hook for these labels.
 */
export function getToolbarButtons(t: (key: string) => string): ToolbarButtonConfig[] {
  return [
    { command: "bold", label: t("bold"), Icon: BoldIcon },
    { command: "italic", label: t("italic"), Icon: ItalicIcon },
    { command: "strikeThrough", label: t("strikethrough"), Icon: StrikethroughIcon },
    { command: "insertOrderedList", label: t("orderedList"), Icon: OrderedListIcon },
    { command: "insertUnorderedList", label: t("bulletList"), Icon: BulletListIcon },
    { command: "link", label: t("insertLink"), Icon: LinkIcon },
    { command: "quote", label: t("quote"), Icon: QuoteIcon },
  ];
}
