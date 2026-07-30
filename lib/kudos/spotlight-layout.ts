import type { SpotlightEntry } from "@/lib/kudos/types";

/**
 * Deterministic PRNG (mulberry32), ported byte-for-byte from
 * the former `spotlight-names.ts` mock, so the scatter is stable across server render and
 * client hydration (no `Math.random()` mismatch).
 */
function mulberry32(seed: number) {
  let state = seed;
  return function next() {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Coral highlight color sampled from the design (rgba(241,118,118,1)). */
export const HIGHLIGHT_TEXT_COLOR = "#F17676";

/**
 * The design frame (`SPOTLIGHT_board.svg`) is 1157×548 and the whole cloud is
 * in view at rest — there is no off-screen region to discover. So the layout
 * is authored in *normalised* 0–1 space and projected onto whatever the board
 * actually measures at runtime; panning only becomes useful once zoomed in.
 */
export const DESIGN_WIDTH = 1157;
export const DESIGN_HEIGHT = 548;

/**
 * Name type sizes read off the design export. Measuring the outlined glyph
 * paths gives three clusters of cap-height — ~7.2px, ~11.1px and ~12.3px —
 * which at a ~0.72 cap-height ratio come out as roughly 10 / 15 / 17px.
 */
const FONT_SIZES = [10, 15, 17] as const;

/** Names are kept clear of the header, the search pill and the ticker block. */
const MARGIN_TOP = 0.13;
const MARGIN_BOTTOM = 0.12;
const MARGIN_X = 0.02;

export interface SpotlightName {
  id: string;
  name: string;
  /** Seeded rest position, normalised 0–1 across the board. */
  nx: number;
  ny: number;
  fontSize: number;
  highlight: boolean;
  kudosCount: number;
  receivedAt: string;
  profileId: string | null;
}

/** One mesh edge, as a pair of indices into the `SpotlightName[]`. */
export interface SpotlightEdge {
  source: number;
  target: number;
}

const SEED = 20260726;
/**
 * 10 columns rather than the design's apparent 12: a Vietnamese full name at
 * the base 10px size measures ~100–120px, so a 12-column grid on a 1157px
 * board (≈96px pitch) guarantees horizontal overlap that `forceCollide` cannot
 * undo — its circular hit area can't model a box that wide and short.
 */
const COLS = 10;
const ROWS = 9;

/**
 * Seeded grid-with-jitter scatter, one cell per name. Runs on the server so
 * the first paint already shows the cloud in its designed arrangement; the
 * client force simulation then takes these as its starting positions and its
 * "home" anchors, which is what stops the physics from drifting the cloud
 * into an undesigned blob.
 *
 * Returns `[]` for an empty `entries` array (guards the modulo below).
 */
export function buildSpotlightLayout(entries: SpotlightEntry[]): SpotlightName[] {
  if (entries.length === 0) return [];

  const random = mulberry32(SEED);
  const cellWidth = (1 - MARGIN_X * 2) / COLS;
  const cellHeight = (1 - MARGIN_TOP - MARGIN_BOTTOM) / ROWS;
  const names: SpotlightName[] = [];
  let index = 0;

  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      // Skip some cells so the cloud keeps organic empty pockets, like the design.
      if (random() < 0.15) continue;

      const sizeRoll = random();
      const fontSize =
        sizeRoll > 0.94 ? FONT_SIZES[2] : sizeRoll > 0.82 ? FONT_SIZES[1] : FONT_SIZES[0];
      const jitterX = (random() - 0.5) * cellWidth * 0.7;
      const jitterY = (random() - 0.5) * cellHeight * 0.7;
      const entry = entries[index % entries.length];

      names.push({
        id: `spotlight-name-${row}-${col}`,
        name: entry.name,
        nx: MARGIN_X + col * cellWidth + cellWidth / 2 + jitterX,
        ny: MARGIN_TOP + row * cellHeight + cellHeight / 2 + jitterY,
        fontSize,
        // The design highlights exactly one name in the whole cloud.
        highlight: sizeRoll > 0.988,
        kudosCount: entry.kudosCount,
        receivedAt: entry.receivedAt,
        profileId: entry.profileId,
      });
      index += 1;
    }
  }

  return names;
}

/**
 * Mesh edges for the plexus the design renders as a static texture layer.
 *
 * Each name links to its `perNode` nearest seeded neighbours, deduped so an
 * A→B and B→A pair only yields one edge. Deriving them once from the *rest*
 * positions (rather than re-testing distance every frame) is what keeps the
 * mesh stable while the nodes drift — a distance-threshold mesh flickers as
 * links wink in and out, which reads as noise rather than as a structure.
 */
export function buildSpotlightEdges(
  names: SpotlightName[],
  perNode = 2,
): SpotlightEdge[] {
  const seen = new Set<string>();
  const edges: SpotlightEdge[] = [];

  names.forEach((node, i) => {
    const nearest = names
      .map((other, j) => ({
        j,
        d: (other.nx - node.nx) ** 2 + (other.ny - node.ny) ** 2,
      }))
      .filter((candidate) => candidate.j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, perNode);

    for (const { j } of nearest) {
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push({ source: i, target: j });
    }
  });

  return edges;
}
