import { describe, expect, it } from "vitest";
import type { PersonMeta } from "@/lib/kudos/queries/people";
import { toHighlightKudos, toKudosPerson, toKudosPost, type KudosRow } from "./kudos-mapper";

const META: PersonMeta = {
  name: "Trần Bình Minh",
  department: "Engineering",
  badge: "Legend Hero",
  stars: 3,
  kudosReceived: 21,
  kudosSent: 9,
};

function row(overrides: Partial<KudosRow> = {}): KudosRow {
  return {
    id: 7,
    sender_id: "sender-uuid",
    receiver_id: "receiver-uuid",
    title: "IDOL",
    content: "cảm ơn",
    is_anonymous: false,
    anonymous_name: null,
    status: "published",
    like_count: 12,
    created_at: "2026-07-30T03:00:00.000Z",
    kudo_hashtags: null,
    kudo_images: null,
    ...overrides,
  };
}

const people = new Map<string, PersonMeta>([
  ["sender-uuid", META],
  ["receiver-uuid", { ...META, name: "Người nhận" }],
]);

describe("toKudosPerson — the de-anonymisation guard", () => {
  it("leaks nothing when profileId is null, even if meta is passed", () => {
    const person = toKudosPerson(null, META, { anonymousName: "Sunner bí ẩn" });

    expect(person).toEqual({
      profileId: null,
      name: "Sunner bí ẩn",
      department: "",
      badge: "",
      kudosReceived: 0,
      kudosSent: 0,
    });
    // The real name must not survive anywhere in the payload.
    expect(JSON.stringify(person)).not.toContain(META.name);
  });

  it("falls back to the generic label when no anonymous name was given", () => {
    expect(toKudosPerson(null, undefined).name).toBe("Ẩn danh");
    expect(toKudosPerson(null, undefined, { anonymousName: "" }).name).toBe("Ẩn danh");
    expect(toKudosPerson(null, undefined, { anonymousName: null }).name).toBe("Ẩn danh");
  });

  it("blanks a named person whose meta is missing rather than throwing", () => {
    expect(toKudosPerson("some-uuid", undefined)).toEqual({
      profileId: "some-uuid",
      name: "",
      department: "",
      badge: "",
      kudosReceived: 0,
      kudosSent: 0,
    });
  });
});

describe("toHighlightKudos", () => {
  it("anonymises the sender but never the receiver", () => {
    const mapped = toHighlightKudos(
      row({ is_anonymous: true, anonymous_name: "Ai đó" }),
      people,
      new Set(),
    );

    expect(mapped.sender.profileId).toBeNull();
    expect(mapped.sender.name).toBe("Ai đó");
    expect(mapped.receiver.profileId).toBe("receiver-uuid");
    expect(mapped.receiver.name).toBe("Người nhận");
  });

  it("stringifies the bigint id and matches the liked set on that same string", () => {
    const mapped = toHighlightKudos(row({ id: 7 }), people, new Set(["7"]));
    expect(mapped.id).toBe("7");
    expect(mapped.likedByCurrentUser).toBe(true);
  });

  it("reports not-liked when the id is absent from the set", () => {
    expect(toHighlightKudos(row(), people, new Set(["99"])).likedByCurrentUser).toBe(false);
  });

  it("drops hashtag links whose joined row came back null", () => {
    const mapped = toHighlightKudos(
      row({ kudo_hashtags: [{ hashtags: { name: "teamwork" } }, { hashtags: null }] }),
      people,
      new Set(),
    );
    expect(mapped.hashtags).toEqual(["teamwork"]);
  });

  it("tolerates null child collections", () => {
    const mapped = toHighlightKudos(row({ kudo_hashtags: null }), people, new Set());
    expect(mapped.hashtags).toEqual([]);
  });
});

describe("toKudosPost images", () => {
  it("orders by display_order regardless of the order rows arrived in", () => {
    const mapped = toKudosPost(
      row({
        kudo_images: [
          { image_url: "c.png", display_order: 2 },
          { image_url: "a.png", display_order: 0 },
          { image_url: "b.png", display_order: 1 },
        ],
      }),
      people,
      new Set(),
    );
    expect(mapped.images).toEqual(["a.png", "b.png", "c.png"]);
  });

  it("caps at 5 even if the row carries more", () => {
    const mapped = toKudosPost(
      row({
        kudo_images: Array.from({ length: 8 }, (_, i) => ({
          image_url: `${i}.png`,
          display_order: i,
        })),
      }),
      people,
      new Set(),
    );
    expect(mapped.images).toHaveLength(5);
    expect(mapped.images.at(-1)).toBe("4.png");
  });

  it("does not mutate the caller's array while sorting", () => {
    const images = [
      { image_url: "b.png", display_order: 1 },
      { image_url: "a.png", display_order: 0 },
    ];
    toKudosPost(row({ kudo_images: images }), people, new Set());
    expect(images[0].image_url).toBe("b.png");
  });
});
