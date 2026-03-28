// ─── i18n Translations for SchemeSetu ──────────────────────────────────────

export type Language = "en" | "hi" | "mr";

interface SectorItem {
  label: string;
  query: string;
}

export interface ConvQuestion {
  text: string;
  chips: { value: string; label: string }[];
  sensitive?: boolean;
  sensitiveNote?: string;
}

interface Translations {
  // Onboarding
  onboarding: {
    ageLabel: string;
    agePlaceholder: string;
    genderLabel: string;
    genderOptions: { value: string; label: string }[];
    locationLabel: string;
    statePlaceholder: string;
    districtPlaceholder: string;
    villagePlaceholder: string;
    employmentLabel: string;
    employmentOptions: { value: string; label: string }[];
    next: string;
    skip: string;
    letsGo: string;
    stepOf: (step: number, total: number) => string;
    skipHint: string;
  };
  // Language select
  langSelect: {
    title: string;
    subtitle: string;
    footer: string;
  };
  // Chat
  chat: {
    greeting: (name: string, timeOfDay: string) => string;
    morning: string;
    afternoon: string;
    evening: string;
    placeholder: string;
    voiceNotSupported: string;
    noSchemes: string;
    foundSchemes: (count: number) => string;
    busy: string;
    loadTest: string;
    scrubHint: string;
    sectorPrompt: (query: string) => string;
    goalQuestion: string;
    goalChips: { value: string; label: string }[];
    wizardIntro: string;
    sectors: {
      agriculture: SectorItem;
      healthcare: SectorItem;
      housing: SectorItem;
      employment: SectorItem;
      pension: SectorItem;
      education: SectorItem;
    };
  };
  // Header
  header: {
    newChat: string;
  };
  // Sidebar
  sidebar: {
    home: string;
    newChat: string;
    settings: string;
    faq: string;
    contact: string;
    about: string;
    privacy: string;
    tagline: string;
    footer: string;
  };
  // Conversational interview
  conversational: {
    questionsPrefix: string;
    readyMessage: string;
    preferNotToAnswer: string;
    borderline: string;
    didYouMean: (label: string) => string;
    confirmChips: { value: string; label: string }[];
    bridging: string;
    questions: Record<string, ConvQuestion>;
  };
}

const translations: Record<Language, Translations> = {
  en: {
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
          sensitiveNote:
            "Optional — helps us find income-based schemes for you",
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
  },

  hi: {
    onboarding: {
      ageLabel: "आपकी उम्र क्या है?",
      agePlaceholder: "जैसे 35",
      genderLabel: "आपका लिंग क्या है?",
      genderOptions: [
        { value: "male", label: "पुरुष" },
        { value: "female", label: "महिला" },
        { value: "other", label: "अन्य" },
      ],
      locationLabel: "आप कहाँ रहते हैं?",
      statePlaceholder: "राज्य (जैसे महाराष्ट्र)",
      districtPlaceholder: "जिला (जैसे नागपुर)",
      villagePlaceholder: "गाँव/शहर (जैसे रामटेक)",
      employmentLabel: "आप क्या करते हैं?",
      employmentOptions: [
        { value: "farmer", label: "🌾 किसान" },
        { value: "govt", label: "🏛️ सरकारी नौकरी" },
        { value: "private", label: "💼 प्राइवेट नौकरी" },
        { value: "self-employed", label: "🛒 स्वरोजगार" },
        { value: "unemployed", label: "🔍 बेरोजगार" },
        { value: "student", label: "🎓 छात्र" },
        { value: "other", label: "📋 अन्य" },
      ],
      next: "आगे",
      skip: "छोड़ें",
      letsGo: "चलिए शुरू करें! 🚀",
      stepOf: (step, total) => `चरण ${step} / ${total}`,
      skipHint: "आप छोड़ सकते हैं — AI खुद पूछ लेगा 🤖",
    },
    langSelect: {
      title: "SchemeSetu",
      subtitle: "सरकारी योजनाओं के लिए AI गाइड",
      footer: "ग्रामीण भारत के लिए बनाया गया 🇮🇳",
    },
    chat: {
      greeting: (name, tod) => (name ? `${tod}, ${name}` : `${tod}`),
      morning: "सुप्रभात",
      afternoon: "नमस्कार",
      evening: "शुभ संध्या",
      placeholder: "आज मैं आपकी कैसे मदद कर सकता हूँ?",
      voiceNotSupported: "इस ब्राउज़र में आवाज़ समर्थित नहीं है",
      noSchemes: "कोई योजना नहीं मिली। अपनी उम्र, पेशा, आय, स्थान बताएं। 🙏",
      foundSchemes: (count) =>
        `मुझे ${count} योजना${count > 1 ? "एं" : ""} मिली जो आपके लिए उपयोगी हो सकती हैं:`,
      busy: "सर्वर पर बहुत ट्रैफिक है। कृपया बाद में कोशिश करें। 🙏",
      loadTest: "20 टेस्ट सवाल लोड करें",
      scrubHint: "सवाल ब्राउज़ करने के लिए स्वाइप करें",
      sectorPrompt: (query) =>
        `मुझे ${query} के बारे में बताएं जिनके लिए मैं पात्र हो सकता हूँ`,
      goalQuestion: "आप अभी क्या ढूंढ रहे हैं?",
      goalChips: [
        { value: "financial", label: "💰 आर्थिक सहायता / नकद हस्तांतरण" },
        { value: "subsidy", label: "🌾 सब्सिडी (उर्वरक / ऊर्जा)" },
        { value: "training", label: "📚 प्रशिक्षण / कौशल विकास" },
        { value: "loan", label: "🏦 ऋण / क्रेडिट सहायता" },
        { value: "health", label: "🏥 स्वास्थ्य बीमा" },
        { value: "housing", label: "🏠 आवास सहायता" },
        { value: "pension", label: "👴 पेंशन / सामाजिक कल्याण" },
        { value: "everything", label: "❓ सब कुछ दिखाएं" },
      ],
      wizardIntro:
        "कृपया कुछ सवालों के जवाब दें ताकि मैं आपकी पात्रता जांच सकूं:",
      sectors: {
        agriculture: { label: "कृषि", query: "कृषि और खेती योजनाएं" },
        healthcare: {
          label: "स्वास्थ्य",
          query: "स्वास्थ्य और चिकित्सा योजनाएं",
        },
        housing: { label: "आवास", query: "आवास और मकान योजनाएं" },
        employment: { label: "रोज़गार", query: "रोज़गार और नौकरी योजनाएं" },
        pension: { label: "पेंशन", query: "पेंशन और सेवानिवृत्ति योजनाएं" },
        education: { label: "शिक्षा", query: "शिक्षा और कौशल योजनाएं" },
      },
    },
    header: { newChat: "नई चैट" },
    sidebar: {
      home: "होम",
      newChat: "नई चैट",
      settings: "सेटिंग्स",
      faq: "सवाल-जवाब / मदद",
      contact: "संपर्क करें",
      about: "जानकारी",
      privacy: "गोपनीयता नीति",
      tagline: "AI योजना सलाहकार",
      footer: "ग्रामीण भारत के लिए बनाया गया 🇮🇳",
    },
    conversational: {
      questionsPrefix: "सही योजना खोजने के लिए बस एक सवाल:",
      readyMessage:
        "बढ़िया! अब मैं आपके लिए सभी योजनाएं जांच रहा हूँ। इसमें 30–40 सेकंड लगेंगे… ⏳",
      preferNotToAnswer: "🔒 बताना नहीं चाहता",
      borderline:
        "आपकी जानकारी के अनुसार, आप शायद पात्र हैं — एक और जानकारी से पक्का हो जाएगा।",
      didYouMean: (label: string) => `मैंने सुना: "${label}" — क्या यह सही है?`,
      confirmChips: [
        { value: "confirm_yes", label: "✅ हाँ, सही है" },
        { value: "confirm_no", label: "फिर से चुनें" },
      ],
      bridging: "ठीक है। एक और जानकारी दें...",
      questions: {
        owns_land: {
          text: "क्या आपके पास कृषि भूमि है या आप दूसरों की भूमि पर खेती करते हैं?",
          chips: [
            { value: "yes_own", label: "✅ हाँ, मेरी अपनी ज़मीन है" },
            { value: "yes_cultivate", label: "🌾 दूसरों की ज़मीन पर खेती" },
            { value: "no", label: "❌ नहीं" },
          ],
        },
        land_size: {
          text: "आपके पास कितनी एकड़ ज़मीन है?",
          chips: [
            { value: "lt1", label: "1 एकड़ से कम" },
            { value: "1to2", label: "1 – 2 एकड़" },
            { value: "2to5", label: "2 – 5 एकड़" },
            { value: "gt5", label: "5 एकड़ से ज़्यादा" },
          ],
        },
        is_taxpayer: {
          text: "क्या आप या परिवार का कोई सदस्य आयकर भरता है?",
          chips: [
            { value: "no", label: "नहीं" },
            { value: "yes", label: "हाँ" },
            { value: "not_sure", label: "पता नहीं" },
          ],
        },
        bank_aadhaar: {
          text: "क्या आपका बैंक खाता आधार से जुड़ा है?",
          chips: [
            { value: "yes", label: "✅ हाँ, जुड़ा हुआ है" },
            { value: "no", label: "अभी नहीं जुड़ा" },
            { value: "not_sure", label: "पता नहीं" },
          ],
        },
        family_income: {
          text: "आपके परिवार की सालाना आमदनी लगभग कितनी है?",
          chips: [
            { value: "lt1L", label: "₹1 लाख से कम" },
            { value: "1to2L", label: "₹1 – ₹2 लाख" },
            { value: "2to5L", label: "₹2 – ₹5 लाख" },
            { value: "gt5L", label: "₹5 लाख से ज़्यादा" },
          ],
          sensitive: true,
          sensitiveNote: "वैकल्पिक — इससे आय-आधारित योजनाएं मिलेंगी",
        },
        has_ration: {
          text: "क्या आपके पास राशन कार्ड है?",
          chips: [
            { value: "bpl", label: "✅ हाँ — BPL कार्ड" },
            { value: "apl", label: "APL कार्ड" },
            { value: "no", label: "राशन कार्ड नहीं" },
          ],
        },
        owns_pucca: {
          text: "क्या आपके पास अभी पक्का मकान है?",
          chips: [
            { value: "yes", label: "हाँ, पक्का मकान है" },
            { value: "partial", label: "कच्चा / टूटा मकान" },
            { value: "no", label: "मकान नहीं है" },
          ],
        },
        has_job_card: {
          text: "क्या आपके पास MGNREGA जॉब कार्ड है?",
          chips: [
            { value: "yes", label: "हाँ" },
            { value: "no", label: "नहीं, लेकिन चाहिए" },
            { value: "not_sure", label: "जानकारी नहीं" },
          ],
        },
        has_bank_acct: {
          text: "क्या आपका बैंक में बचत खाता है?",
          chips: [
            { value: "yes", label: "✅ हाँ" },
            { value: "post_office", label: "डाकघर खाता है" },
            { value: "no", label: "खाता नहीं है" },
          ],
        },
      },
    },
  },

  mr: {
    onboarding: {
      ageLabel: "तुमचे वय किती आहे?",
      agePlaceholder: "उदा. 35",
      genderLabel: "तुमचे लिंग काय आहे?",
      genderOptions: [
        { value: "male", label: "पुरुष" },
        { value: "female", label: "स्त्री" },
        { value: "other", label: "इतर" },
      ],
      locationLabel: "तुम्ही कुठे राहतात?",
      statePlaceholder: "राज्य (उदा. महाराष्ट्र)",
      districtPlaceholder: "जिल्हा (उदा. नागपूर)",
      villagePlaceholder: "गाव/शहर (उदा. रामटेक)",
      employmentLabel: "तुम्ही काय करता?",
      employmentOptions: [
        { value: "farmer", label: "🌾 शेतकरी" },
        { value: "govt", label: "🏛️ सरकारी नोकरी" },
        { value: "private", label: "💼 खाजगी नोकरी" },
        { value: "self-employed", label: "🛒 स्वयंरोजगार" },
        { value: "unemployed", label: "🔍 बेरोजगार" },
        { value: "student", label: "🎓 विद्यार्थी" },
        { value: "other", label: "📋 इतर" },
      ],
      next: "पुढे",
      skip: "वगळा",
      letsGo: "चला सुरू करूया! 🚀",
      stepOf: (step, total) => `पायरी ${step} / ${total}`,
      skipHint: "तुम्ही वगळू शकता — AI स्वतः विचारेल 🤖",
    },
    langSelect: {
      title: "SchemeSetu",
      subtitle: "सरकारी योजनांसाठी AI मार्गदर्शक",
      footer: "ग्रामीण भारतासाठी बनवले 🇮🇳",
    },
    chat: {
      greeting: (name, tod) => (name ? `${tod}, ${name}` : `${tod}`),
      morning: "सुप्रभात",
      afternoon: "नमस्कार",
      evening: "शुभ संध्याकाळ",
      placeholder: "आज मी तुम्हाला कशी मदत करू शकतो?",
      voiceNotSupported: "या ब्राउझरमध्ये आवाज समर्थित नाही",
      noSchemes:
        "कोणतीही योजना सापडली नाही। वय, व्यवसाय, उत्पन्न, ठिकाण सांगा. 🙏",
      foundSchemes: (count) =>
        `मला ${count} योजना सापडल्या ज्या तुमच्यासाठी उपयुक्त असू शकतात:`,
      busy: "सर्व्हरवर खूप ट्रॅफिक आहे. कृपया नंतर प्रयत्न करा. 🙏",
      loadTest: "20 टेस्ट प्रश्न लोड करा",
      scrubHint: "प्रश्न ब्राउझ करण्यासाठी स्वाइप करा",
      sectorPrompt: (query) =>
        `मला ${query} बद्दल सांगा ज्यासाठी मी पात्र असू शकतो`,
      goalQuestion: "तुम्ही सध्या काय शोधत आहात?",
      goalChips: [
        { value: "financial", label: "💰 आर्थिक मदत / रोख हस्तांतरण" },
        { value: "subsidy", label: "🌾 अनुदान (खत / ऊर्जा)" },
        { value: "training", label: "📚 प्रशिक्षण / कौशल्य विकास" },
        { value: "loan", label: "🏦 कर्ज / क्रेडिट मदत" },
        { value: "health", label: "🏥 आरोग्य विमा" },
        { value: "housing", label: "🏠 गृहनिर्माण मदत" },
        { value: "pension", label: "👴 पेन्शन / सामाजिक कल्याण" },
        { value: "everything", label: "❓ सर्व काही दाखवा" },
      ],
      wizardIntro:
        "कृपया काही प्रश्नांची उत्तरे द्या जेणेकरून मी तुमची पात्रता तपासू शकेन:",
      sectors: {
        agriculture: { label: "शेती", query: "शेती आणि कृषी योजना" },
        healthcare: { label: "आरोग्य", query: "आरोग्य आणि वैद्यकीय योजना" },
        housing: { label: "गृहनिर्माण", query: "घरकुल आणि निवारा योजना" },
        employment: { label: "रोजगार", query: "रोजगार आणि नोकरी योजना" },
        pension: { label: "निवृत्ती", query: "पेन्शन आणि सेवानिवृत्ती योजना" },
        education: { label: "शिक्षण", query: "शिक्षण आणि कौशल्य योजना" },
      },
    },
    header: { newChat: "नवीन चॅट" },
    sidebar: {
      home: "होम",
      newChat: "नवीन चॅट",
      settings: "सेटिंग्ज",
      faq: "प्रश्न-उत्तर / मदत",
      contact: "संपर्क करा",
      about: "माहिती",
      privacy: "गोपनीयता धोरण",
      tagline: "AI योजना सल्लागार",
      footer: "ग्रामीण भारतासाठी बनवले 🇮🇳",
    },
    conversational: {
      questionsPrefix: "योग्य योजना शोधण्यासाठी एक प्रश्न:",
      readyMessage:
        "छान! आता मी तुमच्यासाठी सर्व योजना तपासतो. 30–40 सेकंद लागतील… ⏳",
      preferNotToAnswer: "🔒 सांगायचे नाही",
      borderline:
        "तुम्ही दिलेल्या माहितीनुसार तुम्ही पात्र असण्याची शक्यता आहे — एक अधिक तपशील खात्री करेल.",
      didYouMean: (label: string) => `मी ऐकले: "${label}" — हे बरोबर आहे का?`,
      confirmChips: [
        { value: "confirm_yes", label: "✅ हो, बरोबर आहे" },
        { value: "confirm_no", label: "पुन्हा निवडा" },
      ],
      bridging: "ठीक आहे. एक अजून माहिती द्या...",
      questions: {
        owns_land: {
          text: "तुमच्याकडे शेतजमीन आहे का, किंवा तुम्ही दुसऱ्याच्या जमिनीवर शेती करता?",
          chips: [
            { value: "yes_own", label: "✅ हो, माझी स्वतःची जमीन आहे" },
            { value: "yes_cultivate", label: "🌾 दुसऱ्याच्या जमिनीवर शेती" },
            { value: "no", label: "❌ नाही" },
          ],
        },
        land_size: {
          text: "तुमच्याकडे किती एकर जमीन आहे?",
          chips: [
            { value: "lt1", label: "1 एकरपेक्षा कमी" },
            { value: "1to2", label: "1 – 2 एकर" },
            { value: "2to5", label: "2 – 5 एकर" },
            { value: "gt5", label: "5 एकरपेक्षा जास्त" },
          ],
        },
        is_taxpayer: {
          text: "तुम्ही किंवा कुटुंबातील कोणी आयकर भरते का?",
          chips: [
            { value: "no", label: "नाही" },
            { value: "yes", label: "हो" },
            { value: "not_sure", label: "माहीत नाही" },
          ],
        },
        bank_aadhaar: {
          text: "तुमचे बँक खाते आधारशी जोडले आहे का?",
          chips: [
            { value: "yes", label: "✅ हो, जोडले आहे" },
            { value: "no", label: "अद्याप जोडलेले नाही" },
            { value: "not_sure", label: "माहीत नाही" },
          ],
        },
        family_income: {
          text: "तुमच्या कुटुंबाचे वार्षिक उत्पन्न अंदाजे किती आहे?",
          chips: [
            { value: "lt1L", label: "₹1 लाखापेक्षा कमी" },
            { value: "1to2L", label: "₹1 – ₹2 लाख" },
            { value: "2to5L", label: "₹2 – ₹5 लाख" },
            { value: "gt5L", label: "₹5 लाखापेक्षा जास्त" },
          ],
          sensitive: true,
          sensitiveNote: "पर्यायी — उत्पन्न-आधारित योजना शोधण्यात मदत होते",
        },
        has_ration: {
          text: "तुमच्याकडे रेशन कार्ड आहे का?",
          chips: [
            { value: "bpl", label: "✅ हो — BPL कार्ड" },
            { value: "apl", label: "APL कार्ड" },
            { value: "no", label: "रेशन कार्ड नाही" },
          ],
        },
        owns_pucca: {
          text: "तुमच्याकडे आत्ता पक्के घर आहे का?",
          chips: [
            { value: "yes", label: "हो, पक्के घर आहे" },
            { value: "partial", label: "कच्चे / खराब घर" },
            { value: "no", label: "घर नाही" },
          ],
        },
        has_job_card: {
          text: "तुमच्याकडे MGNREGA जॉब कार्ड आहे का?",
          chips: [
            { value: "yes", label: "हो" },
            { value: "no", label: "नाही, पण हवे आहे" },
            { value: "not_sure", label: "काय असते माहीत नाही" },
          ],
        },
        has_bank_acct: {
          text: "तुमचे बँकेत बचत खाते आहे का?",
          chips: [
            { value: "yes", label: "✅ हो" },
            { value: "post_office", label: "पोस्ट ऑफिस खाते" },
            { value: "no", label: "खाते नाही" },
          ],
        },
      },
    },
  },
};

export function t(lang: Language): Translations {
  return translations[lang] || translations.en;
}

export default translations;
