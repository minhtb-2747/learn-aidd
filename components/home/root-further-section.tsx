import { getTranslations } from "next-intl/server";

/**
 * Editorial section behind the hero: decorative ROOT / FURTHER wordmark
 * images stacked top-left, the campaign copy, and the English proverb quote.
 * Copy comes from the HomePage i18n namespace; multi-paragraph blocks are
 * split on newlines. White-on-dark, matching the Figma "Frame 486" layout.
 */
export default async function RootFurtherSection() {
  const t = await getTranslations("HomePage");

  const intro = t("rootFurther.intro").split("\n");
  const [quote, quoteTranslation] = t("rootFurther.quote").split("\n");
  const closing = t("rootFurther.closing").split("\n");

  return (
    <section className="bg-transparent px-6 py-25 sm:px-9 lg:px-26">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8">
        <div className="relative h-33.5 w-72.5">
          {/* eslint-disable-next-line @next/next/no-img-element -- decorative wordmark, positioned via absolute offsets from Figma */}
          <img
            src="/images/home/root-text.png"
            alt=""
            width={189}
            height={67}
            className="absolute top-0 left-12.75 h-16.75 w-47.25"
          />
          {/* eslint-disable-next-line @next/next/no-img-element -- decorative wordmark, positioned via absolute offsets from Figma */}
          <img
            src="/images/home/further-text.png"
            alt=""
            width={290}
            height={67}
            className="absolute top-16.75 left-0 h-16.75 w-72.5"
          />
        </div>

        <div className="flex flex-col gap-8 text-justify text-2xl leading-8 font-bold text-white">
          {intro.map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>

        <p className="max-w-6xl text-center text-xl leading-8 font-bold text-white">
          {quote}
          <br />
          {quoteTranslation}
        </p>

        <div className="flex flex-col gap-8 text-justify text-2xl leading-8 font-bold text-white">
          {closing.map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
