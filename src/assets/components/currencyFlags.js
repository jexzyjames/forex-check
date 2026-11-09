const FLAG_CODES = {
  AED: "ae", ARS: "ar", AUD: "au", BDT: "bd", BGN: "bg", BHD: "bh",
  BRL: "br", BSD: "bs", CAD: "ca", CHF: "ch", CLP: "cl", CNY: "cn", COP: "co",
  CZK: "cz", DKK: "dk", DOP: "do", EGP: "eg", EUR: "eu", FJD: "fj",
  GBP: "gb", GEL: "ge", HKD: "hk",
  HNL: "hn", HRK: "hr", HUF: "hu", IDR: "id", INR: "in", ISK: "is",
  ILS: "il", JPY: "jp", KES: "ke", KRW: "kr", KWD: "kw", LBP: "lb", LKR: "lk",
  MAD: "ma", MXN: "mx", MYR: "my", NGN: "ng", NOK: "no", NPR: "np",
  NZD: "nz", OMR: "om", PEN: "pe", PHP: "ph", PKR: "pk", PLN: "pl",
  QAR: "qa", RON: "ro", RUB: "ru", SAR: "sa", SEK: "se", SGD: "sg",
  THB: "th", TRY: "tr", TWD: "tw", UAH: "ua", USD: "us", UYU: "uy",
  VND: "vn", ZAR: "za",
};
const flagAssets = import.meta.glob("../images/flags/*.webp", {
  eager: true,
  import: "default",
});

export function getFlagUrl(code) {
  const flagCode = FLAG_CODES[code] || code.slice(0, 2).toLowerCase();
  return Object.entries(flagAssets).find(([path]) => path.endsWith(`/${flagCode}.webp`))?.[1];
}

export function getFlagEmoji(code) {
  if (code === "EUR") return "🇪🇺";
  const countryCode = FLAG_CODES[code];
  if (!countryCode) return "¤";
  return [...countryCode.toUpperCase()]
    .map((letter) => String.fromCodePoint(127397 + letter.charCodeAt(0)))
    .join("");
}
