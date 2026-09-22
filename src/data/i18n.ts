// City-name translations, used to swap the stacked page headings on the
// photo pages when the language filter (in the footer) is changed.
// Add a new page's words here, one entry per language, in display order —
// the heading script re-renders one <span> per word.
export type Lang = "en" | "es" | "fr";

export const languages: { code: Lang; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "es", label: "ES" },
  { code: "fr", label: "FR" },
];

export const cityTitles: Record<string, Record<Lang, string[]>> = {
  "new-york": {
    en: ["new", "york", "city"],
    es: ["nueva", "york"],
    fr: ["new", "york"],
  },
  "new-zealand": {
    en: ["new", "zealand"],
    es: ["nueva", "zelanda"],
    fr: ["nouvelle", "zélande"],
  },
};

// Renders a cityTitles entry into the pipe-separated string the heading
// script expects in its data-i18n-<lang> attributes.
export function wordsAttr(slug: keyof typeof cityTitles, lang: Lang): string {
  return cityTitles[slug][lang].join("|");
}

// Same words joined with a space, for headings that render as a single
// line rather than one word per line.
export function cityLabel(slug: keyof typeof cityTitles, lang: Lang): string {
  return cityTitles[slug][lang].join(" ");
}

