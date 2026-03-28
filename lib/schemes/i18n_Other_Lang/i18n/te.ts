// Telugu (తెలుగు) translations for SchemeSetu
const te = {
  onboarding: {
    ageLabel: "మీ వయస్సు ఎంత?",
    agePlaceholder: "ఉదా. 35",
    genderLabel: "మీ లింగం ఏమిటి?",
    genderOptions: [
      { value: "male", label: "పురుషుడు" },
      { value: "female", label: "స్త్రీ" },
      { value: "other", label: "ఇతర" },
    ],
    locationLabel: "మీరు ఎక్కడ నివసిస్తున్నారు?",
    statePlaceholder: "రాష్ట్రం (ఉదా. తెలంగాణ)",
    districtPlaceholder: "జిల్లా (ఉదా. హైదరాబాద్)",
    villagePlaceholder: "గ్రామం/నగరం (ఉదా. వరంగల్)",
    employmentLabel: "మీరు ఏమి చేస్తారు?",
    employmentOptions: [
      { value: "farmer", label: "🌾 రైతు" },
      { value: "govt", label: "🏛️ ప్రభుత్వ ఉద్యోగం" },
      { value: "private", label: "💼 ప్రైవేట్ ఉద్యోగం" },
      { value: "self-employed", label: "🛒 స్వయం ఉపాధి" },
      { value: "unemployed", label: "🔍 నిరుద్యోగి" },
      { value: "student", label: "🎓 విద్యార్థి" },
      { value: "other", label: "📋 ఇతర" },
    ],
    next: "తదుపరి",
    skip: "దాటవేయి",
    letsGo: "ప్రారంభిద్దాం! 🚀",
    stepOf: (step: number, total: number) => `దశ ${step} / ${total}`,
    skipHint: "మీరు దాటవేయవచ్చు — AI స్వయంగా అడుగుతుంది 🤖",
  },
  langSelect: {
    title: "SchemeSetu",
    subtitle: "ప్రభుత్వ పథకాల కోసం AI గైడ్",
    footer: "గ్రామీణ భారతదేశం కోసం నిర్మించబడింది 🇮🇳",
  },
  chat: {
    greeting: (name: string, tod: string) => name ? `${tod}, ${name}` : `${tod}`,
    morning: "శుభోదయం",
    afternoon: "నమస్కారం",
    evening: "శుభ సాయంత్రం",
    placeholder: "ఈరోజు నేను మీకు ఎలా సహాయం చేయగలను?",
    voiceNotSupported: "ఈ బ్రౌజర్‌లో వాయిస్ సపోర్ట్ లేదు",
    noSchemes: "ఏ పథకం కనుగొనబడలేదు. వయస్సు, వృత్తి, ఆదాయం, ప్రాంతం తెలపండి. 🙏",
    foundSchemes: (count: number) => `మీకు ఉపయోగపడే ${count} పథకాలు కనుగొనబడ్డాయి:`,
    busy: "సర్వర్‌పై అధిక ట్రాఫిక్ ఉంది. దయచేసి తర్వాత ప్రయత్నించండి. 🙏",
    loadTest: "20 టెస్ట్ ప్రశ్నలు లోడ్ చేయండి",
    scrubHint: "ప్రశ్నలు బ్రౌజ్ చేయడానికి స్వైప్ చేయండి",
    sectorPrompt: (query: string) => `నేను అర్హత పొందగల ${query} గురించి చెప్పండి`,
    goalQuestion: "మీరు ప్రస్తుతం ఏమి వెతుకుతున్నారు?",
    goalChips: [
      { value: "financial", label: "💰 ఆర్థిక సహాయం / నగదు బదిలీ" },
      { value: "subsidy", label: "🌾 సబ్సిడీ (ఎరువు / శక్తి)" },
      { value: "training", label: "📚 శిక్షణ / నైపుణ్య అభివృద్ధి" },
      { value: "loan", label: "🏦 రుణం / క్రెడిట్ సహాయం" },
      { value: "health", label: "🏥 ఆరోగ్య బీమా" },
      { value: "housing", label: "🏠 గృహ సహాయం" },
      { value: "pension", label: "👴 పెన్షన్ / సామాజిక సంక్షేమం" },
      { value: "everything", label: "❓ అన్నీ చూపించు" },
    ],
    sectors: {
      agriculture: { label: "వ్యవసాయం", query: "వ్యవసాయ పథకాలు" },
      healthcare: { label: "ఆరోగ్యం", query: "ఆరోగ్య మరియు వైద్య పథకాలు" },
      housing: { label: "గృహనిర్మాణం", query: "గృహ మరియు ఆశ్రయ పథకాలు" },
      employment: { label: "ఉపాధి", query: "ఉపాధి మరియు ఉద్యోగ పథకాలు" },
      pension: { label: "పెన్షన్", query: "పెన్షన్ మరియు పదవీ విరమణ పథకాలు" },
      education: { label: "విద్య", query: "విద్య మరియు నైపుణ్య పథకాలు" },
    },
  },
  header: { newChat: "కొత్త చాట్" },
  sidebar: {
    home: "హోమ్", newChat: "కొత్త చాట్", settings: "సెట్టింగ్స్",
    faq: "ప్రశ్నోత్తరాలు / సహాయం", contact: "సంప్రదించండి", about: "గురించి",
    privacy: "గోప్యతా విధానం", tagline: "AI పథక సలహాదారు", footer: "గ్రామీణ భారతదేశం కోసం నిర్మించబడింది 🇮🇳",
  },
  conversational: {
    questionsPrefix: "సరైన పథకం కనుగొనడానికి ఒక ప్రశ్న:",
    readyMessage: "అద్భుతం! ఇప్పుడు నేను మీ కోసం అన్ని పథకాలను తనిఖీ చేస్తున్నాను. 30–40 సెకన్లు పడుతుంది… ⏳",
    preferNotToAnswer: "🔒 చెప్పడం ఇష్టం లేదు",
    borderline: "మీ సమాచారం ప్రకారం, మీరు అర్హత పొందే అవకాశం ఉంది — మరో వివరం నిర్ధారిస్తుంది.",
    didYouMean: (label: string) => `నేను విన్నది: "${label}" — ఇది సరైనదేనా?`,
    confirmChips: [
      { value: "confirm_yes", label: "✅ అవును, సరైనది" },
      { value: "confirm_no",  label: "మళ్ళీ ఎంచుకోండి" },
    ],
    bridging: "సరే. మరో వివరం చెప్పండి...",
    questions: {
      owns_land: {
        text: "మీకు వ్యవసాయ భూమి ఉందా లేదా ఇతరుల భూమిలో సాగు చేస్తున్నారా?",
        chips: [
          { value: "yes_own",       label: "✅ అవును, నా స్వంత భూమి ఉంది" },
          { value: "yes_cultivate", label: "🌾 ఇతరుల భూమిలో సాగు" },
          { value: "no",            label: "❌ లేదు" },
        ],
      },
      land_size: {
        text: "మీ వద్ద ఎన్ని ఎకరాల భూమి ఉంది?",
        chips: [
          { value: "lt1",  label: "1 ఎకరం కంటే తక్కువ" },
          { value: "1to2", label: "1 – 2 ఎకరాలు" },
          { value: "2to5", label: "2 – 5 ఎకరాలు" },
          { value: "gt5",  label: "5 ఎకరాల కంటే ఎక్కువ" },
        ],
      },
      is_taxpayer: {
        text: "మీరు లేదా కుటుంబ సభ్యులు ఆదాయపు పన్ను చెల్లిస్తారా?",
        chips: [
          { value: "no",       label: "లేదు" },
          { value: "yes",      label: "అవును" },
          { value: "not_sure", label: "తెలియదు" },
        ],
      },
      bank_aadhaar: {
        text: "మీ బ్యాంక్ ఖాతా ఆధార్‌తో లింక్ అయి ఉందా?",
        chips: [
          { value: "yes",      label: "✅ అవును, లింక్ అయింది" },
          { value: "no",       label: "ఇంకా లింక్ కాలేదు" },
          { value: "not_sure", label: "తెలియదు" },
        ],
      },
      family_income: {
        text: "మీ కుటుంబ వార్షిక ఆదాయం సుమారు ఎంత?",
        chips: [
          { value: "lt1L",  label: "₹1 లక్ష కంటే తక్కువ" },
          { value: "1to2L", label: "₹1 – ₹2 లక్షలు" },
          { value: "2to5L", label: "₹2 – ₹5 లక్షలు" },
          { value: "gt5L",  label: "₹5 లక్షల కంటే ఎక్కువ" },
        ],
        sensitive: true,
        sensitiveNote: "ఐచ్ఛికం — ఆదాయ ఆధారిత పథకాలను కనుగొనడంలో సహాయపడుతుంది",
      },
      has_ration: {
        text: "మీ వద్ద రేషన్ కార్డ్ ఉందా?",
        chips: [
          { value: "bpl", label: "✅ అవును — BPL కార్డ్" },
          { value: "apl", label: "APL కార్డ్" },
          { value: "no",  label: "రేషన్ కార్డ్ లేదు" },
        ],
      },
      owns_pucca: {
        text: "మీ వద్ద ప్రస్తుతం పక్కా ఇల్లు ఉందా?",
        chips: [
          { value: "yes",     label: "అవును, పక్కా ఇల్లు ఉంది" },
          { value: "partial", label: "కచ్చా / పాడైన ఇల్లు" },
          { value: "no",      label: "ఇల్లు లేదు" },
        ],
      },
      has_job_card: {
        text: "మీ వద్ద MGNREGA జాబ్ కార్డ్ ఉందా?",
        chips: [
          { value: "yes",      label: "అవును" },
          { value: "no",       label: "లేదు, కానీ కావాలి" },
          { value: "not_sure", label: "అది ఏమిటో తెలియదు" },
        ],
      },
      has_bank_acct: {
        text: "మీకు బ్యాంకులో పొదుపు ఖాతా ఉందా?",
        chips: [
          { value: "yes",        label: "✅ అవును" },
          { value: "post_office", label: "పోస్ట్ ఆఫీస్ ఖాతా" },
          { value: "no",          label: "ఖాతా లేదు" },
        ],
      },
    },
  },
};

export default te;
