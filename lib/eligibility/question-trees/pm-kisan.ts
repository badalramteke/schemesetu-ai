import type {
  EligibilityQuestion,
  SchemeQuestionTree,
  UserAnswers,
} from "../types";

// ─── PM-KISAN Question Tree ─────────────────────────────────────────────────

const questions: EligibilityQuestion[] = [
  // ── TIER 1: Base Questions (Always Ask) ──
  {
    id: "pmk_q1_farmer",
    scheme: "pm-kisan",
    tier: 1,
    text: "Are you a farmer?",
    context: "Let me check if you're eligible for PM-KISAN benefits.",
    inputType: "single-select",
    options: [
      { label: "Yes", value: "yes" },
      { label: "No", value: "no" },
      { label: "Not sure", value: "not_sure" },
    ],
    dependsOn: [],
    isMandatory: true,
    isInformational: false,
    failConditions: [
      {
        answerValues: ["no"],
        reason:
          "PM-KISAN is exclusively for farmers. Since you are not a farmer, you are not eligible for this scheme.",
      },
    ],
    warnConditions: [],
    followUps: [
      {
        triggerValue: "not_sure",
        followUpQuestion: {
          id: "pmk_q1b_land_clarify",
          scheme: "pm-kisan",
          tier: 1,
          text: "Do you own or work on agricultural land?",
          inputType: "single-select",
          options: [
            { label: "Yes, I own farmland", value: "yes" },
            { label: "Yes, I work on someone's farm", value: "worker" },
            { label: "No connection to farming", value: "no" },
          ],
          dependsOn: [],
          isMandatory: true,
          isInformational: false,
          failConditions: [
            {
              answerValues: ["no"],
              reason:
                "PM-KISAN requires connection to agriculture. Without farmland or farming work, you're not eligible.",
            },
          ],
          warnConditions: [
            {
              answerValues: ["worker"],
              warning:
                "PM-KISAN is primarily for landowner farmers. Farm workers may have limited eligibility.",
            },
          ],
          followUps: [],
        },
      },
    ],
  },
  {
    id: "pmk_q2_state",
    scheme: "pm-kisan",
    tier: 1,
    text: "Which state do you live in?",
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
      { label: "Other / Union Territory", value: "other" },
    ],
    dependsOn: [],
    isMandatory: true,
    isInformational: false,
    failConditions: [],
    warnConditions: [
      {
        answerValues: ["west_bengal"],
        warning:
          "Note: West Bengal has its own Krishak Bandhu scheme instead of PM-KISAN. You may still be eligible at the central level.",
      },
    ],
    followUps: [],
  },

  // ── TIER 2: Land-Based Questions ──
  {
    id: "pmk_q3_land_ownership",
    scheme: "pm-kisan",
    tier: 2,
    text: "Do you own agricultural land?",
    context: "Great! Now let's check your land details.",
    inputType: "single-select",
    options: [
      { label: "Yes, I own land", value: "own" },
      { label: "Yes, leased land", value: "leased" },
      { label: "Both owned and leased", value: "both" },
      { label: "No, I don't own land", value: "no" },
    ],
    dependsOn: [{ questionId: "pmk_q1_farmer", answers: ["yes"] }],
    isMandatory: true,
    isInformational: false,
    failConditions: [
      {
        answerValues: ["no"],
        reason:
          "PM-KISAN requires you to own agricultural land. Without land ownership, you're not eligible for this scheme.",
      },
    ],
    warnConditions: [
      {
        answerValues: ["leased"],
        warning:
          "PM-KISAN primarily benefits landowners. Leased land may have different rules in your state.",
      },
    ],
    followUps: [],
  },
  {
    id: "pmk_q4_land_size",
    scheme: "pm-kisan",
    tier: 2,
    text: "How much agricultural land do you own?",
    inputType: "single-select",
    options: [
      { label: "Less than 0.5 acres", value: "lt_0.5" },
      { label: "0.5 to 1 acre", value: "0.5_1" },
      { label: "1 to 2 acres", value: "1_2" },
      { label: "2 to 5 acres", value: "2_5" },
      { label: "More than 5 acres", value: "gt_5" },
    ],
    dependsOn: [
      { questionId: "pmk_q3_land_ownership", answers: ["own", "both"] },
    ],
    isMandatory: false,
    isInformational: true, // All sizes eligible, but useful info
    failConditions: [],
    warnConditions: [],
    followUps: [],
  },

  // ── TIER 3: Bank Details ──
  {
    id: "pmk_q5_bank_account",
    scheme: "pm-kisan",
    tier: 3,
    text: "Do you have a bank account in your name?",
    context: "PM-KISAN sends money directly to your bank account.",
    inputType: "single-select",
    options: [
      { label: "Yes", value: "yes" },
      { label: "No", value: "no" },
      { label: "In family member's name", value: "family" },
    ],
    dependsOn: [
      { questionId: "pmk_q1_farmer", answers: ["yes"] },
      { questionId: "pmk_q3_land_ownership", answers: ["own", "leased", "both"] },
    ],
    isMandatory: true,
    isInformational: false,
    failConditions: [],
    warnConditions: [
      {
        answerValues: ["no"],
        warning:
          "You'll need to open a bank account to receive PM-KISAN payments. Visit your nearest bank or CSC center.",
      },
    ],
    followUps: [
      {
        triggerValue: "family",
        followUpQuestion: {
          id: "pmk_q5b_own_account",
          scheme: "pm-kisan",
          tier: 3,
          text: "Can you open a bank account in your own name?",
          inputType: "single-select",
          options: [
            { label: "Yes, I can", value: "yes" },
            { label: "Need help with that", value: "need_help" },
          ],
          dependsOn: [],
          isMandatory: false,
          isInformational: true,
          failConditions: [],
          warnConditions: [
            {
              answerValues: ["need_help"],
              warning:
                "Visit your nearest CSC (Common Service Centre) or bank branch. They'll help you open an account with just your Aadhaar card.",
            },
          ],
          followUps: [],
        },
      },
    ],
  },
  {
    id: "pmk_q6_aadhaar_linked",
    scheme: "pm-kisan",
    tier: 3,
    text: "Is your Aadhaar card linked to your bank account?",
    inputType: "single-select",
    options: [
      { label: "Yes", value: "yes" },
      { label: "No", value: "no" },
      { label: "Not sure", value: "not_sure" },
    ],
    dependsOn: [{ questionId: "pmk_q5_bank_account", answers: ["yes"] }],
    isMandatory: false,
    isInformational: false,
    failConditions: [],
    warnConditions: [
      {
        answerValues: ["no", "not_sure"],
        warning:
          "Aadhaar-bank linking is required for PM-KISAN payments. Visit your bank branch to link it.",
      },
    ],
    followUps: [],
  },

  // ── TIER 4: Income & Previous Benefits ──
  {
    id: "pmk_q7_income",
    scheme: "pm-kisan",
    tier: 4,
    text: "What is your annual household income?",
    inputType: "single-select",
    options: [
      { label: "Less than ₹2.5 Lakh", value: "lt_2.5l" },
      { label: "₹2.5 to 5 Lakh", value: "2.5l_5l" },
      { label: "₹5 to 10 Lakh", value: "5l_10l" },
      { label: "More than ₹10 Lakh", value: "gt_10l" },
      { label: "Don't know", value: "dont_know" },
    ],
    dependsOn: [
      { questionId: "pmk_q1_farmer", answers: ["yes"] },
      { questionId: "pmk_q3_land_ownership", answers: ["own", "leased", "both"] },
    ],
    isMandatory: false,
    isInformational: true, // No income limit for PM-KISAN
    failConditions: [],
    warnConditions: [],
    followUps: [],
  },
  {
    id: "pmk_q8_previous_payments",
    scheme: "pm-kisan",
    tier: 4,
    text: "Have you received PM-KISAN payments before?",
    inputType: "single-select",
    options: [
      { label: "Yes", value: "yes" },
      { label: "No, first time", value: "no" },
      { label: "Not sure", value: "not_sure" },
    ],
    dependsOn: [
      { questionId: "pmk_q1_farmer", answers: ["yes"] },
      { questionId: "pmk_q3_land_ownership", answers: ["own", "leased", "both"] },
    ],
    isMandatory: false,
    isInformational: true,
    failConditions: [],
    warnConditions: [],
    followUps: [
      {
        triggerValue: "yes",
        followUpQuestion: {
          id: "pmk_q8b_installments",
          scheme: "pm-kisan",
          tier: 4,
          text: "How many installments have you received?",
          inputType: "single-select",
          options: [
            { label: "1-3 installments", value: "1_3" },
            { label: "4-6 installments", value: "4_6" },
            { label: "7+ installments", value: "7_plus" },
            { label: "Don't remember", value: "dont_know" },
          ],
          dependsOn: [],
          isMandatory: false,
          isInformational: true,
          failConditions: [],
          warnConditions: [],
          followUps: [],
        },
      },
    ],
  },
];

// ─── Eligibility Rules ───────────────────────────────────────────────────────

const pmKisanTree: SchemeQuestionTree = {
  schemeId: "pm-kisan",
  schemeName: "PM-KISAN",
  questions,
  eligibilityRules: [
    {
      description: "Non-farmer → Ineligible",
      evaluate: (answers: UserAnswers) => {
        const q1 = answers["pmk_q1_farmer"]?.answer;
        if (q1 === "no") {
          return {
            status: "ineligible",
            reason: "PM-KISAN is exclusively for farmer families.",
          };
        }
        // Check follow-up for "not sure" → no connection
        const q1b = answers["pmk_q1b_land_clarify"]?.answer;
        if (q1b === "no") {
          return {
            status: "ineligible",
            reason: "PM-KISAN requires connection to agriculture.",
          };
        }
        return null;
      },
    },
    {
      description: "No land ownership → Ineligible",
      evaluate: (answers: UserAnswers) => {
        const q3 = answers["pmk_q3_land_ownership"]?.answer;
        if (q3 === "no") {
          return {
            status: "ineligible",
            reason:
              "PM-KISAN requires agricultural land ownership. You need to own or lease farmland.",
          };
        }
        return null;
      },
    },
    {
      description: "Farmer + Land → Eligible",
      evaluate: (answers: UserAnswers) => {
        const q1 = answers["pmk_q1_farmer"]?.answer;
        const q3 = answers["pmk_q3_land_ownership"]?.answer;

        if (
          (q1 === "yes" || q1 === "not_sure") &&
          (q3 === "own" || q3 === "leased" || q3 === "both")
        ) {
          return {
            status: "eligible",
            reason:
              "You are eligible for PM-KISAN! As a farmer with agricultural land, you can receive ₹6,000 per year in 3 installments.",
          };
        }
        return null;
      },
    },
    {
      description: "Unclear / Not enough info → Maybe",
      evaluate: (answers: UserAnswers) => {
        const q1 = answers["pmk_q1_farmer"]?.answer;
        if (q1 === "not_sure") {
          const q1b = answers["pmk_q1b_land_clarify"]?.answer;
          if (q1b === "worker") {
            return {
              status: "maybe",
              reason:
                "As a farm worker, you may have limited PM-KISAN eligibility. Check with your local CSC or agriculture office.",
            };
          }
        }
        return null;
      },
    },
  ],
  documents: [
    "Aadhaar Card",
    "Land ownership documents (Khasra/Khatauni)",
    "Bank account passbook",
    "Declaration from Village Head (if leased land)",
  ],
  nextSteps: [
    "Visit your nearest CSC (Common Service Centre) with your documents",
    "Register online at pmkisan.gov.in",
    "Ensure your Aadhaar is linked to your bank account",
    "Submit land verification documents to your local Patwari",
    "Check payment status at pmkisan.gov.in after registration",
  ],
};

export default pmKisanTree;
