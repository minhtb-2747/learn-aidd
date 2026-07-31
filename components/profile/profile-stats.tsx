import { GiftIcon } from "@/icons";
import CampaignX2Badge from "@/components/kudos/campaign-x2-badge";
import KudosStatRow from "@/components/kudos/kudos-stat-row";
import type { ActiveCampaign } from "@/lib/kudos/queries/engagement";
import type { ProfileStats } from "@/lib/profile/types";

export interface ProfileStatsCardProps {
  stats: ProfileStats;
  /** `null` when no campaign is currently running — hides the x2 badge entirely. */
  campaign: ActiveCampaign | null;
  receivedLabel: string;
  sentLabel: string;
  heartsLabel: string;
  boxesOpenedLabel: string;
  boxesUnopenedLabel: string;
  openGiftLabel: string;
}

/**
 * Stats card (MoMorph spec `B`): the same 5-counter block as the Kudos board
 * sidebar, sharing `KudosStatRow` with it so the two can no longer drift.
 * Labels arrive as props from the page (translated there) rather than as local
 * literals, so this stays presentational and fully localized.
 */
export default function ProfileStatsCard({
  stats,
  campaign,
  receivedLabel,
  sentLabel,
  heartsLabel,
  boxesOpenedLabel,
  boxesUnopenedLabel,
  openGiftLabel,
}: ProfileStatsCardProps) {
  return (
    <section className="mx-auto flex w-full max-w-170 flex-col gap-4 rounded-[17px] border border-gold-line bg-[#00070C] p-10">
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
    </section>
  );
}
