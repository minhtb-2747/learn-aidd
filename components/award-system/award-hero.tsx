import Image from "next/image";

/**
 * Top-of-page hero content for the award-system screen: just the "ROOT
 * FURTHER" wordmark over the keyvisual backdrop (the backdrop image + fade
 * live on `app/award-system/page.tsx`'s `<main>`, same pattern as the
 * homepage). Unlike the homepage hero, this screen has no countdown and no
 * event-info block — the wordmark hands off directly to the award-system
 * section title below it.
 */
export default function AwardHero() {
  return (
    <section className="relative w-full px-6 pt-16 sm:px-9 lg:px-36 lg:pt-26">
      <Image
        src="/images/login/root-further-logo.png"
        alt="Root Further"
        width={338}
        height={150}
        priority
        className="h-auto w-full max-w-[338px]"
      />
    </section>
  );
}
