"use client";

import { useEffect, useRef } from "react";
import type { SpotlightEdge, SpotlightName } from "@/lib/kudos/spotlight-layout";

export interface SpotlightNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Seeded rest position in board px — the anchor the node is sprung back to. */
  homeX: number;
  homeY: number;
  /** Half-extents of the rendered label box, used for separation and hit-testing. */
  halfWidth: number;
  halfHeight: number;
  /** Per-node phase/rate so the ambient drift never falls into lockstep. */
  phase: number;
  rate: number;
}

export interface UseSpotlightForceOptions {
  names: SpotlightName[];
  edges: SpotlightEdge[];
  /** Board size in px; the simulation restarts whenever it changes. */
  width: number;
  height: number;
  /**
   * Measured label widths (`useSpotlightMetrics`), index-aligned with `names`.
   * `null` until the webfont has loaded — the simulation waits, because
   * starting on fallback-face widths would settle the cloud into a spacing
   * that is wrong the moment the real face swaps in.
   */
  widths: number[] | null;
  /** Called once per frame with the live node array (read positions imperatively). */
  onTick: (nodes: SpotlightNode[]) => void;
}

/** Fraction of velocity carried into the next step; the rest is friction. */
const VELOCITY_RETAINED = 0.18;

/**
 * Drift and home are quasi-static against each other: the drift oscillates far
 * slower than the spring settles, so a node parks where the two balance —
 * `amplitude ≈ DRIFT / HOME`, here about 15px of wander. The ratio matters
 * more than either number on its own; a home spring in the same order as the
 * drift pins everything to ~1px and the board looks frozen.
 *
 * The absolute size then sets the speed: a node settles at
 * `VELOCITY_RETAINED / (1 - VELOCITY_RETAINED) × DRIFT` px per step, so 0.3
 * works out to roughly 2.5px/s.
 */
const DRIFT_STRENGTH = 0.3;
const HOME_STRENGTH = 0.02;
/** Mesh edges as springs at their rest length — soft, they only carry ripples. */
const LINK_STRENGTH = 0.08;

/** Gap held between label boxes, in px. */
const SEPARATION_PADDING = 6;
/** Fraction of an overlap resolved per pass; under 1 to avoid jitter against the springs. */
const SEPARATION_RELAXATION = 0.3;
const SEPARATION_PASSES = 2;

/** Physics runs on a fixed step so a 120Hz display doesn't animate at double speed. */
const STEP_SECONDS = 1 / 60;
/** Ceiling on catch-up steps after a stall, so a backgrounded tab can't spiral. */
const MAX_STEPS_PER_FRAME = 3;

/**
 * Motion behind the Spotlight board: every Sunner name is a vertex of the mesh
 * the design draws as a static plexus texture, and the vertices never settle.
 *
 * This is a hand-rolled integrator rather than d3-force, because almost none
 * of d3 was being used — `home` and `drift` were always custom, and springs at
 * their own rest length exert nearly no force. That left `forceCollide`, whose
 * circular hit area is the wrong shape for a name label: wide and short. Boxes
 * separated along their axis of least penetration model that exactly, and at
 * ~90 nodes the naive all-pairs pass is a few thousand comparisons a frame —
 * cheaper than building d3's quadtree.
 *
 * Three things keep it from becoming a drifting blob:
 *
 * - a per-node **home spring** back to the seeded scatter, so the physics
 *   perturbs the designed arrangement instead of replacing it;
 * - a **drift** term injecting slow, out-of-phase acceleration — without it
 *   the system reaches equilibrium and visibly freezes;
 * - **box separation**, which is what stops names overlapping into a pile.
 *
 * Positions are handed back through `onTick` rather than React state on
 * purpose: at ~90 nodes and 60fps a `setState` per frame would re-render the
 * whole board continuously.
 *
 * Honours `prefers-reduced-motion`: the loop never starts, and the
 * server-rendered seeded layout simply stays put.
 */
export function useSpotlightForce({
  names,
  edges,
  width,
  height,
  widths,
  onTick,
}: UseSpotlightForceOptions) {
  // Keeping the callback in a ref lets the effect depend only on real inputs,
  // so an inline `onTick` at the call site can't restart the simulation. The
  // assignment is an effect rather than a render-time write, and is declared
  // first so it lands before the simulation effect below reads it.
  const onTickRef = useRef(onTick);
  useEffect(() => {
    onTickRef.current = onTick;
  });

  useEffect(() => {
    if (!width || !height || names.length === 0 || !widths) return undefined;
    if (typeof window === "undefined") return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    const nodes: SpotlightNode[] = names.map((item, index) => ({
      x: item.nx * width,
      y: item.ny * height,
      vx: 0,
      vy: 0,
      homeX: item.nx * width,
      homeY: item.ny * height,
      halfWidth: (widths[index] ?? 0) / 2,
      halfHeight: item.fontSize * 0.7,
      phase: (index * 2.399963) % (Math.PI * 2),
      rate: 0.35 + ((index * 7919) % 100) / 260,
    }));

    // Each link rests at the distance its two nodes already sit apart in the
    // seeded layout, so the springs hold the designed scatter rather than
    // hauling the cloud toward some uniform spacing.
    const restDistances = edges.map((edge) =>
      Math.hypot(
        nodes[edge.target].homeX - nodes[edge.source].homeX,
        nodes[edge.target].homeY - nodes[edge.source].homeY,
      ),
    );

    let elapsed = 0;

    function step() {
      elapsed += STEP_SECONDS;

      for (const node of nodes) {
        node.vx +=
          Math.cos(elapsed * node.rate + node.phase) * DRIFT_STRENGTH +
          (node.homeX - node.x) * HOME_STRENGTH;
        node.vy +=
          Math.sin(elapsed * node.rate * 0.83 + node.phase) * DRIFT_STRENGTH +
          (node.homeY - node.y) * HOME_STRENGTH;
      }

      for (let i = 0; i < edges.length; i += 1) {
        const from = nodes[edges[i].source];
        const to = nodes[edges[i].target];
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const distance = Math.hypot(dx, dy) || 1e-6;
        const pull = ((distance - restDistances[i]) / distance) * LINK_STRENGTH * 0.5;
        from.vx += dx * pull;
        from.vy += dy * pull;
        to.vx -= dx * pull;
        to.vy -= dy * pull;
      }

      for (const node of nodes) {
        node.vx *= VELOCITY_RETAINED;
        node.vy *= VELOCITY_RETAINED;
        node.x += node.vx;
        node.y += node.vy;
      }

      separate(nodes);
    }

    let frame = 0;
    let previous = performance.now();

    function loop(now: number) {
      // Fixed-step accumulator: real elapsed time drives how many steps run,
      // so motion is identical at 60Hz, 120Hz or during a dropped frame. Only
      // the time actually consumed is retired — advancing `previous` to `now`
      // instead would discard the sub-step remainder and run slow on any
      // refresh rate that isn't a multiple of 60.
      let pending = Math.floor((now - previous) / (STEP_SECONDS * 1000));
      if (pending > MAX_STEPS_PER_FRAME) {
        pending = MAX_STEPS_PER_FRAME;
        previous = now;
      } else {
        previous += pending * STEP_SECONDS * 1000;
      }
      while (pending > 0) {
        step();
        pending -= 1;
      }
      onTickRef.current(nodes);
      frame = requestAnimationFrame(loop);
    }

    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [names, edges, width, height, widths]);
}

/**
 * Pushes overlapping label boxes apart along whichever axis they overlap least,
 * which is what makes two side-by-side names slide horizontally rather than
 * one of them jumping a whole line up or down.
 */
function separate(nodes: SpotlightNode[]) {
  for (let pass = 0; pass < SEPARATION_PASSES; pass += 1) {
    for (let i = 0; i < nodes.length; i += 1) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j += 1) {
        const b = nodes[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const overlapX = a.halfWidth + b.halfWidth + SEPARATION_PADDING - Math.abs(dx);
        if (overlapX <= 0) continue;
        const overlapY = a.halfHeight + b.halfHeight + SEPARATION_PADDING - Math.abs(dy);
        if (overlapY <= 0) continue;

        if (overlapX < overlapY) {
          // A dx of exactly 0 resolves to +1, so two boxes stacked precisely on
          // top of each other still get prised apart rather than sticking.
          const push = (overlapX / 2) * SEPARATION_RELAXATION * (dx < 0 ? -1 : 1);
          a.x -= push;
          b.x += push;
        } else {
          const push = (overlapY / 2) * SEPARATION_RELAXATION * (dy < 0 ? -1 : 1);
          a.y -= push;
          b.y += push;
        }
      }
    }
  }
}
