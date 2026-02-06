const EUR_CURRENCY = "EUR";
const DEFAULT_LOCALE = "pt-PT";

export function formatEurCurrency(value: number, locale: string = DEFAULT_LOCALE) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: EUR_CURRENCY,
  }).format(value);
}

