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
  openWrite: () => void;
  openEdit: (initial: WriteKudosInitial) => void;
  openRules: () => void;
}

const noop = () => {};
const noopEdit: (initial: WriteKudosInitial) => void = () => {};

// Defaults to no-ops so a consumer rendered without the provider degrades
// gracefully instead of throwing. The provider lives in the root layout, so
// the real openers are available on every page in practice.
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
 * Holds the Write-Kudos dialog + Rules-panel open state once for the whole app
 * (mounted in the root layout) and renders both modals, so every trigger — the
 * `/kudos` banner pill via `KudosComposer` and the floating `WidgetButton` on
 * any page — drives the same instances. The dialog ⇄ rules handoff is wired here.
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
  // Bumped on every openWrite/openEdit call and used as the dialog's React
  // `key` — forces a fresh mount (fresh initial state) each time a NEW
  // compose/edit session starts. The Rules-panel hand-off below toggles
  // `writeOpen` directly (not through openWrite/openEdit), so it keeps the
  // same instance and the in-progress draft survives that round-trip.
  const [seedToken, setSeedToken] = useState(0);

  const value = useMemo(
    () => ({
      openWrite: () => {
        setMode("create");
        setInitial(undefined);
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
        onOpenRules={() => {
          setWriteOpen(false);
          setRulesOpen(true);
        }}
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
