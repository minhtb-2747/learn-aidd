import LanguageSelector, { type Locale } from "./language-selector";

/**
 * Fixed dark header: Sun* Annual Awards 2025 logo (static, non-interactive)
 * on the left, VN/EN language selector on the right.
 */
export default function LoginHeader({ current }: { current: Locale }) {
  return (
    <header className="relative z-10 flex h-20 w-full items-center bg-[rgba(11,15,18,0.8)] px-6 sm:px-8">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
        {/* eslint-disable-next-line @next/next/no-img-element -- static presentational brand asset */}
        <img
          src="/images/login/logo.png"
          alt="Sun* Annual Awards 2025"
          width={52}
          height={48}
          className="h-12 w-[52px]"
        />
        <LanguageSelector current={current} />
      </div>
    </header>
  );
}
