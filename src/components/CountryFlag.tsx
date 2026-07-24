import {
  AU,
  CA,
  CN,
  DE,
  GB,
  HK,
  IE,
  JP,
  KR,
  MO,
  MY,
  NL,
  NZ,
  SG,
  US,
} from "country-flag-icons/react/3x2";

/** ISO 3166-1 alpha-2 codes we ship flags for. */
export type CountryCode =
  | "CN"
  | "HK"
  | "MO"
  | "SG"
  | "GB"
  | "US"
  | "CA"
  | "JP"
  | "KR"
  | "MY"
  | "AU"
  | "NZ"
  | "NL"
  | "DE"
  | "IE";

type FlagComponent = typeof HK;

const FLAG_BY_CODE: Record<CountryCode, FlagComponent> = {
  CN,
  HK,
  MO,
  SG,
  GB,
  US,
  CA,
  JP,
  KR,
  MY,
  AU,
  NZ,
  NL,
  DE,
  IE,
};

export const TITLE_BY_CODE: Record<CountryCode, string> = {
  CN: "中国",
  HK: "香港",
  MO: "澳门",
  SG: "新加坡",
  GB: "英国",
  US: "美国",
  CA: "加拿大",
  JP: "日本",
  KR: "韩国",
  MY: "马来西亚",
  AU: "澳大利亚",
  NZ: "新西兰",
  NL: "荷兰",
  DE: "德国",
  IE: "爱尔兰",
};

export function isCountryCode(value: string): value is CountryCode {
  return value in FLAG_BY_CODE;
}

export interface CountryFlagProps {
  code: string;
  /** Tailwind / CSS size; print uses mm-friendly classes from parent. */
  className?: string;
  title?: string;
}

/**
 * Vector country flag via [country-flag-icons](https://www.npmjs.com/package/country-flag-icons)
 * (SVG 3:2). Safe for on-screen preview and Playwright PDF export.
 */
export function CountryFlag({ code, className = "", title }: CountryFlagProps) {
  const upper = code.trim().toUpperCase();
  if (!isCountryCode(upper)) return null;

  const Flag = FLAG_BY_CODE[upper];
  const label = title ?? TITLE_BY_CODE[upper];

  return (
    <Flag
      aria-label={label}
      className={`inline-block shrink-0 rounded-[0.5mm] object-cover outline outline-[0.5pt] outline-rule ${className}`.trim()}
    />
  );
}
