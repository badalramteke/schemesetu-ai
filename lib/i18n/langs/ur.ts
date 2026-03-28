import type { Translations } from "../types";

const ur: Translations = {
  onboarding: {
    ageLabel: "آپ کی عمر کتنی ہے؟",
    agePlaceholder: "مثلاً 35",
    genderLabel: "آپ کی جنس کیا ہے؟",
    genderOptions: [
      { value: "male", label: "مرد" },
      { value: "female", label: "عورت" },
      { value: "other", label: "دیگر" },
    ],
    locationLabel: "آپ کہاں رہتے ہیں؟",
    statePlaceholder: "ریاست (مثلاً اتر پردیش)",
    districtPlaceholder: "ضلع (مثلاً لکھنؤ)",
    villagePlaceholder: "گاؤں/شہر (مثلاً بارہ بنکی)",
    employmentLabel: "آپ کیا کرتے ہیں؟",
    employmentOptions: [
      { value: "farmer", label: "🌾 کسان" },
      { value: "govt", label: "🏛️ سرکاری ملازمت" },
      { value: "private", label: "💼 پرائیویٹ ملازمت" },
      { value: "self-employed", label: "🛒 خود روزگار" },
      { value: "unemployed", label: "🔍 بے روزگار" },
      { value: "student", label: "🎓 طالب علم" },
      { value: "other", label: "📋 دیگر" },
    ],
    next: "اگلا",
    skip: "چھوڑیں",
    letsGo: "!چلیں شروع کریں 🚀",
    stepOf: (step, total) => `مرحلہ ${step} / ${total}`,
    skipHint: "آپ چھوڑ سکتے ہیں — AI خود پوچھے گا 🤖",
  },
  langSelect: {
    title: "SchemeSetu",
    subtitle: "سرکاری اسکیموں کے لیے AI رہنما",
    footer: "دیہی بھارت کے لیے بنایا گیا 🇮🇳",
  },
  chat: {
    greeting: (name, tod) => (name ? `${tod}، ${name}` : `${tod}`),
    morning: "صبح بخیر",
    afternoon: "السلام علیکم",
    evening: "شب بخیر",
    placeholder: "آج میں آپ کی کیسے مدد کر سکتا ہوں؟",
    voiceNotSupported: "اس براؤزر میں آواز سپورٹ نہیں ہے",
    noSchemes: "کوئی اسکیم نہیں ملی۔ اپنی عمر، پیشہ، آمدنی، مقام بتائیں۔ 🙏",
    foundSchemes: (count) =>
      `مجھے ${count} اسکیمیں ملیں جو آپ کے لیے مفید ہو سکتی ہیں:`,
    busy: "سرور پر بہت زیادہ ٹریفک ہے۔ براہ کرم بعد میں کوشش کریں۔ 🙏",
    loadTest: "20 ٹیسٹ سوالات لوڈ کریں",
    scrubHint: "سوالات براؤز کرنے کے لیے سوائپ کریں",
    sectorPrompt: (query) =>
      `مجھے ${query} کے بارے میں بتائیں جن کے لیے میں اہل ہو سکتا ہوں`,
    goalQuestion: "آپ ابھی کیا ڈھونڈ رہے ہیں؟",
    goalChips: [
      { value: "financial", label: "💰 مالی امداد / نقد منتقلی" },
      { value: "subsidy", label: "🌾 سبسڈی (کھاد / توانائی)" },
      { value: "training", label: "📚 تربیت / مہارت کی ترقی" },
      { value: "loan", label: "🏦 قرض / کریڈٹ امداد" },
      { value: "health", label: "🏥 صحت بیمہ" },
      { value: "housing", label: "🏠 رہائش امداد" },
      { value: "pension", label: "👴 پنشن / سماجی بہبود" },
      { value: "everything", label: "❓ سب دکھائیں" },
    ],
    wizardIntro:
      "براہ کرم چند سوالات کے جوابات دیں تاکہ میں آپ کی اہلیت جانچ سکوں:",
    sectors: {
      agriculture: { label: "زراعت", query: "زراعت اور کاشتکاری اسکیمیں" },
      healthcare: { label: "صحت", query: "صحت اور طبی اسکیمیں" },
      housing: { label: "رہائش", query: "رہائش اور مکان اسکیمیں" },
      employment: { label: "روزگار", query: "روزگار اور ملازمت اسکیمیں" },
      pension: { label: "پنشن", query: "پنشن اور ریٹائرمنٹ اسکیمیں" },
      education: { label: "تعلیم", query: "تعلیم اور مہارت اسکیمیں" },
    },
  },
  header: { newChat: "نئی چیٹ" },
  sidebar: {
    home: "ہوم",
    newChat: "نئی چیٹ",
    settings: "ترتیبات",
    faq: "سوال و جواب / مدد",
    contact: "رابطہ کریں",
    about: "کے بارے میں",
    privacy: "رازداری کی پالیسی",
    tagline: "AI اسکیم مشیر",
    footer: "دیہی بھارت کے لیے بنایا گیا 🇮🇳",
  },
  homeDashboard: {
    greeting: (name) =>
      name ? `السلام علیکم، ${name}! 🙏` : "السلام علیکم! 🙏",
    subtitle: "آپ کون سی اسکیم ڈھونڈ رہے ہیں؟",
    searchPlaceholder: "اسکیمیں تلاش کریں...",
    askMe: "مجھ سے پوچھیں!!",
  },
  conversational: {
    questionsPrefix: "صحیح اسکیم تلاش کرنے کے لیے ایک سوال:",
    readyMessage:
      "بہترین! اب میں آپ کے لیے تمام اسکیمیں چیک کر رہا ہوں۔ 30-40 سیکنڈ لگیں گے… ⏳",
    preferNotToAnswer: "🔒 بتانا نہیں چاہتا",
    borderline:
      "آپ کی معلومات کے مطابق، آپ شاید اہل ہیں — ایک اور تفصیل سے تصدیق ہو جائے گی۔",
    didYouMean: (label: string) => `میں نے سنا: "${label}" — کیا یہ صحیح ہے؟`,
    confirmChips: [
      { value: "confirm_yes", label: "✅ ہاں، صحیح ہے" },
      { value: "confirm_no", label: "دوبارہ چنیں" },
    ],
    bridging: "ٹھیک ہے۔ ایک اور معلومات دیں...",
    questions: {
      owns_land: {
        text: "کیا آپ کے پاس زرعی زمین ہے یا آپ دوسروں کی زمین پر کاشتکاری کرتے ہیں؟",
        chips: [
          { value: "yes_own", label: "✅ ہاں، میری اپنی زمین ہے" },
          { value: "yes_cultivate", label: "🌾 دوسروں کی زمین پر کاشتکاری" },
          { value: "no", label: "❌ نہیں" },
        ],
      },
      land_size: {
        text: "آپ کے پاس کتنے ایکڑ زمین ہے؟",
        chips: [
          { value: "lt1", label: "1 ایکڑ سے کم" },
          { value: "1to2", label: "1 – 2 ایکڑ" },
          { value: "2to5", label: "2 – 5 ایکڑ" },
          { value: "gt5", label: "5 ایکڑ سے زیادہ" },
        ],
      },
      is_taxpayer: {
        text: "کیا آپ یا خاندان کا کوئی فرد انکم ٹیکس ادا کرتا ہے؟",
        chips: [
          { value: "no", label: "نہیں" },
          { value: "yes", label: "ہاں" },
          { value: "not_sure", label: "پتہ نہیں" },
        ],
      },
      bank_aadhaar: {
        text: "کیا آپ کا بینک اکاؤنٹ آدھار سے جڑا ہوا ہے؟",
        chips: [
          { value: "yes", label: "✅ ہاں، جڑا ہوا ہے" },
          { value: "no", label: "ابھی نہیں جڑا" },
          { value: "not_sure", label: "پتہ نہیں" },
        ],
      },
      family_income: {
        text: "آپ کے خاندان کی سالانہ آمدنی تقریباً کتنی ہے؟",
        chips: [
          { value: "lt1L", label: "₹1 لاکھ سے کم" },
          { value: "1to2L", label: "₹1 – ₹2 لاکھ" },
          { value: "2to5L", label: "₹2 – ₹5 لاکھ" },
          { value: "gt5L", label: "₹5 لاکھ سے زیادہ" },
        ],
        sensitive: true,
        sensitiveNote:
          "اختیاری — آمدنی پر مبنی اسکیمیں تلاش کرنے میں مدد کرتا ہے",
      },
      has_ration: {
        text: "کیا آپ کے پاس راشن کارڈ ہے؟",
        chips: [
          { value: "bpl", label: "✅ ہاں — BPL کارڈ" },
          { value: "apl", label: "APL کارڈ" },
          { value: "no", label: "راشن کارڈ نہیں" },
        ],
      },
      owns_pucca: {
        text: "کیا آپ کے پاس ابھی پکا مکان ہے؟",
        chips: [
          { value: "yes", label: "ہاں، پکا مکان ہے" },
          { value: "partial", label: "کچا / ٹوٹا مکان" },
          { value: "no", label: "مکان نہیں ہے" },
        ],
      },
      has_job_card: {
        text: "کیا آپ کے پاس MGNREGA جاب کارڈ ہے؟",
        chips: [
          { value: "yes", label: "ہاں" },
          { value: "no", label: "نہیں، لیکن چاہیے" },
          { value: "not_sure", label: "نہیں جانتا یہ کیا ہے" },
        ],
      },
      has_bank_acct: {
        text: "کیا آپ کا بینک میں بچت اکاؤنٹ ہے؟",
        chips: [
          { value: "yes", label: "✅ ہاں" },
          { value: "post_office", label: "پوسٹ آفس اکاؤنٹ" },
          { value: "no", label: "اکاؤنٹ نہیں ہے" },
        ],
      },
    },
  },
  csc: {
    nearestCentre: "قریبی CSC مرکز",
    commonServiceCentresIn: (loc) => `${loc} میں کامن سروس سینٹر`,
    find: "تلاش کریں",
    findNearest: "قریبی CSC تلاش کریں",
    locating: "تلاش ہو رہی ہے...",
    nearestFound: "قریبی CSC مل گیا!",
    openInMaps: "نقشے میں کھولیں",
    bookAppointment: "ملاقات بک کریں",
    bookingConfirmed: "بکنگ تصدیق!",
    bookingConfirmedDesc:
      "WhatsApp پر تصدیق بھیجی گئی ہے۔ CSC جلد رابطہ کرے گا۔",
    yourDetails: "بکنگ کے لیے آپ کی تفصیلات",
    fullName: "پورا نام",
    phoneNumber: "فون نمبر",
    schemeInterest: "اسکیم دلچسپی (اختیاری)",
    confirmBooking: "بکنگ کی تصدیق کریں",
    sending: "بھیج رہے ہیں...",
    cancel: "منسوخ کریں",
    showMore: "مزید مراکز دکھائیں",
    showLess: "کم دکھائیں",
    officialLocator: "CSC سرکاری لوکیٹر",
    helpline: "CSC ہیلپ لائن (ٹول فری)",
    findCscCentre: "قریبی CSC مرکز تلاش کریں",
    hide: "چھپائیں",
  },
  schemeCard: {
    nextSteps: "اگلے مراحل",
    documentsNeeded: "ضروری دستاویزات",
    ready: (done, total) => `${done}/${total} تیار`,
    confidence: "اعتماد",
    verified: (date) => `${date} کو تصدیق شدہ`,
    officialSite: "سرکاری سائٹ",
    downloadPack: "درخواست پیک ڈاؤنلوڈ کریں",
    preparing: "تیار ہو رہا ہے…",
    opened: "کھل گیا!",
    whatsCovered: "کیا شامل ہے",
    financialBenefits: "مالی فوائد",
    benefitAmount: "فائدے کی رقم",
    frequency: "تعدد",
    paymentMode: "ادائیگی کا طریقہ",
    needOfflineHelp: "آف لائن مدد چاہیے؟",
    offlineHelpDesc: (loc) =>
      `${loc} میں قریبی CSC مرکز پر جائیں۔ وہ معمولی فیس (تقریباً ₹30-50) میں آپ کی درخواست بھر سکتے ہیں۔`,
    eligibleMatch: "اہل مماثلت",
    docHelper: "یہ CSC مرکز یا مقامی گرام پنچایت سے حاصل کریں",
  },
};

export default ur;
