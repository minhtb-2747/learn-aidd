/**
 * Fixed footer: centered copyright notice (translated text).
 */
export default function LoginFooter({ text }: { text: string }) {
  return (
    <footer className="relative z-10 flex items-center justify-center border-t border-divider px-6 py-8 lg:px-22.5 lg:py-10">
      <p className="text-center text-base leading-6 font-bold text-white [font-family:var(--font-montserrat-alternates)]">
        {text}
      </p>
    </footer>
  );
}
