import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/sign-out-button";

/**
 * Minimal authenticated placeholder. Defense-in-depth: re-verifies the user
 * server-side with `getUser()` rather than trusting the proxy guard alone.
 */
export default async function TodoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const t = await getTranslations("TodoPage");

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <p className="text-sm text-gray-500">
        {t("signedInAs")}: <span className="font-medium">{user.email}</span>
      </p>
      <SignOutButton label={t("signOut")} />
    </main>
  );
}
