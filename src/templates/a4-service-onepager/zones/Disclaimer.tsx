import type { ZhString } from "../../../content/types";
import { BILINGUAL_CHROME } from "../../../content/defaults/bilingual";
import { BiText } from "../../../components/BiText";

export interface DisclaimerProps {
  /** Always-on; defaults applied in loadProduct when omitted */
  value?: ZhString;
}

/**
 * Always-on disclaimer — max 14 mm, Chinese meta type.
 */
export function Disclaimer({ value }: DisclaimerProps) {
  const text = value ?? BILINGUAL_CHROME.disclaimer;

  return (
    <section className="max-h-[14mm] shrink-0 overflow-hidden">
      <BiText value={text} role="meta" />
    </section>
  );
}
