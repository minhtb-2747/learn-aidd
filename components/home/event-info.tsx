import { getTranslations } from "next-intl/server";

/**
 * "Thời gian / Địa điểm / Livestream" event summary shown under the countdown.
 * All copy comes from the HomePage i18n namespace (VN/EN).
 */
export default async function EventInfo() {
  const t = await getTranslations("HomePage");

  return (
    <div className="flex flex-col items-start gap-2 mt-4">
      <div className="flex flex-wrap items-center gap-x-15 gap-y-2">
        <p className="text-base leading-6 font-bold tracking-[0.15px] text-white">
          {t("event.timeLabel")}{" "}
          <span className="text-2xl leading-8 tracking-normal text-[#FFEA9E]">
            {t("event.timeValue")}
          </span>
        </p>
        <p className="text-base leading-6 font-bold tracking-[0.15px] text-white">
          {t("event.placeLabel")}{" "}
          <span className="text-2xl leading-8 tracking-normal text-[#FFEA9E]">
            {t("event.placeValue")}
          </span>
        </p>
      </div>
      <p className="text-base leading-6 font-bold tracking-[0.5px] text-white">
        {t("event.note")}
      </p>
    </div>
  );
}
