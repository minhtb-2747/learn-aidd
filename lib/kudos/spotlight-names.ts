/**
 * Mock word-cloud data for the Spotlight board (Sun* Kudos).
 *
 * Names/positions are generated with a seeded PRNG so the scatter is
 * deterministic between server render and client hydration (no
 * Math.random() hydration mismatch) while still looking organic.
 *
 * Content mirrors the MoMorph design (B.7_Spotlight, node 2940:14174):
 * a handful of Sunner names repeated across a large canvas, most in
 * white, a few enlarged/bold, one occasionally highlighted in coral.
 */

/** Deterministic PRNG (mulberry32) so output is stable across renders. */
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

const NAME_POOL = [
  "Nguyễn Bá Chức",
  "Nguyễn Hoàng Linh",
  "Dương Thùy An",
  "Mai Phương Thúy",
  "Nguyễn Văn Quy",
  "Lê Kiều Trang",
  "Đỗ Hoàng Hiệp",
] as const;

/** Coral highlight color sampled from the design (rgba(241,118,118,1)). */
export const HIGHLIGHT_TEXT_COLOR = "#F17676";

/** Virtual canvas size (px) the word cloud is scattered across, pannable/zoomable. */
export const CANVAS_WIDTH = 2200;
export const CANVAS_HEIGHT = 1100;

export interface SpotlightName {
  id: string;
  name: string;
  x: number;
  y: number;
  fontSize: number;
  highlight: boolean;
  kudosCount: number;
  receivedAt: string;
}

const TICKER_TIMES = ["08:30pm", "08:24pm", "08:15pm", "08:02pm", "07:55pm", "07:40pm"];

function buildNames(): SpotlightName[] {
  const random = mulberry32(20260726);
  const cols = 12;
  const rows = 10;
  const cellWidth = CANVAS_WIDTH / cols;
  const cellHeight = CANVAS_HEIGHT / rows;
  const names: SpotlightName[] = [];
  let index = 0;

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      // Skip some cells so the cloud keeps organic empty pockets, like the design.
      if (random() < 0.15) continue;

      const sizeRoll = random();
      const fontSize = sizeRoll > 0.88 ? 22 : sizeRoll > 0.62 ? 16 : 12;
      const jitterX = (random() - 0.5) * cellWidth * 0.7;
      const jitterY = (random() - 0.5) * cellHeight * 0.7;

      names.push({
        id: `spotlight-name-${row}-${col}`,
        name: NAME_POOL[index % NAME_POOL.length],
        x: col * cellWidth + cellWidth / 2 + jitterX,
        y: row * cellHeight + cellHeight / 2 + jitterY,
        fontSize,
        highlight: sizeRoll > 0.95,
        kudosCount: 1 + Math.floor(random() * 12),
        receivedAt: TICKER_TIMES[index % TICKER_TIMES.length],
      });
      index += 1;
    }
  }

  return names;
}

/** ~90-110 scattered name instances (count varies with the seeded skip-rate above). */
export const SPOTLIGHT_NAMES: SpotlightName[] = buildNames();

export interface ActivityTickerLine {
  id: string;
  time: string;
  name: string;
}

/** Recent-activity ticker lines, newest first (rendered bottom-up, fading with age). */
export const ACTIVITY_TICKER: ActivityTickerLine[] = [
  { id: "ticker-1", time: "08:30pm", name: "Nguyễn Bá Chức" },
  { id: "ticker-2", time: "08:24pm", name: "Nguyễn Hoàng Linh" },
  { id: "ticker-3", time: "08:15pm", name: "Dương Thùy An" },
  { id: "ticker-4", time: "08:02pm", name: "Mai Phương Thúy" },
  { id: "ticker-5", time: "07:55pm", name: "Lê Kiều Trang" },
];
