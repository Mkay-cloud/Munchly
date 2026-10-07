"use client";

import SignInGate from "@/components/SignInGate";
import { useTranslations } from "@/i18n/LocaleProvider";

export default function FavoritesGate() {
  const t = useTranslations();
  return <SignInGate message={t("favoritesPage.signInMessage")} />;
}
