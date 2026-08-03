import { describe, expect, it } from "vitest";
import { formatKudosTime, formatTickerTime } from "@/lib/kudos/format-kudos-time";

/**
 * Both formatters pin `Asia/Ho_Chi_Minh`. The value is computed server-side and
 * shipped as a plain string, so a formatter that followed the process timezone
 * would render differently per deploy while looking fine locally.
 */
describe("formatKudosTime", () => {
  it("renders HH:mm - MM/DD/YYYY in Vietnam time", () => {
    // 03:00 UTC is 10:00 in UTC+7.
    expect(formatKudosTime("2026-07-30T03:00:00.000Z")).toBe("10:00 - 07/30/2026");
  });

  it("rolls the date over when UTC and Vietnam fall on different days", () => {
    // 17:30 UTC on the 30th is 00:30 on the 31st in UTC+7.
    expect(formatKudosTime("2026-07-30T17:30:00.000Z")).toBe("00:30 - 07/31/2026");
  });

  it("ignores the process timezone — same instant, two written forms", () => {
    expect(formatKudosTime("2026-07-30T10:00:00.000+07:00")).toBe(
      formatKudosTime("2026-07-30T03:00:00.000Z"),
    );
  });

  it("zero-pads hours, minutes, day and month", () => {
    expect(formatKudosTime("2026-01-05T01:02:00.000Z")).toBe("08:02 - 01/05/2026");
  });
});

describe("formatTickerTime", () => {
  it("renders a lowercase 12-hour time with no space", () => {
    expect(formatTickerTime("2026-07-30T13:30:00.000Z")).toBe("08:30pm");
  });

  it("uses am before noon Vietnam time", () => {
    expect(formatTickerTime("2026-07-30T03:00:00.000Z")).toBe("10:00am");
  });

  it("keeps midnight and noon on the 12-hour clock", () => {
    expect(formatTickerTime("2026-07-30T17:00:00.000Z")).toBe("12:00am");
    expect(formatTickerTime("2026-07-30T05:00:00.000Z")).toBe("12:00pm");
  });

  it("never emits a dotted period like a.m.", () => {
    expect(formatTickerTime("2026-07-30T03:00:00.000Z")).not.toContain(".");
  });
});
