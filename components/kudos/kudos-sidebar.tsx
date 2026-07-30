import { GiftIcon } from "@/icons";
import CampaignX2Badge from "./campaign-x2-badge";
import {
  sidebarStats,
  giftRecipients,
  type LeaderboardEntry,
} from "@/lib/kudos/mock-data";
import KudosAvatar from "./kudos-avatar";

export interface KudosSidebarProps {
  receivedLabel: string;
  sentLabel: string;
  heartsLabel: string;
  boxesOpenedLabel: string;
  boxesUnopenedLabel: string;
  openGiftLabel: string;
  giftBoardTitle: string;
}

/**
 * Right column of "ALL KUDOS" (MoMorph D, spec item `D`): the stats block
 * (5 counters + "Mở Secret Box" stub button) and the "gift recipients"
 * leaderboard (D.3), whose list scrolls within the card.
 */
export default function KudosSidebar({
  receivedLabel,
  sentLabel,
  heartsLabel,
  boxesOpenedLabel,
  boxesUnopenedLabel,
  openGiftLabel,
  giftBoardTitle,
}: KudosSidebarProps) {
  return (
    <aside className="flex w-full max-w-106 flex-col gap-6">
      <div className="flex flex-col gap-4 rounded-[17px] border border-gold-line bg-[#00070C] p-6">
        <StatRow value={sidebarStats.kudosReceived} label={receivedLabel} />
        <StatRow value={sidebarStats.kudosSent} label={sentLabel} />
        <StatRow value={sidebarStats.heartsReceived} label={heartsLabel} multiplier="x2" />
        <div className="h-px w-full bg-divider" aria-hidden="true" />
        <StatRow value={sidebarStats.boxesOpened} label={boxesOpenedLabel} />
        <StatRow value={sidebarStats.boxesUnopened} label={boxesUnopenedLabel} />

        {/* Stub — opening the Secret Box dialog is out of this build's scope. */}
        <button
          type="button"
          className="flex items-center justify-center gap-1 rounded-lg bg-gold p-4 text-lg leading-7 font-bold text-ink transition-transform duration-150 hover:scale-[1.02]"
        >
          {openGiftLabel}
          <GiftIcon className="h-6 w-6 shrink-0" />
        </button>
      </div>

      <LeaderboardCard title={giftBoardTitle} entries={giftRecipients} />
    </aside>
  );
}

function StatRow({
  value,
  label,
  multiplier,
}: {
  value: number;
  label: string;
  multiplier?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="flex items-center gap-1 text-3xl leading-10 font-bold text-gold">
        {value}
        {multiplier && <CampaignX2Badge />}
      </span>
      <span className="text-right text-xl leading-7 font-bold text-white">{label}</span>
    </div>
  );
}

function LeaderboardCard({
  title,
  entries,
}: {
  title: string;
  entries: LeaderboardEntry[];
}) {
  return (
    <div className="flex flex-col items-center gap-4 self-stretch rounded-[17px] border border-gold-line bg-[#00070C] px-4 py-6">
      <h3 className="text-center text-xl leading-7 font-bold whitespace-pre-line text-gold">
        {title}
      </h3>
      <ul className="flex max-h-100 w-full flex-col gap-4 overflow-y-auto pr-2">
        {entries.map((entry, index) => (
          <li key={`${entry.name}-${index}`} className="flex items-center gap-2">
            <KudosAvatar name={entry.name} size={64} />
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <p className="truncate text-xl leading-7 font-bold text-gold">
                {entry.name}
              </p>
              <p className="truncate text-right text-base leading-6 font-bold text-white">
                {entry.description}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
