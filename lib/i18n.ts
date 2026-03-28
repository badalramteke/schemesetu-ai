// --- i18n Barrel - imports per-language files ---
// Each language lives in its own file under ./i18n/langs/.
// Types are defined in ./i18n/types.ts.

export type { Language, Translations, ConvQuestion } from "./i18n/types";
import type { Language, Translations } from "./i18n/types";

import en from "./i18n/langs/en";
import hi from "./i18n/langs/hi";
import mr from "./i18n/langs/mr";
import bn from "./i18n/langs/bn";
import gu from "./i18n/langs/gu";
import kn from "./i18n/langs/kn";
import te from "./i18n/langs/te";
import ur from "./i18n/langs/ur";

const translations: Record<Language, Translations> = {
  en,
  hi,
  mr,
  bn,
  gu,
  kn,
  te,
  ur,
};

export function t(lang: Language): Translations {
  return translations[lang] || translations.en;
}

export default translations;
