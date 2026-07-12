import { signInWithGoogle } from "@/app/actions/auth";
import LoginButton from "./login-button";

export interface HeroContentProps {
  subtitle: string;
  tagline: string;
  buttonLabel: string;
  /** Failure message from `?error=auth`, shown below the button. */
  errorText?: string;
}

export default function HeroContent({
  subtitle,
  tagline,
  buttonLabel,
  errorText,
}: HeroContentProps) {
  return (
    <section className="relative z-10 flex flex-1 flex-col justify-center px-6 py-12 sm:px-8 sm:py-16 lg:py-24">
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex max-w-3xl flex-col gap-10 lg:gap-20">
          {/* eslint-disable-next-line @next/next/no-img-element -- static presentational wordmark */}
          <img
            src="/images/login/root-further-logo.png"
            alt="Root Further"
            width={451}
            height={200}
            className="h-auto w-full max-w-112.75"
          />

          <div className="flex flex-col gap-6 lg:pl-4">
            <p className="max-w-120 text-lg leading-relaxed font-bold tracking-wide text-white sm:text-xl sm:leading-10 sm:tracking-[0.5px]">
              {subtitle}
              <br />
              {tagline}
            </p>

            <form action={signInWithGoogle}>
              <LoginButton label={buttonLabel} error={errorText} />
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
