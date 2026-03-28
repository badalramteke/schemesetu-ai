// Kannada (ಕನ್ನಡ) translations for SchemeSetu
const kn = {
  onboarding: {
    ageLabel: "ನಿಮ್ಮ ವಯಸ್ಸು ಎಷ್ಟು?",
    agePlaceholder: "ಉದಾ. 35",
    genderLabel: "ನಿಮ್ಮ ಲಿಂಗ ಯಾವುದು?",
    genderOptions: [
      { value: "male", label: "ಪುರುಷ" },
      { value: "female", label: "ಮಹಿಳೆ" },
      { value: "other", label: "ಇತರೆ" },
    ],
    locationLabel: "ನೀವು ಎಲ್ಲಿ ವಾಸಿಸುತ್ತೀರಿ?",
    statePlaceholder: "ರಾಜ್ಯ (ಉದಾ. ಕರ್ನಾಟಕ)",
    districtPlaceholder: "ಜಿಲ್ಲೆ (ಉದಾ. ಬೆಂಗಳೂರು)",
    villagePlaceholder: "ಹಳ್ಳಿ/ನಗರ (ಉದಾ. ಮಂಡ್ಯ)",
    employmentLabel: "ನೀವು ಏನು ಮಾಡುತ್ತೀರಿ?",
    employmentOptions: [
      { value: "farmer", label: "🌾 ರೈತ" },
      { value: "govt", label: "🏛️ ಸರ್ಕಾರಿ ಕೆಲಸ" },
      { value: "private", label: "💼 ಖಾಸಗಿ ಕೆಲಸ" },
      { value: "self-employed", label: "🛒 ಸ್ವಯಂ ಉದ್ಯೋಗ" },
      { value: "unemployed", label: "🔍 ನಿರುದ್ಯೋಗಿ" },
      { value: "student", label: "🎓 ವಿದ್ಯಾರ್ಥಿ" },
      { value: "other", label: "📋 ಇತರೆ" },
    ],
    next: "ಮುಂದೆ",
    skip: "ಬಿಡಿ",
    letsGo: "ಪ್ರಾರಂಭಿಸೋಣ! 🚀",
    stepOf: (step: number, total: number) => `ಹಂತ ${step} / ${total}`,
    skipHint: "ನೀವು ಬಿಡಬಹುದು — AI ಸ್ವತಃ ಕೇಳುತ್ತದೆ 🤖",
  },
  langSelect: {
    title: "SchemeSetu",
    subtitle: "ಸರ್ಕಾರಿ ಯೋಜನೆಗಳಿಗಾಗಿ AI ಮಾರ್ಗದರ್ಶಿ",
    footer: "ಗ್ರಾಮೀಣ ಭಾರತಕ್ಕಾಗಿ ನಿರ್ಮಿಸಲಾಗಿದೆ 🇮🇳",
  },
  chat: {
    greeting: (name: string, tod: string) => name ? `${tod}, ${name}` : `${tod}`,
    morning: "ಶುಭೋದಯ",
    afternoon: "ನಮಸ್ಕಾರ",
    evening: "ಶುಭ ಸಂಜೆ",
    placeholder: "ಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?",
    voiceNotSupported: "ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಬೆಂಬಲಿತವಲ್ಲ",
    noSchemes: "ಯಾವುದೇ ಯೋಜನೆ ಸಿಗಲಿಲ್ಲ. ವಯಸ್ಸು, ವೃತ್ತಿ, ಆದಾಯ, ಸ್ಥಳ ತಿಳಿಸಿ. 🙏",
    foundSchemes: (count: number) => `ನಿಮಗೆ ಉಪಯುಕ್ತವಾಗಬಹುದಾದ ${count} ಯೋಜನೆಗಳು ಸಿಕ್ಕಿವೆ:`,
    busy: "ಸರ್ವರ್‌ನಲ್ಲಿ ಹೆಚ್ಚು ಟ್ರಾಫಿಕ್ ಇದೆ. ದಯವಿಟ್ಟು ನಂತರ ಪ್ರಯತ್ನಿಸಿ. 🙏",
    loadTest: "20 ಟೆಸ್ಟ್ ಪ್ರಶ್ನೆಗಳನ್ನು ಲೋಡ್ ಮಾಡಿ",
    scrubHint: "ಪ್ರಶ್ನೆಗಳನ್ನು ಬ್ರೌಸ್ ಮಾಡಲು ಸ್ವೈಪ್ ಮಾಡಿ",
    sectorPrompt: (query: string) => `ನಾನು ಅರ್ಹನಾಗಬಹುದಾದ ${query} ಬಗ್ಗೆ ಹೇಳಿ`,
    goalQuestion: "ನೀವು ಈಗ ಏನನ್ನು ಹುಡುಕುತ್ತಿದ್ದೀರಿ?",
    goalChips: [
      { value: "financial", label: "💰 ಆರ್ಥಿಕ ಸಹಾಯ / ನಗದು ವರ್ಗಾವಣೆ" },
      { value: "subsidy", label: "🌾 ಸಬ್ಸಿಡಿ (ರಸಗೊಬ್ಬರ / ಶಕ್ತಿ)" },
      { value: "training", label: "📚 ತರಬೇತಿ / ಕೌಶಲ್ಯ ಅಭಿವೃದ್ಧಿ" },
      { value: "loan", label: "🏦 ಸಾಲ / ಕ್ರೆಡಿಟ್ ಸಹಾಯ" },
      { value: "health", label: "🏥 ಆರೋಗ್ಯ ವಿಮೆ" },
      { value: "housing", label: "🏠 ವಸತಿ ಸಹಾಯ" },
      { value: "pension", label: "👴 ಪಿಂಚಣಿ / ಸಾಮಾಜಿಕ ಕಲ್ಯಾಣ" },
      { value: "everything", label: "❓ ಎಲ್ಲವನ್ನೂ ತೋರಿಸಿ" },
    ],
    sectors: {
      agriculture: { label: "ಕೃಷಿ", query: "ಕೃಷಿ ಮತ್ತು ಕೃಷಿ ಯೋಜನೆಗಳು" },
      healthcare: { label: "ಆರೋಗ್ಯ", query: "ಆರೋಗ್ಯ ಮತ್ತು ವೈದ್ಯಕೀಯ ಯೋಜನೆಗಳು" },
      housing: { label: "ವಸತಿ", query: "ವಸತಿ ಮತ್ತು ಆಶ್ರಯ ಯೋಜನೆಗಳು" },
      employment: { label: "ಉದ್ಯೋಗ", query: "ಉದ್ಯೋಗ ಮತ್ತು ಕೆಲಸ ಯೋಜನೆಗಳು" },
      pension: { label: "ಪಿಂಚಣಿ", query: "ಪಿಂಚಣಿ ಮತ್ತು ನಿವೃತ್ತಿ ಯೋಜನೆಗಳು" },
      education: { label: "ಶಿಕ್ಷಣ", query: "ಶಿಕ್ಷಣ ಮತ್ತು ಕೌಶಲ್ಯ ಯೋಜನೆಗಳು" },
    },
  },
  header: { newChat: "ಹೊಸ ಚಾಟ್" },
  sidebar: {
    home: "ಹೋಮ್", newChat: "ಹೊಸ ಚಾಟ್", settings: "ಸೆಟ್ಟಿಂಗ್ಸ್",
    faq: "ಪ್ರಶ್ನೋತ್ತರ / ಸಹಾಯ", contact: "ಸಂಪರ್ಕಿಸಿ", about: "ಬಗ್ಗೆ",
    privacy: "ಗೌಪ್ಯತಾ ನೀತಿ", tagline: "AI ಯೋಜನೆ ಸಲಹೆಗಾರ", footer: "ಗ್ರಾಮೀಣ ಭಾರತಕ್ಕಾಗಿ ನಿರ್ಮಿಸಲಾಗಿದೆ 🇮🇳",
  },
  conversational: {
    questionsPrefix: "ಸರಿಯಾದ ಯೋಜನೆ ಹುಡುಕಲು ಒಂದು ಪ್ರಶ್ನೆ:",
    readyMessage: "ಅದ್ಭುತ! ಈಗ ನಾನು ನಿಮಗಾಗಿ ಎಲ್ಲಾ ಯೋಜನೆಗಳನ್ನು ಪರಿಶೀಲಿಸುತ್ತೇನೆ. 30–40 ಸೆಕೆಂಡ್ ಬೇಕಾಗುತ್ತದೆ… ⏳",
    preferNotToAnswer: "🔒 ಹೇಳಲು ಇಷ್ಟವಿಲ್ಲ",
    borderline: "ನೀವು ನೀಡಿದ ಮಾಹಿತಿ ಪ್ರಕಾರ, ನೀವು ಅರ್ಹರಾಗುವ ಸಾಧ್ಯತೆ ಇದೆ — ಇನ್ನೊಂದು ವಿವರ ಖಚಿತಪಡಿಸುತ್ತದೆ.",
    didYouMean: (label: string) => `ನಾನು ಕೇಳಿದ್ದು: "${label}" — ಇದು ಸರಿಯೇ?`,
    confirmChips: [
      { value: "confirm_yes", label: "✅ ಹೌದು, ಸರಿ" },
      { value: "confirm_no",  label: "ಮತ್ತೆ ಆಯ್ಕೆ ಮಾಡಿ" },
    ],
    bridging: "ಸರಿ. ಇನ್ನೊಂದು ಮಾಹಿತಿ ನೀಡಿ...",
    questions: {
      owns_land: {
        text: "ನಿಮ್ಮ ಬಳಿ ಕೃಷಿ ಭೂಮಿ ಇದೆಯೇ ಅಥವಾ ಬೇರೆಯವರ ಭೂಮಿಯಲ್ಲಿ ಕೃಷಿ ಮಾಡುತ್ತೀರಾ?",
        chips: [
          { value: "yes_own",       label: "✅ ಹೌದು, ನನ್ನ ಸ್ವಂತ ಭೂಮಿ ಇದೆ" },
          { value: "yes_cultivate", label: "🌾 ಬೇರೆಯವರ ಭೂಮಿಯಲ್ಲಿ ಕೃಷಿ" },
          { value: "no",            label: "❌ ಇಲ್ಲ" },
        ],
      },
      land_size: {
        text: "ನಿಮ್ಮ ಬಳಿ ಎಷ್ಟು ಎಕರೆ ಭೂಮಿ ಇದೆ?",
        chips: [
          { value: "lt1",  label: "1 ಎಕರೆಗಿಂತ ಕಡಿಮೆ" },
          { value: "1to2", label: "1 – 2 ಎಕರೆ" },
          { value: "2to5", label: "2 – 5 ಎಕರೆ" },
          { value: "gt5",  label: "5 ಎಕರೆಗಿಂತ ಹೆಚ್ಚು" },
        ],
      },
      is_taxpayer: {
        text: "ನೀವು ಅಥವಾ ಕುಟುಂಬದ ಯಾರಾದರೂ ಆದಾಯ ತೆರಿಗೆ ಕಟ್ಟುತ್ತೀರಾ?",
        chips: [
          { value: "no",       label: "ಇಲ್ಲ" },
          { value: "yes",      label: "ಹೌದು" },
          { value: "not_sure", label: "ಗೊತ್ತಿಲ್ಲ" },
        ],
      },
      bank_aadhaar: {
        text: "ನಿಮ್ಮ ಬ್ಯಾಂಕ್ ಖಾತೆ ಆಧಾರ್‌ಗೆ ಲಿಂಕ್ ಆಗಿದೆಯೇ?",
        chips: [
          { value: "yes",      label: "✅ ಹೌದು, ಲಿಂಕ್ ಆಗಿದೆ" },
          { value: "no",       label: "ಇನ್ನೂ ಲಿಂಕ್ ಆಗಿಲ್ಲ" },
          { value: "not_sure", label: "ಗೊತ್ತಿಲ್ಲ" },
        ],
      },
      family_income: {
        text: "ನಿಮ್ಮ ಕುಟುಂಬದ ವಾರ್ಷಿಕ ಆದಾಯ ಸುಮಾರು ಎಷ್ಟು?",
        chips: [
          { value: "lt1L",  label: "₹1 ಲಕ್ಷಕ್ಕಿಂತ ಕಡಿಮೆ" },
          { value: "1to2L", label: "₹1 – ₹2 ಲಕ್ಷ" },
          { value: "2to5L", label: "₹2 – ₹5 ಲಕ್ಷ" },
          { value: "gt5L",  label: "₹5 ಲಕ್ಷಕ್ಕಿಂತ ಹೆಚ್ಚು" },
        ],
        sensitive: true,
        sensitiveNote: "ಐಚ್ಛಿಕ — ಆದಾಯ ಆಧಾರಿತ ಯೋಜನೆಗಳನ್ನು ಹುಡುಕಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ",
      },
      has_ration: {
        text: "ನಿಮ್ಮ ಬಳಿ ರೇಷನ್ ಕಾರ್ಡ್ ಇದೆಯೇ?",
        chips: [
          { value: "bpl", label: "✅ ಹೌದು — BPL ಕಾರ್ಡ್" },
          { value: "apl", label: "APL ಕಾರ್ಡ್" },
          { value: "no",  label: "ರೇಷನ್ ಕಾರ್ಡ್ ಇಲ್ಲ" },
        ],
      },
      owns_pucca: {
        text: "ನಿಮ್ಮ ಬಳಿ ಈಗ ಪಕ್ಕಾ ಮನೆ ಇದೆಯೇ?",
        chips: [
          { value: "yes",     label: "ಹೌದು, ಪಕ್ಕಾ ಮನೆ ಇದೆ" },
          { value: "partial", label: "ಕಚ್ಚಾ / ಹಾಳಾದ ಮನೆ" },
          { value: "no",      label: "ಮನೆ ಇಲ್ಲ" },
        ],
      },
      has_job_card: {
        text: "ನಿಮ್ಮ ಬಳಿ MGNREGA ಜಾಬ್ ಕಾರ್ಡ್ ಇದೆಯೇ?",
        chips: [
          { value: "yes",      label: "ಹೌದು" },
          { value: "no",       label: "ಇಲ್ಲ, ಆದರೆ ಬೇಕು" },
          { value: "not_sure", label: "ಅದೇನು ಗೊತ್ತಿಲ್ಲ" },
        ],
      },
      has_bank_acct: {
        text: "ನಿಮ್ಮ ಬ್ಯಾಂಕ್‌ನಲ್ಲಿ ಉಳಿತಾಯ ಖಾತೆ ಇದೆಯೇ?",
        chips: [
          { value: "yes",        label: "✅ ಹೌದು" },
          { value: "post_office", label: "ಅಂಚೆ ಕಚೇರಿ ಖಾತೆ" },
          { value: "no",          label: "ಖಾತೆ ಇಲ್ಲ" },
        ],
      },
    },
  },
};

export default kn;
