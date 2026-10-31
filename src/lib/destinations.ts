/**
 * Shared destination data.
 *
 * Trip destination is stored in the existing `Trip.country` column, but the
 * value may be either a country or a city (e.g. "Jepang" or "Jakarta").
 * This file is the single source of truth for the destination picker, map
 * centering, and geocoding country filter so the lists no longer drift apart.
 */

const REGION_CODES =
  "AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW".split(
    " "
  );

// Keep the familiar Indonesian labels used by the app/data instead of the
// longer CLDR names ("Inggris Raya", "Hong Kong DAK Tiongkok").
const NAME_OVERRIDES: Record<string, string> = {
  GB: "Inggris",
  HK: "Hong Kong",
};

const regionNames = (() => {
  try {
    return new Intl.DisplayNames(["id"], { type: "region" });
  } catch {
    return null;
  }
})();

const COUNTRY_NAME_BY_CODE: Record<string, string> = {};

for (const code of REGION_CODES) {
  let name: string | undefined = NAME_OVERRIDES[code];
  if (!name && regionNames) {
    try {
      name = regionNames.of(code);
    } catch {
      name = undefined;
    }
  }
  if (name && name !== code) {
    COUNTRY_NAME_BY_CODE[code] = name;
  }
}

/** All country names in Indonesian, sorted for the autocomplete datalist. */
export const COUNTRIES = Array.from(new Set(Object.values(COUNTRY_NAME_BY_CODE))).sort(
  (a, b) => a.localeCompare(b, "id")
);

function normalize(value: string) {
  return value.trim().toLowerCase();
}

const COUNTRY_CODE_BY_NAME = new Map<string, string>();
for (const [code, name] of Object.entries(COUNTRY_NAME_BY_CODE)) {
  COUNTRY_CODE_BY_NAME.set(normalize(name), code.toLowerCase());
}

const COUNTRY_ALIASES: Record<string, string> = {
  "inggris raya": "gb",
  "united kingdom": "gb",
  uk: "gb",
  britania: "gb",
  "britania raya": "gb",
  "hong kong dak tiongkok": "hk",
  hongkong: "hk",
  usa: "us",
  "united states": "us",
  "amerika": "us",
  cina: "cn",
  china: "cn",
  uae: "ae",
  japan: "jp",
  "south korea": "kr",
  korea: "kr",
};

// Approximate city centers for common domestic jastip destinations. Used
// only for the initial map view; the real route is drawn from trip stops.
const CITY_CENTER: Record<string, [number, number]> = {
  Jakarta: [-6.2088, 106.8456],
  Surabaya: [-7.2575, 112.7521],
  Bandung: [-6.9175, 107.6191],
  Medan: [3.5952, 98.6722],
  Semarang: [-6.9932, 110.4203],
  Makassar: [-5.1477, 119.4327],
  Palembang: [-2.9761, 104.7754],
  Denpasar: [-8.6705, 115.2126],
  Bali: [-8.4095, 115.1889],
  Yogyakarta: [-7.7956, 110.3695],
  Surakarta: [-7.5755, 110.8243],
  Malang: [-7.9666, 112.6326],
  Batam: [1.1301, 104.0529],
  Balikpapan: [-1.2379, 116.8529],
  Manado: [1.4748, 124.8421],
  Mataram: [-8.5833, 116.1167],
  Lombok: [-8.5833, 116.1167],
  "Labuan Bajo": [-8.4964, 119.8877],
  Pontianak: [-0.0263, 109.3425],
  Banjarmasin: [-3.3186, 114.5944],
  Padang: [-0.9471, 100.4172],
  Pekanbaru: [0.5071, 101.4478],
  "Tanjung Pinang": [0.9186, 104.4667],
  Kupang: [-10.1772, 123.607],
  Jayapura: [-2.5337, 140.7181],
  Samarinda: [-0.5017, 117.1536],
};

const CITY_ALIASES: Record<string, string> = {
  jogja: "Yogyakarta",
  jogjakarta: "Yogyakarta",
  solo: "Surakarta",
};

const COUNTRY_CENTER: Record<string, [number, number]> = {
  Jepang: [36.2048, 138.2529],
  "Korea Selatan": [35.9078, 127.7669],
  Singapura: [1.3521, 103.8198],
  Malaysia: [4.2105, 101.9758],
  Thailand: [15.87, 100.9925],
  "Amerika Serikat": [39.8283, -98.5795],
  Inggris: [54.7024, -3.2766],
  Australia: [-25.2744, 133.7751],
  Jerman: [51.1657, 10.4515],
  Prancis: [46.2276, 2.2137],
  "Uni Emirat Arab": [23.4241, 53.8478],
  "Arab Saudi": [23.8859, 45.0792],
  "Hong Kong": [22.3193, 114.1694],
  Taiwan: [23.6978, 120.9605],
  Tiongkok: [35.8617, 104.1954],
  Filipina: [12.8797, 121.774],
  Vietnam: [14.0583, 108.2772],
  Brunei: [4.5353, 114.7277],
  Qatar: [25.3548, 51.1839],
  Kuwait: [29.3117, 47.4818],
};

const CENTER_BY_NAME = new Map<string, [number, number]>();
for (const [name, center] of Object.entries(COUNTRY_CENTER)) {
  CENTER_BY_NAME.set(normalize(name), center);
}
for (const [name, center] of Object.entries(CITY_CENTER)) {
  CENTER_BY_NAME.set(normalize(name), center);
}

const CITY_NAMES = new Set([
  ...Object.keys(CITY_CENTER).map(normalize),
  ...Object.keys(CITY_ALIASES),
]);

/** Map center for a known country/city, or undefined for free-form input. */
export function getDestinationCenter(name: string) {
  const key = normalize(name);
  if (!key) return undefined;
  const alias = CITY_ALIASES[key];
  return CENTER_BY_NAME.get(alias ? normalize(alias) : key);
}

/** ISO 3166-1 alpha-2 code (lowercase) for the geocoding country filter. */
export function getCountryCode(name: string) {
  const key = normalize(name);
  if (!key) return null;

  const alias = COUNTRY_ALIASES[key];
  if (alias) return alias;

  const code = COUNTRY_CODE_BY_NAME.get(key);
  if (code) return code;

  // Domestic city input: restrict place search to Indonesia.
  if (CITY_NAMES.has(key)) return "id";

  return null;
}
