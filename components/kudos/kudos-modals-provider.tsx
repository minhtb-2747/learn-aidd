"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import WriteKudosDialog, { type WriteKudosInitial } from "./write-kudos-dialog";
import KudosRulesPanel from "./kudos-rules-panel";

interface KudosModalsContextValue {
  /**
   * Opens a fresh compose session; `initial` seeds the form. Takes an OPTIONAL
   * argument, so never hand it straight to `onClick` — React would pass the
   * `MouseEvent` as `initial`. Wrap it: `onClick={() => openWrite()}`.
   */
  openWrite: (initial?: WriteKudosInitial) => void;
  openEdit: (initial: WriteKudosInitial) => void;
  openRules: () => void;
}

const noop = () => {};
const noopEdit: (initial: WriteKudosInitial) => void = () => {};

// No-op defaults so a consumer rendered without the provider degrades instead
// of throwing; in practice the root layout mounts it on every page.
const KudosModalsContext = createContext<KudosModalsContextValue>({
  openWrite: noop,
  openEdit: noopEdit,
  openRules: noop,
});

/** Access the shared Kudos modal openers (Write dialog / Rules panel). */
export function useKudosModals(): KudosModalsContextValue {
  return useContext(KudosModalsContext);
}

/**
 * Holds Write-dialog + Rules-panel state once for the whole app (mounted in the
 * root layout), so every trigger drives the same instances. The dialog ⇄ rules
 * hand-off is wired here.
 */
export default function KudosModalsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [writeOpen, setWriteOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [initial, setInitial] = useState<WriteKudosInitial | undefined>(undefined);
  // The dialog's React `key`, bumped per openWrite/openEdit so each NEW compose
  // session remounts with a fresh `initial`. The rules hand-off leaves it alone,
  // which is what lets an in-progress draft survive opening the panel.
  const [seedToken, setSeedToken] = useState(0);

  const value = useMemo(
    () => ({
      openWrite: (nextInitial?: WriteKudosInitial) => {
        setMode("create");
        setInitial(nextInitial);
        setSeedToken((token) => token + 1);
        setWriteOpen(true);
      },
      openEdit: (nextInitial: WriteKudosInitial) => {
        setMode("edit");
        setInitial(nextInitial);
        setSeedToken((token) => token + 1);
        setWriteOpen(true);
      },
      openRules: () => setRulesOpen(true),
    }),
    [],
  );

  return (
    <KudosModalsContext.Provider value={value}>
      {children}
      <WriteKudosDialog
        key={seedToken}
        open={writeOpen}
        mode={mode}
        initial={initial}
        onClose={() => setWriteOpen(false)}
        hasLayerAbove={rulesOpen}
        // Deliberately does NOT close the dialog. The panel layers over it, so
        // the draft survives the round trip — closing here unmounts the form
        // and throws away whatever had been typed.
        onOpenRules={() => setRulesOpen(true)}
      />
      <KudosRulesPanel
        open={rulesOpen}
        onClose={() => setRulesOpen(false)}
        onWriteKudos={() => {
          setRulesOpen(false);
          setWriteOpen(true);
        }}
      />
    </KudosModalsContext.Provider>
  );
}
