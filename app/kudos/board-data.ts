import {
  getAllKudosPosts,
  getCurrentUserLikes,
  getHighlightKudos,
  type KudosFeedFilters,
} from "@/lib/kudos/queries/kudos-feed";
import { getDepartmentOptions, getHashtagOptions } from "@/lib/kudos/queries/filter-options";
import { getPeopleMeta } from "@/lib/kudos/queries/people";
import { getSpotlightData } from "@/lib/kudos/queries/spotlight";
import {
  getActiveCampaign,
  getCurrentUserStats,
  getGiftRecipients,
  type ActiveCampaign,
} from "@/lib/kudos/queries/engagement";
import { toHighlightKudos, toKudosPost, type KudosRow } from "@/lib/kudos/kudos-mapper";
import { buildSpotlightLayout, type SpotlightName } from "@/lib/kudos/spotlight-layout";
import type {
  HighlightKudos,
  KudosPost,
  KudosStats,
  LeaderboardEntry,
  TickerLine,
} from "@/lib/kudos/types";

export interface BoardData {
  highlightKudos: HighlightKudos[];
  allKudosPosts: KudosPost[];
  hashtagOptions: string[];
  departmentOptions: string[];
  spotlightNames: SpotlightName[];
  spotlightTicker: TickerLine[];
  totalKudos: number;
  stats: KudosStats;
  giftRecipients: LeaderboardEntry[];
  campaign: ActiveCampaign | null;
}

/**
 * Every profile id a batch of rows references. Anonymous senders are excluded,
 * matching `kudos-mapper.ts`, which owns the anonymity rule.
 */
function collectProfileIds(rows: KudosRow[]): string[] {
  const ids = new Set<string>();
  for (const row of rows) {
    if (!row.is_anonymous) ids.add(row.sender_id);
    ids.add(row.receiver_id);
  }
  return Array.from(ids);
}

/**
 * The whole `/kudos` fetch graph in one place: one `Promise.all` for the
 * independent reads, and ONE `getPeopleMeta`/`getCurrentUserLikes` batch
 * covering highlight + feed together — never a per-card lookup. Colocated
 * here because it composes queries for this page rather than exposing a
 * reusable one.
 */
export async function getBoardData(filters: KudosFeedFilters): Promise<BoardData> {
  const [
    highlightRows,
    postRows,
    hashtagOptions,
    departmentOptions,
    spotlight,
    stats,
    giftRecipients,
    campaign,
  ] = await Promise.all([
    getHighlightKudos(filters),
    getAllKudosPosts({ limit: 10 }),
    getHashtagOptions(),
    getDepartmentOptions(),
    getSpotlightData(),
    getCurrentUserStats(),
    getGiftRecipients(),
    getActiveCampaign(),
  ]);

  const allRows = [...highlightRows, ...postRows];
  const profileIds = collectProfileIds(allRows);
  const kudoIds = allRows.map((row) => String(row.id));

  const [peopleMeta, likedByCurrentUser] = await Promise.all([
    getPeopleMeta(profileIds),
    getCurrentUserLikes(kudoIds),
  ]);

  return {
    highlightKudos: highlightRows.map((row) =>
      toHighlightKudos(row, peopleMeta, likedByCurrentUser),
    ),
    allKudosPosts: postRows.map((row) => toKudosPost(row, peopleMeta, likedByCurrentUser)),
    hashtagOptions,
    departmentOptions,
    spotlightNames: buildSpotlightLayout(spotlight.entries),
    spotlightTicker: spotlight.ticker,
    totalKudos: spotlight.totalKudos,
    stats,
    giftRecipients,
    campaign,
  };
}
