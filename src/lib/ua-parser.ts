/**
 * Server-side User-Agent parser.
 * Extracts browser, OS, and device type from a UA string.
 * Used during event ingestion so we always have reliable device data
 * regardless of client-side SDK configuration.
 */

export type ParsedUserAgent = {
  browser: string;
  os: string;
  deviceType: "desktop" | "mobile" | "tablet";
};

export function parseUserAgent(ua: string): ParsedUserAgent {
  let browser = "Unknown";
  let os = "Unknown";
  let deviceType: ParsedUserAgent["deviceType"] = "desktop";

  // ── Browser detection (order matters — most specific first) ──
  if (/Edg\//i.test(ua)) browser = "Edge";
  else if (/OPR\//i.test(ua) || /Opera/i.test(ua)) browser = "Opera";
  else if (/Brave/i.test(ua)) browser = "Brave";
  else if (/Vivaldi/i.test(ua)) browser = "Vivaldi";
  else if (/SamsungBrowser/i.test(ua)) browser = "Samsung Internet";
  else if (/UCBrowser/i.test(ua)) browser = "UC Browser";
  else if (/Chrome\//i.test(ua) && !/Chromium/i.test(ua)) browser = "Chrome";
  else if (/Chromium/i.test(ua)) browser = "Chromium";
  else if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) browser = "Safari";
  else if (/Firefox\//i.test(ua)) browser = "Firefox";

  // ── OS detection ──
  if (/Windows/i.test(ua)) os = "Windows";
  else if (/Mac OS|Macintosh/i.test(ua)) os = "macOS";
  else if (/CrOS/i.test(ua)) os = "Chrome OS";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/iOS|iPhone|iPad|iPod/i.test(ua)) os = "iOS";
  else if (/Linux/i.test(ua)) os = "Linux";

  // ── Device type detection ──
  if (/Mobi|Android.*Mobile|iPhone|iPod/i.test(ua)) deviceType = "mobile";
  else if (/iPad|Tablet|PlayBook|Silk/i.test(ua)) deviceType = "tablet";

  return { browser, os, deviceType };
}

/**
 * Map ISO 3166-1 alpha-2 country codes to flag emoji + country name.
 */
const COUNTRY_NAMES: Record<string, string> = {
  AF: "Afghanistan", AL: "Albania", DZ: "Algeria", AD: "Andorra", AO: "Angola",
  AR: "Argentina", AM: "Armenia", AU: "Australia", AT: "Austria", AZ: "Azerbaijan",
  BS: "Bahamas", BH: "Bahrain", BD: "Bangladesh", BB: "Barbados", BY: "Belarus",
  BE: "Belgium", BZ: "Belize", BJ: "Benin", BT: "Bhutan", BO: "Bolivia",
  BA: "Bosnia", BW: "Botswana", BR: "Brazil", BN: "Brunei", BG: "Bulgaria",
  BF: "Burkina Faso", BI: "Burundi", KH: "Cambodia", CM: "Cameroon", CA: "Canada",
  CL: "Chile", CN: "China", CO: "Colombia", CR: "Costa Rica", HR: "Croatia",
  CU: "Cuba", CY: "Cyprus", CZ: "Czechia", DK: "Denmark", DO: "Dominican Republic",
  EC: "Ecuador", EG: "Egypt", SV: "El Salvador", EE: "Estonia", ET: "Ethiopia",
  FI: "Finland", FR: "France", GA: "Gabon", GE: "Georgia", DE: "Germany",
  GH: "Ghana", GR: "Greece", GT: "Guatemala", GN: "Guinea", HT: "Haiti",
  HN: "Honduras", HK: "Hong Kong", HU: "Hungary", IS: "Iceland", IN: "India",
  ID: "Indonesia", IR: "Iran", IQ: "Iraq", IE: "Ireland", IL: "Israel",
  IT: "Italy", JM: "Jamaica", JP: "Japan", JO: "Jordan", KZ: "Kazakhstan",
  KE: "Kenya", KW: "Kuwait", KG: "Kyrgyzstan", LA: "Laos", LV: "Latvia",
  LB: "Lebanon", LY: "Libya", LT: "Lithuania", LU: "Luxembourg", MO: "Macao",
  MG: "Madagascar", MY: "Malaysia", MV: "Maldives", ML: "Mali", MT: "Malta",
  MX: "Mexico", MD: "Moldova", MC: "Monaco", MN: "Mongolia", ME: "Montenegro",
  MA: "Morocco", MZ: "Mozambique", MM: "Myanmar", NA: "Namibia", NP: "Nepal",
  NL: "Netherlands", NZ: "New Zealand", NI: "Nicaragua", NE: "Niger", NG: "Nigeria",
  MK: "North Macedonia", NO: "Norway", OM: "Oman", PK: "Pakistan", PA: "Panama",
  PY: "Paraguay", PE: "Peru", PH: "Philippines", PL: "Poland", PT: "Portugal",
  QA: "Qatar", RO: "Romania", RU: "Russia", RW: "Rwanda", SA: "Saudi Arabia",
  SN: "Senegal", RS: "Serbia", SG: "Singapore", SK: "Slovakia", SI: "Slovenia",
  SO: "Somalia", ZA: "South Africa", KR: "South Korea", ES: "Spain", LK: "Sri Lanka",
  SD: "Sudan", SE: "Sweden", CH: "Switzerland", SY: "Syria", TW: "Taiwan",
  TJ: "Tajikistan", TZ: "Tanzania", TH: "Thailand", TN: "Tunisia", TR: "Turkey",
  TM: "Turkmenistan", UG: "Uganda", UA: "Ukraine", AE: "UAE", GB: "United Kingdom",
  US: "United States", UY: "Uruguay", UZ: "Uzbekistan", VE: "Venezuela", VN: "Vietnam",
  YE: "Yemen", ZM: "Zambia", ZW: "Zimbabwe",
};

export function countryCodeToName(code: string): string {
  return COUNTRY_NAMES[code.toUpperCase()] ?? code;
}

export function countryCodeToFlag(code: string): string {
  const upper = code.toUpperCase();
  if (upper.length !== 2) return "🌍";
  const codePoints = [...upper].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65);
  return String.fromCodePoint(...codePoints);
}
