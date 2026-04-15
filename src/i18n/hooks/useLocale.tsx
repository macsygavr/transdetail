"use client";

import { useLanguages } from "@/providers/LanguageContext";
import { useCallback } from "react";

export function useI18N() {
  const languages = useLanguages();

  const t = useCallback(
    (strings?: Record<string, string>) => {
      if (!strings) return "-";

      for (const locale of languages) {
        if (strings[locale]) return strings[locale];

        const baseLang = locale.split("-")[0];
        if (strings[baseLang]) return strings[baseLang];
      }

      return strings["en"] || strings["ru"] || Object.values(strings)[0] || "-";
    },
    [languages]
  );

  return { t };
}
