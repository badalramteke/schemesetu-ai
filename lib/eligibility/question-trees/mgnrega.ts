import type {
  EligibilityQuestion,
  SchemeQuestionTree,
  UserAnswers,
} from "../types";

// ─── MGNREGA Question Tree ──────────────────────────────────────────────────

const questions: EligibilityQuestion[] = [
  // ── TIER 1: Base ──
  {
    id: "mgn_q1_employment",
    scheme: "mgnrega",
    tier: 1,
    text: "Are you currently looking for work?",
    context: "MGNREGA guarantees 100 days of work per year to rural households.",
    inputType: "single-select",
    options: [
      { label: "Yes, I'm unemployed", value: "unemployed" },
      { label: "Yes, I need more work", value: "underemployed" },
      { label: "No, I have full-time work", value: "employed" },
    ],
    dependsOn: [],
    isMandatory: true,
    isInformational: false,
    failConditions: [
      {
        answerValues: ["employed"],
        reason:
          "MGNREGA is designed for those seeking employment. Since you have full-time work, this scheme may not be applicable.",
      },
    ],
    warnConditions: [],
    followUps: [],
  },
  {
    id: "mgn_q2_age",
    scheme: "mgnrega",
    tier: 1,
    text: "What is your age?",
    inputType: "single-select",
    options: [
      { label: "Below 18", value: "below_18" },
      { label: "18 to 30 years", value: "18_30" },
      { label: "30 to 45 years", value: "30_45" },
      { label: "45 to 60 years", value: "45_60" },
      { label: "Above 60 years", value: "above_60" },
    ],
    dependsOn: [],
    isMandatory: true,
    isInformational: false,
    failConditions: [
      {
        answerValues: ["below_18"],
        reason:
          "You must be at least 18 years old to register for MGNREGA work.",
      },
    ],
    warnConditions: [],
    followUps: [],
  },

  // ── TIER 2: Residency ──
  {
    id: "mgn_q3_residency",
    scheme: "mgnrega",
    tier: 2,
    text: "How long have you lived in your current village?",
    context: "MGNREGA work is provided in the village/block where you live.",
    inputType: "single-select",
    options: [
      { label: "Less than 6 months", value: "lt_6m" },
      { label: "6 months to 1 year", value: "6m_1y" },
      { label: "1 to 3 years", value: "1_3y" },
      { label: "More than 3 years", value: "gt_3y" },
      { label: "Born here", value: "born_here" },
    ],
    dependsOn: [
      {
        questionId: "mgn_q1_employment",
        answers: ["unemployed", "underemployed"],
      },
    ],
    isMandatory: true,
    isInformational: false,
    failConditions: [],
    warnConditions: [
      {
        answerValues: ["lt_6m"],
        warning:
          "You may need to register with the local Gram Panchayat first. Recent migrants can still apply but may face delays.",
      },
    ],
    followUps: [
      {
        triggerValue: "lt_6m",
        followUpQuestion: {
          id: "mgn_q3b_plan_to_stay",
          scheme: "mgnrega",
          tier: 2,
          text: "Do you plan to stay in this village?",
          inputType: "single-select",
          options: [
            { label: "Yes, permanently", value: "yes" },
            { label: "For a few months", value: "temporary" },
            { label: "Not sure", value: "not_sure" },
          ],
          dependsOn: [],
          isMandatory: false,
          isInformational: true,
          failConditions: [],
          warnConditions: [
            {
              answerValues: ["temporary"],
              warning:
                "MGNREGA registration is village-specific. If you move, you'll need to re-register in the new village.",
            },
          ],
          followUps: [],
        },
      },
    ],
  },

  // ── TIER 3: Economic Status ──
  {
    id: "mgn_q4_economic_status",
    scheme: "mgnrega",
    tier: 3,
    text: "What is your economic status?",
    inputType: "single-select",
    options: [
      { label: "BPL (Below Poverty Line)", value: "bpl" },
      { label: "APL (Above Poverty Line)", value: "apl" },
      { label: "SECC listed", value: "secc" },
      { label: "General", value: "general" },
      { label: "Don't know", value: "dont_know" },
    ],
    dependsOn: [
      {
        questionId: "mgn_q1_employment",
        answers: ["unemployed", "underemployed"],
      },
    ],
    isMandatory: false,
    isInformational: true, // BPL gets priority but APL also eligible
    failConditions: [],
    warnConditions: [
      {
        answerValues: ["bpl", "secc"],
        warning:
          "As a BPL/SECC family, you'll get priority for MGNREGA work allocation.",
      },
    ],
    followUps: [],
  },
  {
    id: "mgn_q5_job_card",
    scheme: "mgnrega",
    tier: 3,
    text: "Do you have a MGNREGA Job Card?",
    inputType: "single-select",
    options: [
      { label: "Yes", value: "yes" },
      { label: "No", value: "no" },
      { label: "Applied but not received", value: "applied" },
      { label: "Had one but lost it", value: "lost" },
    ],
    dependsOn: [
      {
        questionId: "mgn_q1_employment",
        answers: ["unemployed", "underemployed"],
      },
    ],
    isMandatory: false,
    isInformational: true,
    failConditions: [],
    warnConditions: [
      {
        answerValues: ["no"],
        warning:
          "You'll need to apply for a Job Card at your Gram Panchayat office. It's free.",
      },
      {
        answerValues: ["lost"],
        warning:
          "Visit your Gram Panchayat to get a duplicate Job Card issued.",
      },
    ],
    followUps: [],
  },
];

// ─── Eligibility Rules ───────────────────────────────────────────────────────

const mgnregaTree: SchemeQuestionTree = {
  schemeId: "mgnrega",
  schemeName: "MGNREGA",
  questions,
  eligibilityRules: [
    {
      description: "Fully employed → Ineligible",
      evaluate: (answers: UserAnswers) => {
        const q1 = answers["mgn_q1_employment"]?.answer;
        if (q1 === "employed") {
          return {
            status: "ineligible",
            reason:
              "MGNREGA is for households seeking employment. Since you have full-time work, you don't need this guarantee.",
          };
        }
        return null;
      },
    },
    {
      description: "Under 18 → Ineligible",
      evaluate: (answers: UserAnswers) => {
        const q2 = answers["mgn_q2_age"]?.answer;
        if (q2 === "below_18") {
          return {
            status: "ineligible",
            reason:
              "You must be 18 years or older to work under MGNREGA.",
          };
        }
        return null;
      },
    },
    {
      description: "Seeking work + adult → Eligible",
      evaluate: (answers: UserAnswers) => {
        const q1 = answers["mgn_q1_employment"]?.answer;
        const q2 = answers["mgn_q2_age"]?.answer;

        if (
          (q1 === "unemployed" || q1 === "underemployed") &&
          q2 !== "below_18"
        ) {
          return {
            status: "eligible",
            reason:
              "You are eligible for MGNREGA! You can get 100 days of guaranteed work per year at minimum wage rates.",
          };
        }
        return null;
      },
    },
  ],
  documents: [
    "Aadhaar Card",
    "Photograph (passport size)",
    "Address proof (ration card / voter ID)",
    "MGNREGA Job Card (or apply for new one)",
    "Bank account passbook",
  ],
  nextSteps: [
    "Visit your Gram Panchayat office to get a Job Card",
    "Apply for work in writing to the Gram Panchayat",
    "Work must be provided within 15 days of application",
    "If no work provided within 15 days, you get unemployment allowance",
    "Wages are paid directly to your bank account within 15 days of work",
    "Check work status and wages at nrega.nic.in",
  ],
};

export default mgnregaTree;
