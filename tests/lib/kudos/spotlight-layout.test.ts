import { describe, expect, it } from "vitest";
import type { SpotlightEntry } from "@/lib/kudos/types";
import { buildSpotlightEdges, buildSpotlightLayout } from "@/lib/kudos/spotlight-layout";

function entries(count: number): SpotlightEntry[] {
  return Array.from({ length: count }, (_, i) => ({
    profileId: `p${i}`,
    name: `Sunner ${i}`,
    kudosCount: i,
    receivedAt: "08:30pm",
  }));
}

describe("buildSpotlightLayout", () => {
  it("is deterministic — the seeded scatter must survive hydration", () => {
    // Server and client both run this. Any nondeterminism (a stray Math.random)
    // makes the cloud jump on hydration.
    const a = buildSpotlightLayout(entries(30));
    const b = buildSpotlightLayout(entries(30));
    expect(a).toEqual(b);
  });

  it("returns nothing for an empty list, guarding the modulo", () => {
    expect(buildSpotlightLayout([])).toEqual([]);
  });

  it("keeps every name inside the 0–1 normalised board", () => {
    for (const name of buildSpotlightLayout(entries(30))) {
      expect(name.nx).toBeGreaterThanOrEqual(0);
      expect(name.nx).toBeLessThanOrEqual(1);
      expect(name.ny).toBeGreaterThanOrEqual(0);
      expect(name.ny).toBeLessThanOrEqual(1);
    }
  });

  it("holds names clear of the header and the ticker bands", () => {
    const names = buildSpotlightLayout(entries(30));
    const minY = Math.min(...names.map((n) => n.ny));
    const maxY = Math.max(...names.map((n) => n.ny));
    expect(minY).toBeGreaterThan(0.05);
    expect(maxY).toBeLessThan(0.95);
  });

  it("only uses the three sizes read off the design", () => {
    const sizes = new Set(buildSpotlightLayout(entries(30)).map((n) => n.fontSize));
    for (const size of sizes) expect([10, 15, 17]).toContain(size);
  });

  it("gives every name a unique id", () => {
    const names = buildSpotlightLayout(entries(30));
    expect(new Set(names.map((n) => n.id)).size).toBe(names.length);
  });

  it("cycles a short entry list rather than dropping cells", () => {
    const names = buildSpotlightLayout(entries(2));
    expect(names.length).toBeGreaterThan(2);
    expect(new Set(names.map((n) => n.name))).toEqual(new Set(["Sunner 0", "Sunner 1"]));
  });

  it("carries each entry's profileId through, including a null one", () => {
    const [first] = buildSpotlightLayout([
      { profileId: null, name: "Ẩn danh", kudosCount: 0, receivedAt: "08:30pm" },
    ]);
    expect(first.profileId).toBeNull();
  });
});

describe("buildSpotlightEdges", () => {
  const names = buildSpotlightLayout(entries(20));

  it("never links a node to itself", () => {
    for (const edge of buildSpotlightEdges(names)) {
      expect(edge.source).not.toBe(edge.target);
    }
  });

  it("emits A→B and B→A only once", () => {
    const edges = buildSpotlightEdges(names);
    const keys = edges.map((e) => (e.source < e.target ? `${e.source}-${e.target}` : `${e.target}-${e.source}`));
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("keeps every index inside the names array", () => {
    for (const edge of buildSpotlightEdges(names)) {
      expect(edge.source).toBeLessThan(names.length);
      expect(edge.target).toBeLessThan(names.length);
    }
  });

  it("is deterministic, so the mesh does not flicker between renders", () => {
    expect(buildSpotlightEdges(names)).toEqual(buildSpotlightEdges(names));
  });

  it("produces no edges for a single node", () => {
    expect(buildSpotlightEdges(buildSpotlightLayout(entries(1)).slice(0, 1))).toEqual([]);
  });

  it("honours perNode", () => {
    expect(buildSpotlightEdges(names, 1).length).toBeLessThanOrEqual(
      buildSpotlightEdges(names, 3).length,
    );
  });
});
