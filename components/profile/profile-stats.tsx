import { GiftIcon } from "@/icons";
import CampaignX2Badge from "@/components/kudos/campaign-x2-badge";
import type { ProfileStats } from "@/lib/profile/mock-data";

export interface ProfileStatsCardProps {
  stats: ProfileStats;
}

/**
 * Stats card (MoMorph spec `B`): the same 5-counter layout as the Kudos page
 * sidebar (`KudosSidebar`'s `StatRow`), plus the "Mở Secret Box" button.
 * Rebuilt locally rather than importing from `components/kudos` because that
 * component isn't in this task's reuse list and doesn't export its row
 * helper; labels stay as VN literals since this task's scope excludes
 * touching `i18n/messages/*.json`.
 */
export default function ProfileStatsCard({ stats }: ProfileStatsCardProps) {
  return (
    <section className="mx-auto flex w-full max-w-170 flex-col gap-4 rounded-[17px] border border-gold-line bg-[#00070C] p-10">
      <StatRow value={stats.kudosReceived} label="Số Kudos bạn nhận được" />
      <StatRow value={stats.kudosSent} label="Số Kudos bạn đã gửi" />
      <StatRow
        value={stats.heartsReceived}
        label="Số tim bạn nhận được"
        multiplier="x2"
      />
      <div className="h-px w-full bg-divider" aria-hidden="true" />
      <StatRow value={stats.boxesOpened} label="Số Secret Box đã mở" />
      <StatRow value={stats.boxesUnopened} label="Số Secret Box chưa mở" />

      {/* Stub — opening the Secret Box dialog is out of this build's scope. */}
      <button
        type="button"
        className="flex items-center justify-center gap-1 rounded-lg bg-gold p-4 text-lg leading-7 font-bold text-ink transition-transform duration-150 hover:scale-[1.02]"
      >
        Mở Secret Box
        <GiftIcon className="h-6 w-6 shrink-0" />
      </button>
    </section>
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
