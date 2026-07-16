import type { ExamPathway } from "./types";

export interface PathwayMeta {
  id: ExamPathway;
  /** Short chip label */
  label: string;
  /** Subtitle under filter */
  description: string;
  /** Default categoryLabel on products */
  categoryLabel: string;
}

/** Ordered filter chips for gallery (考生路线). */
export const EXAM_PATHWAYS: PathwayMeta[] = [
  {
    id: "gaokao",
    label: "高考",
    description: "中国大陆普通高考",
    categoryLabel: "高考本科出海",
  },
  {
    id: "dse",
    label: "DSE",
    description: "香港中学文凭考试",
    categoryLabel: "DSE本科出海",
  },
  {
    id: "alevel",
    label: "A-Level",
    description: "英国高考（A-Level）",
    categoryLabel: "A-Level本科出海",
  },
  {
    id: "sat",
    label: "SAT",
    description: "美国高考（SAT/美高）",
    categoryLabel: "SAT本科出海",
  },
];

export function pathwayMeta(id: ExamPathway): PathwayMeta {
  const found = EXAM_PATHWAYS.find((p) => p.id === id);
  if (!found) throw new Error(`Unknown pathway: ${id}`);
  return found;
}

/** Title pattern: 【路线】通【国家】 */
export function pathwayProductName(
  pathway: ExamPathway,
  countryZh: string,
): string {
  const prefix: Record<ExamPathway, string> = {
    gaokao: "高考",
    dse: "DSE",
    alevel: "A-Level",
    sat: "SAT",
  };
  return `${prefix[pathway]}通${countryZh}`;
}
