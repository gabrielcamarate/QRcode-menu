const translationCache = new Map<string, string>();

type TranslateOptions = {
  from: "pt";
  to: "en";
};

function buildCacheKey(text: string, options: TranslateOptions) {
  return `${options.from}:${options.to}:${text}`;
}

async function translateWithMyMemory(text: string, options: TranslateOptions) {
  const cacheKey = buildCacheKey(text, options);
  const cached = translationCache.get(cacheKey);
  if (cached) return cached;

  const endpoint = new URL("https://api.mymemory.translated.net/get");
  endpoint.searchParams.set("q", text);
  endpoint.searchParams.set("langpair", `${options.from}|${options.to}`);

  const response = await fetch(endpoint.toString(), {
    method: "GET",
    next: { revalidate: 60 * 60 * 24 },
  });

  if (!response.ok) {
    throw new Error(`Translation API error: ${response.status}`);
  }

  const payload = (await response.json()) as {
    responseData?: { translatedText?: string };
  };

  const translated = payload.responseData?.translatedText?.trim();
  if (!translated) return text;

  translationCache.set(cacheKey, translated);
  return translated;
}

export async function translateBatchToEnglish(texts: string[]) {
  const unique = [...new Set(texts.map((text) => text.trim()).filter(Boolean))];
  if (unique.length === 0) return new Map<string, string>();

  const translations = await Promise.all(
    unique.map(async (text) => {
      try {
        const translated = await translateWithMyMemory(text, { from: "pt", to: "en" });
        return [text, translated] as const;
      } catch {
        return [text, text] as const;
      }
    }),
  );

  return new Map<string, string>(translations);
}
