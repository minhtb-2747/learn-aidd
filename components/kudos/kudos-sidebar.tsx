import { GiftIcon } from "@/icons";
import type { KudosStats, LeaderboardEntry } from "@/lib/kudos/types";
import type { ActiveCampaign } from "@/lib/kudos/queries/engagement";
import CampaignX2Badge from "./campaign-x2-badge";
import KudosStatRow from "./kudos-stat-row";
import KudosAvatar from "./kudos-avatar";

export interface KudosSidebarProps {
  receivedLabel: string;
  sentLabel: string;
  heartsLabel: string;
  boxesOpenedLabel: string;
  boxesUnopenedLabel: string;
  openGiftLabel: string;
  giftBoardTitle: string;
  stats: KudosStats;
  giftRecipients: LeaderboardEntry[];
  /** `null` when no campaign is currently running — hides the x2 badge entirely. */
  campaign: ActiveCampaign | null;
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
  stats,
  giftRecipients,
  campaign,
}: KudosSidebarProps) {
  return (
    <aside className="flex w-full max-w-106 flex-col gap-6">
      <div className="flex flex-col gap-4 rounded-[17px] border border-gold-line bg-[#00070C] p-6">
        <KudosStatRow value={stats.kudosReceived} label={receivedLabel} />
        <KudosStatRow value={stats.kudosSent} label={sentLabel} />
        <KudosStatRow
          value={stats.heartsReceived}
          label={heartsLabel}
          badge={
            campaign && (
              <CampaignX2Badge
                heartMultiplier={campaign.heartMultiplier}
                startDate={campaign.startDate}
                endDate={campaign.endDate}
              />
            )
          }
        />
        <div className="h-px w-full bg-divider" aria-hidden="true" />
        <KudosStatRow value={stats.boxesOpened} label={boxesOpenedLabel} />
        <KudosStatRow value={stats.boxesUnopened} label={boxesUnopenedLabel} />

        {/* Stub — opening the Secret Box dialog is out of this build's scope. */}
        <button
          type="button"
          className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gold p-4 text-lg leading-7 font-bold text-ink transition-transform duration-150 hover:scale-[1.02]"
        >
          {openGiftLabel}
          <GiftIcon className="h-6 w-6 shrink-0" />
        </button>
      </div>

      <LeaderboardCard title={giftBoardTitle} entries={giftRecipients} />
    </aside>
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
            {/* Name and reward are a left-aligned stack beside the avatar. */}
            <div className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
              <p className="truncate text-xl leading-7 font-bold text-gold">
                {entry.name}
              </p>
              <p className="truncate text-base leading-6 font-bold text-white">
                {entry.description}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
