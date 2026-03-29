import type { SchemeQuestionTree } from "../types";
import pmKisanTree from "./pm-kisan";
import ayushmanTree from "./ayushman";
import mgnregaTree from "./mgnrega";

/** All registered scheme question trees, keyed by schemeId */
export const QUESTION_TREES: Record<string, SchemeQuestionTree> = {
  "pm-kisan": pmKisanTree,
  ayushman: ayushmanTree,
  mgnrega: mgnregaTree,
};

/** Schemes that have structured interview trees */
export const INTERVIEW_ENABLED_SCHEMES = Object.keys(QUESTION_TREES);

export { pmKisanTree, ayushmanTree, mgnregaTree };
