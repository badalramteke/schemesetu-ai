import type { Translations } from "../types";

const bn: Translations = {
  onboarding: {
    ageLabel: "আপনার বয়স কত?",
    agePlaceholder: "যেমন ৩৫",
    genderLabel: "আপনার লিঙ্গ কী?",
    genderOptions: [
      { value: "male", label: "পুরুষ" },
      { value: "female", label: "মহিলা" },
      { value: "other", label: "অন্যান্য" },
    ],
    locationLabel: "আপনি কোথায় থাকেন?",
    statePlaceholder: "রাজ্য (যেমন পশ্চিমবঙ্গ)",
    districtPlaceholder: "জেলা (যেমন কলকাতা)",
    villagePlaceholder: "গ্রাম/শহর (যেমন বারাসাত)",
    employmentLabel: "আপনি কী করেন?",
    employmentOptions: [
      { value: "farmer", label: "🌾 কৃষক" },
      { value: "govt", label: "🏛️ সরকারি চাকরি" },
      { value: "private", label: "💼 বেসরকারি চাকরি" },
      { value: "self-employed", label: "🛒 স্বনিযুক্ত" },
      { value: "unemployed", label: "🔍 বেকার" },
      { value: "student", label: "🎓 ছাত্র" },
      { value: "other", label: "📋 অন্যান্য" },
    ],
    next: "পরবর্তী",
    skip: "এড়িয়ে যান",
    letsGo: "চলুন শুরু করি! 🚀",
    stepOf: (step, total) => `ধাপ ${step} / ${total}`,
    skipHint: "আপনি এড়িয়ে যেতে পারেন — AI নিজে জিজ্ঞেস করবে 🤖",
  },
  langSelect: {
    title: "SchemeSetu",
    subtitle: "সরকারি প্রকল্পের জন্য AI গাইড",
    footer: "গ্রামীণ ভারতের জন্য তৈরি 🇮🇳",
  },
  chat: {
    greeting: (name, tod) => (name ? `${tod}, ${name}` : `${tod}`),
    morning: "সুপ্রভাত",
    afternoon: "নমস্কার",
    evening: "শুভ সন্ধ্যা",
    placeholder: "আজ আমি কীভাবে সাহায্য করতে পারি?",
    voiceNotSupported: "এই ব্রাউজারে ভয়েস সমর্থিত নয়",
    noSchemes:
      "কোনো প্রকল্প পাওয়া যায়নি। আপনার বয়স, পেশা, আয়, অবস্থান জানান। 🙏",
    foundSchemes: (count) =>
      `আমি ${count}টি প্রকল্প পেয়েছি যা আপনার কাজে লাগতে পারে:`,
    busy: "সার্ভারে অনেক ট্রাফিক। পরে চেষ্টা করুন। 🙏",
    loadTest: "২০টি টেস্ট প্রশ্ন লোড করুন",
    scrubHint: "প্রশ্ন ব্রাউজ করতে সোয়াইপ করুন",
    sectorPrompt: (query) =>
      `আমাকে ${query} সম্পর্কে বলুন যার জন্য আমি যোগ্য হতে পারি`,
    goalQuestion: "আপনি এখন কী খুঁজছেন?",
    goalChips: [
      { value: "financial", label: "💰 আর্থিক সহায়তা / নগদ হস্তান্তর" },
      { value: "subsidy", label: "🌾 ভর্তুকি (সার / শক্তি)" },
      { value: "training", label: "📚 প্রশিক্ষণ / দক্ষতা উন্নয়ন" },
      { value: "loan", label: "🏦 ঋণ / ক্রেডিট সহায়তা" },
      { value: "health", label: "🏥 স্বাস্থ্য বীমা" },
      { value: "housing", label: "🏠 আবাসন সহায়তা" },
      { value: "pension", label: "👴 পেনশন / সমাজকল্যাণ" },
      { value: "everything", label: "❓ সব দেখান" },
    ],
    wizardIntro:
      "কিছু প্রশ্নের উত্তর দিন যাতে আমি আপনার যোগ্যতা পরীক্ষা করতে পারি:",
    sectors: {
      agriculture: { label: "কৃষি", query: "কৃষি ও চাষের প্রকল্প" },
      healthcare: { label: "স্বাস্থ্য", query: "স্বাস্থ্য ও চিকিৎসা প্রকল্প" },
      housing: { label: "আবাসন", query: "আবাসন ও বাসস্থান প্রকল্প" },
      employment: {
        label: "কর্মসংস্থান",
        query: "কর্মসংস্থান ও চাকরি প্রকল্প",
      },
      pension: { label: "পেনশন", query: "পেনশন ও অবসর প্রকল্প" },
      education: { label: "শিক্ষা", query: "শিক্ষা ও দক্ষতা প্রকল্প" },
    },
  },
  header: { newChat: "নতুন চ্যাট" },
  sidebar: {
    home: "হোম",
    newChat: "নতুন চ্যাট",
    settings: "সেটিংস",
    faq: "প্রশ্ন-উত্তর / সাহায্য",
    contact: "যোগাযোগ",
    about: "সম্পর্কে",
    privacy: "গোপনীয়তা নীতি",
    tagline: "AI প্রকল্প উপদেষ্টা",
    footer: "গ্রামীণ ভারতের জন্য তৈরি 🇮🇳",
  },
  homeDashboard: {
    greeting: (name) => (name ? `নমস্কার, ${name}! 🙏` : "নমস্কার! 🙏"),
    subtitle: "আপনি কোন প্রকল্প খুঁজছেন?",
    searchPlaceholder: "প্রকল্প খুঁজুন...",
    askMe: "আমাকে জিজ্ঞেস করুন!!",
  },
  conversational: {
    questionsPrefix: "সঠিক প্রকল্প খুঁজতে একটি প্রশ্ন:",
    readyMessage:
      "দারুন! এখন আমি আপনার জন্য সব প্রকল্প যাচাই করছি। ৩০-৪০ সেকেন্ড লাগবে… ⏳",
    preferNotToAnswer: "🔒 বলতে চাই না",
    borderline:
      "আপনার তথ্য অনুসারে, আপনি সম্ভবত যোগ্য — আরেকটি তথ্য নিশ্চিত করবে।",
    didYouMean: (label: string) => `আমি শুনেছি: "${label}" — এটা কি ঠিক?`,
    confirmChips: [
      { value: "confirm_yes", label: "✅ হ্যাঁ, ঠিক আছে" },
      { value: "confirm_no", label: "আবার বেছে নিন" },
    ],
    bridging: "ঠিক আছে। আরেকটু তথ্য দিন...",
    questions: {
      owns_land: {
        text: "আপনার কি কৃষি জমি আছে বা অন্যের জমিতে চাষ করেন?",
        chips: [
          { value: "yes_own", label: "✅ হ্যাঁ, নিজের জমি আছে" },
          { value: "yes_cultivate", label: "🌾 অন্যের জমিতে চাষ" },
          { value: "no", label: "❌ না" },
        ],
      },
      land_size: {
        text: "আপনার কত একর জমি আছে?",
        chips: [
          { value: "lt1", label: "১ একরের কম" },
          { value: "1to2", label: "১ – ২ একর" },
          { value: "2to5", label: "২ – ৫ একর" },
          { value: "gt5", label: "৫ একরের বেশি" },
        ],
      },
      is_taxpayer: {
        text: "আপনি বা পরিবারের কেউ কি আয়কর দেন?",
        chips: [
          { value: "no", label: "না" },
          { value: "yes", label: "হ্যাঁ" },
          { value: "not_sure", label: "জানি না" },
        ],
      },
      bank_aadhaar: {
        text: "আপনার ব্যাংক অ্যাকাউন্ট কি আধারের সাথে যুক্ত?",
        chips: [
          { value: "yes", label: "✅ হ্যাঁ, যুক্ত" },
          { value: "no", label: "এখনও যুক্ত নয়" },
          { value: "not_sure", label: "জানি না" },
        ],
      },
      family_income: {
        text: "আপনার পরিবারের বার্ষিক আয় কত?",
        chips: [
          { value: "lt1L", label: "₹১ লক্ষের কম" },
          { value: "1to2L", label: "₹১ – ₹২ লক্ষ" },
          { value: "2to5L", label: "₹২ – ₹৫ লক্ষ" },
          { value: "gt5L", label: "₹৫ লক্ষের বেশি" },
        ],
        sensitive: true,
        sensitiveNote: "ঐচ্ছিক — আয়-ভিত্তিক প্রকল্প খুঁজতে সাহায্য করে",
      },
      has_ration: {
        text: "আপনার কি রেশন কার্ড আছে?",
        chips: [
          { value: "bpl", label: "✅ হ্যাঁ — BPL কার্ড" },
          { value: "apl", label: "APL কার্ড" },
          { value: "no", label: "রেশন কার্ড নেই" },
        ],
      },
      owns_pucca: {
        text: "আপনার কি পাকা বাড়ি আছে?",
        chips: [
          { value: "yes", label: "হ্যাঁ, পাকা বাড়ি আছে" },
          { value: "partial", label: "কাঁচা / ভাঙা বাড়ি" },
          { value: "no", label: "বাড়ি নেই" },
        ],
      },
      has_job_card: {
        text: "আপনার কি MGNREGA জব কার্ড আছে?",
        chips: [
          { value: "yes", label: "হ্যাঁ" },
          { value: "no", label: "না, তবে চাই" },
          { value: "not_sure", label: "জানি না এটা কী" },
        ],
      },
      has_bank_acct: {
        text: "আপনার কি ব্যাংকে সঞ্চয় অ্যাকাউন্ট আছে?",
        chips: [
          { value: "yes", label: "✅ হ্যাঁ" },
          { value: "post_office", label: "পোস্ট অফিস অ্যাকাউন্ট" },
          { value: "no", label: "অ্যাকাউন্ট নেই" },
        ],
      },
    },
  },
  csc: {
    nearestCentre: "নিকটতম CSC কেন্দ্র",
    commonServiceCentresIn: (loc) => `${loc}-এ কমন সার্ভিস সেন্টার`,
    find: "খুঁজুন",
    findNearest: "নিকটতম CSC খুঁজুন",
    locating: "খোঁজা হচ্ছে...",
    nearestFound: "নিকটতম CSC পাওয়া গেছে!",
    openInMaps: "ম্যাপে খুলুন",
    bookAppointment: "অ্যাপয়েন্টমেন্ট বুক করুন",
    bookingConfirmed: "বুকিং নিশ্চিত!",
    bookingConfirmedDesc:
      "WhatsApp-এ নিশ্চিতকরণ পাঠানো হয়েছে। CSC শীঘ্রই যোগাযোগ করবে।",
    yourDetails: "বুকিংয়ের জন্য আপনার বিবরণ",
    fullName: "পুরো নাম",
    phoneNumber: "ফোন নম্বর",
    schemeInterest: "প্রকল্প আগ্রহ (ঐচ্ছিক)",
    confirmBooking: "বুকিং নিশ্চিত করুন",
    sending: "পাঠানো হচ্ছে...",
    cancel: "বাতিল",
    showMore: "আরও কেন্দ্র দেখান",
    showLess: "কম দেখান",
    officialLocator: "CSC অফিসিয়াল লোকেটর",
    helpline: "CSC হেল্পলাইন (টোল-ফ্রি)",
    findCscCentre: "নিকটতম CSC কেন্দ্র খুঁজুন",
    hide: "লুকান",
  },
  schemeCard: {
    nextSteps: "পরবর্তী পদক্ষেপ",
    documentsNeeded: "প্রয়োজনীয় নথিপত্র",
    ready: (done, total) => `${done}/${total} প্রস্তুত`,
    confidence: "আত্মবিশ্বাস",
    verified: (date) => `${date} তারিখে যাচাইকৃত`,
    officialSite: "অফিসিয়াল সাইট",
    downloadPack: "আবেদন প্যাক ডাউনলোড করুন",
    preparing: "প্রস্তুত হচ্ছে…",
    opened: "খোলা হয়েছে!",
    whatsCovered: "কী অন্তর্ভুক্ত",
    financialBenefits: "আর্থিক সুবিধা",
    benefitAmount: "সুবিধার পরিমাণ",
    frequency: "ফ্রিকোয়েন্সি",
    paymentMode: "পেমেন্ট মোড",
    needOfflineHelp: "অফলাইন সাহায্য দরকার?",
    offlineHelpDesc: (loc) =>
      `${loc}-এ নিকটতম CSC কেন্দ্রে যান। তারা সামান্য ফি-তে (প্রায় ₹30-50) আপনার আবেদন পূরণ করতে পারবে।`,
    eligibleMatch: "যোগ্য মিল",
    docHelper: "এটি CSC কেন্দ্র বা স্থানীয় গ্রাম পঞ্চায়েত থেকে পান",
  },
};

export default bn;
