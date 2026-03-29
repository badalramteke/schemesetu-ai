import type { EligibilityResult } from "@/lib/rag-pipeline-client";

interface MockMessage {
  id: string;
  role: "user" | "ai";
  content?: string;
  eligibilityResults?: EligibilityResult[];
}

// 20 user questions + 20 AI answers = 40 messages total
export const MOCK_MESSAGES: MockMessage[] = [
  // Q1
  { id: "u1", role: "user", content: "I'm a farmer with 2 acres of land in Maharashtra" },
  { id: "a1", role: "ai", content: "I found 2 schemes that may be relevant to you:", eligibilityResults: [
    { schemeId: "pm-kisan", schemeName: "PM-KISAN", eligible: true, reason: "You own agricultural land under 2 hectares and are likely eligible for income support.", documents: ["Aadhaar Card", "Land ownership papers", "Bank passbook"], nextSteps: ["Visit your local CSC center", "Submit land documents", "Link Aadhaar to bank account"], benefits: "₹6,000 per year in 3 installments of ₹2,000 directly to bank account", confidence: "High", sourceUrl: "https://www.india.gov.in", lastVerified: "2024-05-12" },
    { schemeId: "mgnrega", schemeName: "MGNREGA", eligible: true, reason: "As a rural resident, you can get guaranteed wage employment.", documents: ["Job card", "Aadhaar Card"], nextSteps: ["Apply for job card at Gram Panchayat", "Request work when needed"], benefits: "100 days of guaranteed wage employment per year at ₹267/day", confidence: "High", sourceUrl: "https://www.india.gov.in", lastVerified: "2024-05-12" },
  ]},

  // Q2
  { id: "u2", role: "user", content: "Can I get housing under PMAY?" },
  { id: "a2", role: "ai", content: "I found 1 scheme that may be relevant to you:", eligibilityResults: [
    { schemeId: "pmay-awas", schemeName: "PMAY-G (Awas Yojana)", eligible: null, reason: "You may be eligible if you don't own a pucca house. More details about your current housing needed.", documents: ["Aadhaar Card", "Income certificate", "Land document", "Passport photo"], nextSteps: ["Check with Gram Panchayat if listed", "Apply at CSC center", "Await Awaas+ verification"], benefits: "₹1.20 lakh in plains / ₹1.30 lakh in hilly areas for house construction", confidence: "High", sourceUrl: "https://www.india.gov.in", lastVerified: "2024-05-12" },
  ]},

  // Q3
  { id: "u3", role: "user", content: "I'm 28 years old, unemployed, living in rural area" },
  { id: "a3", role: "ai", content: "I found 2 schemes that may be relevant to you:", eligibilityResults: [
    { schemeId: "mgnrega", schemeName: "MGNREGA", eligible: true, reason: "As an unemployed rural adult, you're eligible for guaranteed work.", documents: ["Job card", "Aadhaar Card", "Bank account"], nextSteps: ["Get job card from Gram Panchayat", "Demand work in writing", "Work will be provided within 15 days"], benefits: "100 days of work per year, ₹267/day wages", confidence: "High", sourceUrl: "https://www.india.gov.in", lastVerified: "2024-05-12" },
    { schemeId: "apy", schemeName: "Atal Pension Yojana (APY)", eligible: true, reason: "At 28, you're within the 18-40 age bracket for APY enrollment.", documents: ["Aadhaar Card", "Bank account", "Mobile number"], nextSteps: ["Open savings account if not available", "Fill APY form at bank", "Set up auto-debit"], benefits: "₹1,000-5,000 monthly pension after age 60 based on contribution", confidence: "High", sourceUrl: "https://www.india.gov.in", lastVerified: "2024-05-12" },
  ]},

  // Q4
  { id: "u4", role: "user", content: "What pension schemes are available for me?" },
  { id: "a4", role: "ai", content: "I found 1 scheme that may be relevant to you:", eligibilityResults: [
    { schemeId: "apy", schemeName: "Atal Pension Yojana (APY)", eligible: true, reason: "APY is available for all citizens aged 18-40 with a bank account.", documents: ["Aadhaar Card", "Bank account details", "Nominee details"], nextSteps: ["Visit your bank branch", "Fill APY registration form", "Choose pension amount ₹1K-5K", "Start monthly contributions"], benefits: "Guaranteed pension of ₹1,000 to ₹5,000/month after 60. Government co-contributes 50% for 5 years.", confidence: "High", sourceUrl: "https://www.india.gov.in", lastVerified: "2024-05-12" },
  ]},

  // Q5
  { id: "u5", role: "user", content: "I earn less than 2 lakh per year, any health scheme?" },
  { id: "a5", role: "ai", content: "I found 1 scheme that may be relevant to you:", eligibilityResults: [
    { schemeId: "ab-pmjay", schemeName: "Ayushman Bharat (PMJAY)", eligible: true, reason: "Your income is below the threshold. PMJAY covers families earning less than ₹2 lakh.", documents: ["Aadhaar Card", "Ration card", "Income certificate"], nextSteps: ["Check eligibility at mera.pmjay.gov.in", "Visit nearest empanelled hospital", "Get Ayushman card"], benefits: "₹5 lakh health coverage per family per year. Cashless treatment at any empanelled hospital.", confidence: "High", sourceUrl: "https://www.india.gov.in", lastVerified: "2024-05-12" },
  ]},

  // Q6
  { id: "u6", role: "user", content: "My mother needs medical treatment but we're poor" },
  { id: "a6", role: "ai", content: "I found 1 scheme that may be relevant to you:", eligibilityResults: [
    { schemeId: "ab-pmjay", schemeName: "Ayushman Bharat (PMJAY)", eligible: true, reason: "Low-income families can get free treatment up to ₹5 lakh per year under PMJAY.", documents: ["Aadhaar Card", "BPL card or Ration card", "Hospital referral"], nextSteps: ["Visit Ayushman Mitra at nearest government hospital", "Show Aadhaar for verification", "Get cashless treatment"], benefits: "₹5 lakh free health cover. 1,350+ procedures covered including surgeries.", confidence: "High", sourceUrl: "https://www.india.gov.in", lastVerified: "2024-05-12" },
  ]},

  // Q7
  { id: "u7", role: "user", content: "I want to apply for MGNREGA work in my village" },
  { id: "a7", role: "ai", content: "I found 1 scheme that may be relevant to you:", eligibilityResults: [
    { schemeId: "mgnrega", schemeName: "MGNREGA", eligible: true, reason: "Any rural adult can demand MGNREGA work. This is a legal right.", documents: ["Job card (apply if you don't have)", "Aadhaar Card"], nextSteps: ["Go to Gram Panchayat office", "Submit written demand for work", "Work must be given within 15 days", "If not given, you get unemployment allowance"], benefits: "100 days guaranteed wage employment. ₹267/day. Wages paid within 15 days to bank.", confidence: "High", sourceUrl: "https://www.india.gov.in", lastVerified: "2024-05-12" },
  ]},

  // Q8
  { id: "u8", role: "user", content: "I have 3 children and want education scholarships" },
  { id: "a8", role: "ai", content: "Based on your query, I couldn't find specific scholarship schemes in our database currently. Try visiting the National Scholarship Portal (scholarships.gov.in) for state and central scholarship options." },

  // Q9
  { id: "u9", role: "user", content: "I'm a widow with no income, what can I get?" },
  { id: "a9", role: "ai", content: "I found 2 schemes that may be relevant to you:", eligibilityResults: [
    { schemeId: "ab-pmjay", schemeName: "Ayushman Bharat (PMJAY)", eligible: true, reason: "As a low-income individual, you qualify for free health coverage.", documents: ["Aadhaar Card", "Widow certificate", "Income certificate"], nextSteps: ["Check eligibility on PMJAY portal", "Get Ayushman card at CSC"], benefits: "₹5 lakh free health insurance per year", confidence: "High", sourceUrl: "https://www.india.gov.in", lastVerified: "2024-05-12" },
    { schemeId: "pmay-awas", schemeName: "PMAY-G (Awas Yojana)", eligible: null, reason: "Widows are a priority category under PMAY-G if homeless.", documents: ["Aadhaar Card", "Widow certificate", "No-house certificate from Gram Panchayat"], nextSteps: ["Register with Gram Panchayat", "Apply through Awaas+ portal"], benefits: "₹1.20 lakh for house construction", confidence: "High", sourceUrl: "https://www.india.gov.in", lastVerified: "2024-05-12" },
  ]},

  // Q10
  { id: "u10", role: "user", content: "My family belongs to SC category, any special schemes?" },
  { id: "a10", role: "ai", content: "I found 2 schemes that may be relevant to you:", eligibilityResults: [
    { schemeId: "pmay-awas", schemeName: "PMAY-G (Awas Yojana)", eligible: true, reason: "SC families are a priority category under PMAY-G housing scheme.", documents: ["Caste certificate", "Aadhaar Card", "Income certificate"], nextSteps: ["Check with Gram Panchayat", "Apply through CSC center"], benefits: "₹1.20 lakh for house construction in plains", confidence: "High", sourceUrl: "https://www.india.gov.in", lastVerified: "2024-05-12" },
    { schemeId: "ab-pmjay", schemeName: "Ayushman Bharat (PMJAY)", eligible: true, reason: "SC families are automatically included in PMJAY if listed in SECC data.", documents: ["Aadhaar Card", "Caste certificate"], nextSteps: ["Check at mera.pmjay.gov.in", "Get Ayushman card"], benefits: "₹5 lakh free health coverage per family per year", confidence: "High", sourceUrl: "https://www.india.gov.in", lastVerified: "2024-05-12" },
  ]},

  // Q11
  { id: "u11", role: "user", content: "I'm a daily wage worker, any insurance available?" },
  { id: "a11", role: "ai", content: "I found 1 scheme that may be relevant to you:", eligibilityResults: [
    { schemeId: "ab-pmjay", schemeName: "Ayushman Bharat (PMJAY)", eligible: true, reason: "Daily wage workers in the unorganized sector are covered under PMJAY.", documents: ["Aadhaar Card", "Ration Card"], nextSteps: ["Check eligibility at PMJAY helpdesk", "Collect Ayushman card from CSC"], benefits: "₹5 lakh cashless health coverage at empanelled hospitals", confidence: "High", sourceUrl: "https://www.india.gov.in", lastVerified: "2024-05-12" },
  ]},

  // Q12
  { id: "u12", role: "user", content: "Can I get free gas connection from PM Ujjwala?" },
  { id: "a12", role: "ai", content: "PM Ujjwala Yojana is not in our current database of 5 schemes, but you can apply at your nearest LPG distributor. BPL families get free LPG connection with a ₹1,600 subsidy." },

  // Q13
  { id: "u13", role: "user", content: "I want to start a small shop, any loan scheme?" },
  { id: "a13", role: "ai", content: "Loan schemes like PM Mudra Yojana (up to ₹10 lakh loan) are available but not in our current 5-scheme database. Visit your nearest bank to apply for MUDRA loan." },

  // Q14
  { id: "u14", role: "user", content: "My daughter is getting married, any financial help?" },
  { id: "a14", role: "ai", content: "Marriage assistance schemes vary by state. Check your state government's portal for schemes like Kanya Vivah Yojana. Our current database focuses on 5 central schemes." },

  // Q15
  { id: "u15", role: "user", content: "I'm 60 years old and have no savings for retirement" },
  { id: "a15", role: "ai", content: "I found 1 scheme that may be relevant to you:", eligibilityResults: [
    { schemeId: "apy", schemeName: "Atal Pension Yojana (APY)", eligible: false, reason: "APY is only for citizens aged 18-40. At 60, you're above the enrollment age limit.", documents: [], nextSteps: ["Check Indira Gandhi National Old Age Pension Scheme at your Gram Panchayat", "Apply for state old-age pension if available"], benefits: "Not eligible for APY. National Old Age Pension provides ₹200-500/month for BPL elderly.", confidence: "High", sourceUrl: "https://www.india.gov.in", lastVerified: "2024-05-12" },
  ]},

  // Q16
  { id: "u16", role: "user", content: "I need toilet construction support in my village" },
  { id: "a16", role: "ai", content: "Swachh Bharat Mission provides ₹12,000 incentive for toilet construction. This is not in our core 5 schemes. Apply through your Gram Panchayat." },

  // Q17
  { id: "u17", role: "user", content: "What schemes are there for women entrepreneurs?" },
  { id: "a17", role: "ai", content: "Women entrepreneurship schemes like Stand Up India (₹10 lakh - ₹1 crore loan) are available. Check standupmitra.in. Our database currently covers 5 core welfare schemes." },

  // Q18
  { id: "u18", role: "user", content: "I'm a fisherman, any PM Matsya Sampada benefits?" },
  { id: "a18", role: "ai", content: "I found 1 scheme that may be relevant to you:", eligibilityResults: [
    { schemeId: "pm-kisan", schemeName: "PM-KISAN", eligible: null, reason: "PM-KISAN primarily covers farmers. As a fisherman, eligibility depends on whether you also hold agricultural land.", documents: ["Aadhaar Card", "Land documents (if farmer)", "Bank passbook"], nextSteps: ["Check if you hold agricultural land", "Visit CSC if eligible", "For fisheries: check PMMSY at dof.gov.in"], benefits: "If eligible: ₹6,000/year. For fisheries-specific benefits, check PM Matsya Sampada Yojana.", confidence: "High", sourceUrl: "https://www.india.gov.in", lastVerified: "2024-05-12" },
  ]},

  // Q19
  { id: "u19", role: "user", content: "I want to learn a skill, any training programs?" },
  { id: "a19", role: "ai", content: "Pradhan Mantri Kaushal Vikas Yojana (PMKVY) offers free skill training. Visit pmkvyofficial.org or your nearest Skill India center. Not in our current 5-scheme database." },

  // Q20
  { id: "u20", role: "user", content: "My house was damaged in floods, any relief scheme?" },
  { id: "a20", role: "ai", content: "I found 1 scheme that may be relevant to you:", eligibilityResults: [
    { schemeId: "pmay-awas", schemeName: "PMAY-G (Awas Yojana)", eligible: true, reason: "Families whose houses were damaged by natural disasters are a priority under PMAY-G.", documents: ["Aadhaar Card", "Damage assessment report from authorities", "Photo of damaged house", "Bank account details"], nextSteps: ["Report damage to District Collector", "Get damage certificate", "Apply for PMAY-G through Gram Panchayat", "Also check SDRF/NDRF relief from district"], benefits: "₹1.20 lakh for new house. Additionally, State Disaster Relief Fund may provide ₹95,100 for fully damaged houses.", confidence: "High", sourceUrl: "https://www.india.gov.in", lastVerified: "2024-05-12" },
  ]},
];
