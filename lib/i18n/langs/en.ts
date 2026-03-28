import type { Translations } from "../types";

const en: Translations = {
  onboarding: {
    ageLabel: "How old are you?",
    agePlaceholder: "e.g. 35",
    genderLabel: "What is your gender?",
    genderOptions: [
      { value: "male", label: "Male" },
      { value: "female", label: "Female" },
      { value: "other", label: "Other" },
    ],
    locationLabel: "Where do you live?",
    statePlaceholder: "State (e.g. Maharashtra)",
    districtPlaceholder: "District (e.g. Nagpur)",
    villagePlaceholder: "Village/City (e.g. Ramtek)",
    employmentLabel: "What do you do?",
    employmentOptions: [
      { value: "farmer", label: "🌾 Farmer" },
      { value: "govt", label: "🏛️ Government Job" },
      { value: "private", label: "💼 Private Job" },
      { value: "self-employed", label: "🛒 Self-Employed" },
      { value: "unemployed", label: "🔍 Unemployed" },
      { value: "student", label: "🎓 Student" },
      { value: "other", label: "📋 Other" },
    ],
    next: "Next",
    skip: "Skip",
    letsGo: "Let's Go! 🚀",
    stepOf: (step, total) => `Step ${step} of ${total}`,
    skipHint: "You can skip — AI will ask naturally 🤖",
  },
  langSelect: {
    title: "SchemeSetu",
    subtitle: "Your AI Guide to Government Schemes",
    footer: "Made for Rural India 🇮🇳",
  },
  chat: {
    greeting: (name, tod) => (name ? `Good ${tod}, ${name}` : `Good ${tod}`),
    morning: "Morning",
    afternoon: "Afternoon",
    evening: "Evening",
    placeholder: "How can I help you today?",
    voiceNotSupported: "Voice not supported in this browser",
    noSchemes:
      "I couldn't find matching schemes. Try adding more details — your age, occupation, income, location. 🙏",
    foundSchemes: (count) =>
      `I found ${count} scheme${count > 1 ? "s" : ""} that may be relevant to you:`,
    busy: "We're experiencing high traffic. Please try again later. 🙏",
    loadTest: "Load 20 Test Q&As",
    scrubHint: "Swipe to browse questions",
    sectorPrompt: (query) => `Tell me about ${query} I might be eligible for`,
    goalQuestion: "What are you looking for right now?",
    goalChips: [
      { value: "financial", label: "💰 Financial support / Cash transfer" },
      { value: "subsidy", label: "🌾 Subsidy (fertiliser / energy)" },
      { value: "training", label: "📚 Training / Skill development" },
      { value: "loan", label: "🏦 Loan / Credit support" },
      { value: "health", label: "🏥 Health coverage" },
      { value: "housing", label: "🏠 Housing support" },
      { value: "pension", label: "👴 Pension / Social welfare" },
      { value: "everything", label: "❓ Show me everything relevant" },
    ],
    wizardIntro:
      "Please answer a few quick questions so I can check your eligibility:",
    sectors: {
      agriculture: {
        label: "Agriculture",
        query: "agriculture and farming schemes",
      },
      healthcare: {
        label: "Healthcare",
        query: "health and medical schemes",
      },
      housing: { label: "Housing", query: "housing and shelter schemes" },
      employment: {
        label: "Employment",
        query: "employment and work schemes",
      },
      pension: { label: "Pension", query: "pension and retirement schemes" },
      education: {
        label: "Education",
        query: "education and skills schemes",
      },
    },
  },
  header: { newChat: "New Chat" },
  sidebar: {
    home: "Home",
    newChat: "New Chat",
    settings: "Settings",
    faq: "FAQ / Help",
    contact: "Contact Us",
    about: "About",
    privacy: "Privacy Policy",
    tagline: "AI Scheme Advisor",
    footer: "Made for rural India 🇮🇳",
  },
  homeDashboard: {
    greeting: (name) => (name ? `Namaste, ${name}! 🙏` : "Namaste! 🙏"),
    subtitle: "Which scheme are you looking for?",
    searchPlaceholder: "Search schemes...",
    askMe: "Buddy Ask ME!!",
  },
  conversational: {
    questionsPrefix:
      "Just one quick question to find the right schemes for you:",
    readyMessage:
      "Perfect! Let me check all matching schemes now. This usually takes 30–40 seconds… ⏳",
    preferNotToAnswer: "🔒 Prefer not to answer",
    borderline:
      "Based on what you've shared, you're likely eligible — one more detail will confirm.",
    didYouMean: (label: string) => `I heard: "${label}" — is that right?`,
    confirmChips: [
      { value: "confirm_yes", label: "✅ Yes, that's right" },
      { value: "confirm_no", label: "Let me pick again" },
    ],
    bridging: "Got it. Let me check one more thing...",
    questions: {
      owns_land: {
        text: "Do you own or cultivate agricultural land?",
        chips: [
          { value: "yes_own", label: "✅ Yes — I own land" },
          { value: "yes_cultivate", label: "🌾 I cultivate others' land" },
          { value: "no", label: "❌ No" },
        ],
      },
      land_size: {
        text: "How many acres of land do you have?",
        chips: [
          { value: "lt1", label: "Less than 1 acre" },
          { value: "1to2", label: "1 – 2 acres" },
          { value: "2to5", label: "2 – 5 acres" },
          { value: "gt5", label: "More than 5 acres" },
        ],
      },
      is_taxpayer: {
        text: "Are you or any family member an income tax payer?",
        chips: [
          { value: "no", label: "No" },
          { value: "yes", label: "Yes" },
          { value: "not_sure", label: "Not sure" },
        ],
      },
      bank_aadhaar: {
        text: "Is your bank account linked to Aadhaar (Aadhaar seeding done)?",
        chips: [
          { value: "yes", label: "✅ Yes, linked" },
          { value: "no", label: "Not yet" },
          { value: "not_sure", label: "Not sure" },
        ],
      },
      family_income: {
        text: "What is your approximate yearly family income?",
        chips: [
          { value: "lt1L", label: "Below ₹1 lakh" },
          { value: "1to2L", label: "₹1 – ₹2 lakh" },
          { value: "2to5L", label: "₹2 – ₹5 lakh" },
          { value: "gt5L", label: "Above ₹5 lakh" },
        ],
        sensitive: true,
        sensitiveNote: "Optional — helps us find income-based schemes for you",
      },
      has_ration: {
        text: "Do you have a ration card?",
        chips: [
          { value: "bpl", label: "✅ Yes — BPL card" },
          { value: "apl", label: "APL card" },
          { value: "no", label: "No ration card" },
        ],
      },
      owns_pucca: {
        text: "Do you currently own a pucca (permanent) house?",
        chips: [
          { value: "yes", label: "Yes, I have a pucca house" },
          { value: "partial", label: "Kutcha / damaged house" },
          { value: "no", label: "No house" },
        ],
      },
      has_job_card: {
        text: "Do you have a MGNREGA job card?",
        chips: [
          { value: "yes", label: "Yes" },
          { value: "no", label: "No, but I want one" },
          { value: "not_sure", label: "Not sure what that is" },
        ],
      },
      has_bank_acct: {
        text: "Do you have a savings bank account?",
        chips: [
          { value: "yes", label: "✅ Yes" },
          { value: "post_office", label: "Post office account" },
          { value: "no", label: "No account yet" },
        ],
      },
    },
  },
  csc: {
    nearestCentre: "Nearest CSC Centre",
    commonServiceCentresIn: (loc) => `Common Service Centres in ${loc}`,
    find: "Find",
    findNearest: "Find Nearest CSC",
    locating: "Locating...",
    nearestFound: "Nearest CSC Found!",
    openInMaps: "Open in Maps",
    bookAppointment: "Book Appointment",
    bookingConfirmed: "Booking Confirmed!",
    bookingConfirmedDesc:
      "A WhatsApp confirmation has been sent. The CSC will contact you shortly.",
    yourDetails: "Your Details for Booking",
    fullName: "Full Name",
    phoneNumber: "Phone Number",
    schemeInterest: "Scheme Interest (optional)",
    confirmBooking: "Confirm Booking",
    sending: "Sending...",
    cancel: "Cancel",
    showMore: "Show More Centres",
    showLess: "Show Less",
    officialLocator: "CSC Official Locator",
    helpline: "CSC Helpline (Toll-Free)",
    findCscCentre: "Find nearest CSC centre",
    hide: "Hide",
  },
  schemeCard: {
    nextSteps: "Next Steps",
    documentsNeeded: "Documents Needed",
    ready: (done, total) => `${done}/${total} ready`,
    confidence: "Confidence",
    verified: (date) => `Verified ${date}`,
    officialSite: "Official Site",
    downloadPack: "Download Application Pack",
    preparing: "Preparing…",
    opened: "Opened!",
    whatsCovered: "What's Covered",
    financialBenefits: "Financial Benefits",
    benefitAmount: "Benefit Amount",
    frequency: "Frequency",
    paymentMode: "Payment Mode",
    needOfflineHelp: "Need offline help?",
    offlineHelpDesc: (loc) =>
      `Visit your nearest Common Service Centre (CSC) in ${loc}. They can fill the application for you for a nominal fee (approx ₹30-50).`,
    eligibleMatch: "Eligible Match",
    docHelper:
      "Get this from a Common Service Centre (CSC) or local Gram Panchayat",
  },
};

export default en;
