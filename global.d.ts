import type en from "@/i18n/en.json";
import type { Locale } from "@/i18n/config";

// Types every t("…") key against the English messages, so a wrong key fails
// type-check.
declare module "next-intl" {
  interface AppConfig {
    Locale: Locale;
    Messages: typeof en;
  }
}
