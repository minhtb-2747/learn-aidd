import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { MOCK_AUTH_COOKIE, MOCK_USER, hasMockAuth } from "@/lib/auth/mock-session";
import { SignOutButton } from "@/components/sign-out-button";

/**
 * Minimal authenticated placeholder. Defense-in-depth: re-verifies the user
 * server-side rather than trusting the proxy guard alone — honoring the
 * TEMPORARY mock-auth cookie (login stub) before falling back to `getUser()`.
 */
export default async function TodoPage() {
  const cookieStore = await cookies();
  let email: string;

  if (hasMockAuth(cookieStore.get(MOCK_AUTH_COOKIE)?.value)) {
    email = MOCK_USER.email;
  } else {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      redirect("/login");
    }
    email = user.email ?? "";
  }

  const t = await getTranslations("TodoPage");

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <p className="text-sm text-gray-500">
        {t("signedInAs")}: <span className="font-medium">{email}</span>
      </p>
      <SignOutButton label={t("signOut")} />
    </main>
  );
}
