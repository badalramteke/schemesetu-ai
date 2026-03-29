import type {
  EligibilityQuestion,
  SchemeQuestionTree,
  UserAnswers,
} from "../types";

// ─── Ayushman Bharat (PMJAY) Question Tree ──────────────────────────────────

const questions: EligibilityQuestion[] = [
  // ── TIER 1: Base ──
  {
    id: "ayush_q1_state",
    scheme: "ayushman",
    tier: 1,
    text: "Which state do you live in?",
    context: "Let me check your eligibility for Ayushman Bharat health coverage.",
    inputType: "dropdown",
    options: [
      { label: "Andhra Pradesh", value: "andhra_pradesh" },
      { label: "Arunachal Pradesh", value: "arunachal_pradesh" },
      { label: "Assam", value: "assam" },
      { label: "Bihar", value: "bihar" },
      { label: "Chhattisgarh", value: "chhattisgarh" },
      { label: "Goa", value: "goa" },
      { label: "Gujarat", value: "gujarat" },
      { label: "Haryana", value: "haryana" },
      { label: "Himachal Pradesh", value: "himachal_pradesh" },
      { label: "Jharkhand", value: "jharkhand" },
      { label: "Karnataka", value: "karnataka" },
      { label: "Kerala", value: "kerala" },
      { label: "Madhya Pradesh", value: "madhya_pradesh" },
      { label: "Maharashtra", value: "maharashtra" },
      { label: "Manipur", value: "manipur" },
      { label: "Meghalaya", value: "meghalaya" },
      { label: "Mizoram", value: "mizoram" },
      { label: "Nagaland", value: "nagaland" },
      { label: "Odisha", value: "odisha" },
      { label: "Punjab", value: "punjab" },
      { label: "Rajasthan", value: "rajasthan" },
      { label: "Sikkim", value: "sikkim" },
      { label: "Tamil Nadu", value: "tamil_nadu" },
      { label: "Telangana", value: "telangana" },
      { label: "Tripura", value: "tripura" },
      { label: "Uttar Pradesh", value: "uttar_pradesh" },
      { label: "Uttarakhand", value: "uttarakhand" },
      { label: "West Bengal", value: "west_bengal" },
      { label: "Delhi", value: "delhi" },
      { label: "Other / Union Territory", value: "other" },
    ],
    dependsOn: [],
    isMandatory: true,
    isInformational: false,
    failConditions: [
      {
        answerValues: ["delhi", "west_bengal", "odisha"],
        reason:
          "Your state has not adopted Ayushman Bharat (PMJAY). However, your state may have its own health scheme. Please check with local authorities.",
      },
    ],
    warnConditions: [],
    followUps: [],
  },

  // ── TIER 2: Economic Status ──
  {
    id: "ayush_q2_income",
    scheme: "ayushman",
    tier: 2,
    text: "What is your annual household income?",
    context: "Ayushman Bharat covers families based on economic status.",
    inputType: "single-select",
    options: [
      { label: "Less than ₹2.5 Lakh", value: "lt_2.5l" },
      { label: "₹2.5 to 5 Lakh", value: "2.5l_5l" },
      { label: "₹5 to 10 Lakh", value: "5l_10l" },
      { label: "More than ₹10 Lakh", value: "gt_10l" },
    ],
    dependsOn: [],
    isMandatory: true,
    isInformational: false,
    failConditions: [
      {
        answerValues: ["gt_10l"],
        reason:
          "With annual income above ₹10 Lakh, you are generally not eligible for Ayushman Bharat unless you have BPL/SECC status.",
      },
    ],
    warnConditions: [
      {
        answerValues: ["5l_10l"],
        warning:
          "Income between ₹5-10 Lakh is borderline. Eligibility may depend on your BPL/SECC status.",
      },
    ],
    followUps: [],
  },

  // ── TIER 3: BPL/SECC Status ──
  {
    id: "ayush_q3_bpl_status",
    scheme: "ayushman",
    tier: 3,
    text: "Do you have a BPL, APL, or SECC certificate?",
    context:
      "BPL and SECC families get automatic coverage under Ayushman Bharat.",
    inputType: "single-select",
    options: [
      { label: "BPL (Below Poverty Line) card", value: "bpl" },
      { label: "SECC (Socio-Economic Caste Census) listed", value: "secc" },
      { label: "APL (Above Poverty Line) card", value: "apl" },
      { label: "None of these", value: "none" },
      { label: "Not sure", value: "not_sure" },
    ],
    dependsOn: [],
    isMandatory: true,
    isInformational: false,
    failConditions: [],
    warnConditions: [
      {
        answerValues: ["not_sure"],
        warning:
          "You can check your SECC status online at mera.pmjay.gov.in using your phone number or Aadhaar.",
      },
    ],
    followUps: [],
  },
  {
    id: "ayush_q4_govt_employee",
    scheme: "ayushman",
    tier: 3,
    text: "Are you or any family member a government employee?",
    context:
      "Government employees are already covered under CGHS/State health schemes.",
    inputType: "single-select",
    options: [
      { label: "Yes", value: "yes" },
      { label: "No", value: "no" },
    ],
    dependsOn: [
      { questionId: "ayush_q2_income", answers: ["5l_10l", "gt_10l"] },
    ],
    isMandatory: true,
    isInformational: false,
    failConditions: [
      {
        answerValues: ["yes"],
        reason:
          "Government employees are not eligible for Ayushman Bharat as they are covered under CGHS or state health insurance.",
      },
    ],
    warnConditions: [],
    followUps: [],
  },

  // ── TIER 4: Family Details ──
  {
    id: "ayush_q5_family_size",
    scheme: "ayushman",
    tier: 4,
    text: "How many members are in your family?",
    inputType: "single-select",
    options: [
      { label: "1 (just me)", value: "1" },
      { label: "2 members", value: "2" },
      { label: "3-4 members", value: "3_4" },
      { label: "5 or more members", value: "5_plus" },
    ],
    dependsOn: [
      {
        questionId: "ayush_q2_income",
        answers: ["lt_2.5l", "2.5l_5l", "5l_10l"],
      },
    ],
    isMandatory: false,
    isInformational: true, // Affects premium calc, not eligibility
    failConditions: [],
    warnConditions: [],
    followUps: [],
  },
];

// ─── Eligibility Rules ───────────────────────────────────────────────────────

const ayushmanTree: SchemeQuestionTree = {
  schemeId: "ayushman",
  schemeName: "Ayushman Bharat (PMJAY)",
  questions,
  eligibilityRules: [
    {
      description: "Non-participating state → Ineligible",
      evaluate: (answers: UserAnswers) => {
        const state = answers["ayush_q1_state"]?.answer;
        if (["delhi", "west_bengal", "odisha"].includes(state)) {
          return {
            status: "ineligible",
            reason:
              "Your state has not adopted Ayushman Bharat. Check for state-specific health schemes.",
          };
        }
        return null;
      },
    },
    {
      description: "BPL/SECC → Eligible regardless of income",
      evaluate: (answers: UserAnswers) => {
        const bpl = answers["ayush_q3_bpl_status"]?.answer;
        if (bpl === "bpl" || bpl === "secc") {
          return {
            status: "eligible",
            reason:
              "With BPL/SECC status, you are eligible for Ayushman Bharat! You get ₹5 lakh health coverage per family per year.",
          };
        }
        return null;
      },
    },
    {
      description: "High income + no BPL + govt employee → Ineligible",
      evaluate: (answers: UserAnswers) => {
        const income = answers["ayush_q2_income"]?.answer;
        const bpl = answers["ayush_q3_bpl_status"]?.answer;
        const govt = answers["ayush_q4_govt_employee"]?.answer;

        if (income === "gt_10l" && bpl !== "bpl" && bpl !== "secc") {
          return {
            status: "ineligible",
            reason:
              "With income above ₹10 Lakh and no BPL/SECC status, you are not eligible for Ayushman Bharat.",
          };
        }
        if (govt === "yes") {
          return {
            status: "ineligible",
            reason:
              "Government employees are covered under CGHS/state health insurance, not Ayushman Bharat.",
          };
        }
        return null;
      },
    },
    {
      description: "APL + income < 5L + not govt → Eligible",
      evaluate: (answers: UserAnswers) => {
        const income = answers["ayush_q2_income"]?.answer;
        const bpl = answers["ayush_q3_bpl_status"]?.answer;
        const govt = answers["ayush_q4_govt_employee"]?.answer;

        if (
          (income === "lt_2.5l" || income === "2.5l_5l") &&
          govt !== "yes"
        ) {
          return {
            status: "eligible",
            reason:
              "Based on your income level, you are eligible for Ayushman Bharat! You get ₹5 lakh health coverage per family per year.",
          };
        }

        // Borderline: APL, 5-10L income, not BPL, not govt
        if (
          income === "5l_10l" &&
          (bpl === "apl" || bpl === "none") &&
          govt !== "yes"
        ) {
          return {
            status: "maybe",
            reason:
              "Your eligibility is borderline. Check your SECC status at mera.pmjay.gov.in or visit a CSC center.",
          };
        }
        return null;
      },
    },
  ],
  documents: [
    "Aadhaar Card (for all family members)",
    "Ration Card / BPL Card",
    "SECC inclusion letter (if available)",
    "Income Certificate from Tehsildar",
    "Family ID / Parivar Pehchan Patra",
  ],
  nextSteps: [
    "Check eligibility at mera.pmjay.gov.in using your mobile number",
    "Visit your nearest Ayushman Mitra at a government hospital",
    "Get your Ayushman Card (e-card) from the Ayushman Mitra desk",
    "Find empanelled hospitals at hospitals.pmjay.gov.in",
    "For cashless treatment, show your Ayushman card at any empanelled hospital",
  ],
};

export default ayushmanTree;
