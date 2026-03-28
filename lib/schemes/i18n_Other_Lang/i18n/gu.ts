// Gujarati (ગુજરાતી) translations for SchemeSetu
const gu = {
  onboarding: {
    ageLabel: "તમારી ઉંમર કેટલી છે?",
    agePlaceholder: "દા.ત. 35",
    genderLabel: "તમારું લિંગ શું છે?",
    genderOptions: [
      { value: "male", label: "પુરુષ" },
      { value: "female", label: "સ્ત્રી" },
      { value: "other", label: "અન્ય" },
    ],
    locationLabel: "તમે ક્યાં રહો છો?",
    statePlaceholder: "રાજ્ય (દા.ત. ગુજરાત)",
    districtPlaceholder: "જિલ્લો (દા.ત. અમદાવાદ)",
    villagePlaceholder: "ગામ/શહેર (દા.ત. સાણંદ)",
    employmentLabel: "તમે શું કરો છો?",
    employmentOptions: [
      { value: "farmer", label: "🌾 ખેડૂત" },
      { value: "govt", label: "🏛️ સરકારી નોકરી" },
      { value: "private", label: "💼 ખાનગી નોકરી" },
      { value: "self-employed", label: "🛒 સ્વરોજગાર" },
      { value: "unemployed", label: "🔍 બેરોજગાર" },
      { value: "student", label: "🎓 વિદ્યાર્થી" },
      { value: "other", label: "📋 અન્ય" },
    ],
    next: "આગળ",
    skip: "છોડો",
    letsGo: "ચાલો શરૂ કરીએ! 🚀",
    stepOf: (step: number, total: number) => `પગલું ${step} / ${total}`,
    skipHint: "તમે છોડી શકો છો — AI જાતે પૂછશે 🤖",
  },
  langSelect: {
    title: "SchemeSetu",
    subtitle: "સરકારી યોજનાઓ માટે AI માર્ગદર્શક",
    footer: "ગ્રામીણ ભારત માટે બનાવ્યું 🇮🇳",
  },
  chat: {
    greeting: (name: string, tod: string) => name ? `${tod}, ${name}` : `${tod}`,
    morning: "સુપ્રભાત",
    afternoon: "નમસ્કાર",
    evening: "શુભ સાંજ",
    placeholder: "આજે હું તમને કેવી રીતે મદદ કરી શકું?",
    voiceNotSupported: "આ બ્રાઉઝરમાં અવાજ સમર્થિત નથી",
    noSchemes: "કોઈ યોજના મળી નથી। ઉંમર, વ્યવસાય, આવક, સ્થાન જણાવો। 🙏",
    foundSchemes: (count: number) => `મને ${count} યોજના મળી છે જે તમારા માટે ઉપયોગી હોઈ શકે:`,
    busy: "સર્વર પર ઘણો ટ્રાફિક છે. કૃપા કરી પછી પ્રયાસ કરો. 🙏",
    loadTest: "20 ટેસ્ટ પ્રશ્નો લોડ કરો",
    scrubHint: "પ્રશ્નો બ્રાઉઝ કરવા સ્વાઇપ કરો",
    sectorPrompt: (query: string) => `મને ${query} વિશે જણાવો જેના માટે હું પાત્ર હોઈ શકું`,
    goalQuestion: "તમે હાલમાં શું શોધી રહ્યા છો?",
    goalChips: [
      { value: "financial", label: "💰 આર્થિક સહાય / રોકડ હસ્તાંતરણ" },
      { value: "subsidy", label: "🌾 સબસિડી (ખાતર / ઊર્જા)" },
      { value: "training", label: "📚 તાલીમ / કૌશલ્ય વિકાસ" },
      { value: "loan", label: "🏦 લોન / ક્રેડિટ સહાય" },
      { value: "health", label: "🏥 આરોગ્ય વીમો" },
      { value: "housing", label: "🏠 આવાસ સહાય" },
      { value: "pension", label: "👴 પેન્શન / સામાજિક કલ્યાણ" },
      { value: "everything", label: "❓ બધું બતાવો" },
    ],
    sectors: {
      agriculture: { label: "ખેતી", query: "ખેતી અને કૃષિ યોજના" },
      healthcare: { label: "આરોગ્ય", query: "આરોગ્ય અને તબીબી યોજના" },
      housing: { label: "આવાસ", query: "આવાસ અને ઘર યોજના" },
      employment: { label: "રોજગાર", query: "રોજગાર અને નોકરી યોજના" },
      pension: { label: "પેન્શન", query: "પેન્શન અને નિવૃત્તિ યોજના" },
      education: { label: "શિક્ષણ", query: "શિક્ષણ અને કૌશલ્ય યોજના" },
    },
  },
  header: { newChat: "નવી ચેટ" },
  sidebar: {
    home: "હોમ", newChat: "નવી ચેટ", settings: "સેટિંગ્સ",
    faq: "પ્રશ્ન-ઉત્તર / મદદ", contact: "સંપર્ક કરો", about: "વિશે",
    privacy: "ગોપનીયતા નીતિ", tagline: "AI યોજના સલાહકાર", footer: "ગ્રામીણ ભારત માટે બનાવ્યું 🇮🇳",
  },
  conversational: {
    questionsPrefix: "યોગ્ય યોજના શોધવા એક પ્રશ્ન:",
    readyMessage: "સરસ! હવે હું તમારા માટે બધી યોજનાઓ તપાસું છું. 30–40 સેકન્ડ લાગશે… ⏳",
    preferNotToAnswer: "🔒 કહેવા નથી માંગતો",
    borderline: "તમારી માહિતી પ્રમાણે, તમે પાત્ર હોવાની શક્યતા છે — એક વધુ વિગત ખાતરી કરશે.",
    didYouMean: (label: string) => `મેં સાંભળ્યું: "${label}" — આ સાચું છે?`,
    confirmChips: [
      { value: "confirm_yes", label: "✅ હા, સાચું છે" },
      { value: "confirm_no",  label: "ફરી પસંદ કરો" },
    ],
    bridging: "ઠીક છે. એક વધુ માહિતી આપો...",
    questions: {
      owns_land: {
        text: "તમારી પાસે ખેતીની જમીન છે કે તમે બીજાની જમીન પર ખેતી કરો છો?",
        chips: [
          { value: "yes_own",       label: "✅ હા, મારી પોતાની જમીન છે" },
          { value: "yes_cultivate", label: "🌾 બીજાની જમીન પર ખેતી" },
          { value: "no",            label: "❌ ના" },
        ],
      },
      land_size: {
        text: "તમારી પાસે કેટલા એકર જમીન છે?",
        chips: [
          { value: "lt1",  label: "1 એકરથી ઓછી" },
          { value: "1to2", label: "1 – 2 એકર" },
          { value: "2to5", label: "2 – 5 એકર" },
          { value: "gt5",  label: "5 એકરથી વધુ" },
        ],
      },
      is_taxpayer: {
        text: "તમે કે પરિવારનો કોઈ સભ્ય આવકવેરો ભરે છે?",
        chips: [
          { value: "no",       label: "ના" },
          { value: "yes",      label: "હા" },
          { value: "not_sure", label: "ખબર નથી" },
        ],
      },
      bank_aadhaar: {
        text: "તમારું બેંક ખાતું આધાર સાથે જોડાયેલું છે?",
        chips: [
          { value: "yes",      label: "✅ હા, જોડાયેલું છે" },
          { value: "no",       label: "હજુ જોડાયેલું નથી" },
          { value: "not_sure", label: "ખબર નથી" },
        ],
      },
      family_income: {
        text: "તમારા પરિવારની વાર્ષિક આવક આશરે કેટલી છે?",
        chips: [
          { value: "lt1L",  label: "₹1 લાખથી ઓછી" },
          { value: "1to2L", label: "₹1 – ₹2 લાખ" },
          { value: "2to5L", label: "₹2 – ₹5 લાખ" },
          { value: "gt5L",  label: "₹5 લાખથી વધુ" },
        ],
        sensitive: true,
        sensitiveNote: "વૈકલ્પિક — આવક-આધારિત યોજનાઓ શોધવામાં મદદ કરે છે",
      },
      has_ration: {
        text: "તમારી પાસે રેશન કાર્ડ છે?",
        chips: [
          { value: "bpl", label: "✅ હા — BPL કાર્ડ" },
          { value: "apl", label: "APL કાર્ડ" },
          { value: "no",  label: "રેશન કાર્ડ નથી" },
        ],
      },
      owns_pucca: {
        text: "તમારી પાસે હાલમાં પાક્કું ઘર છે?",
        chips: [
          { value: "yes",     label: "હા, પાક્કું ઘર છે" },
          { value: "partial", label: "કાચું / તૂટેલું ઘર" },
          { value: "no",      label: "ઘર નથી" },
        ],
      },
      has_job_card: {
        text: "તમારી પાસે MGNREGA જોબ કાર્ડ છે?",
        chips: [
          { value: "yes",      label: "હા" },
          { value: "no",       label: "ના, પણ જોઈએ છે" },
          { value: "not_sure", label: "ખબર નથી એ શું છે" },
        ],
      },
      has_bank_acct: {
        text: "તમારું બેંકમાં બચત ખાતું છે?",
        chips: [
          { value: "yes",        label: "✅ હા" },
          { value: "post_office", label: "પોસ્ટ ઓફિસ ખાતું" },
          { value: "no",          label: "ખાતું નથી" },
        ],
      },
    },
  },
};

export default gu;
