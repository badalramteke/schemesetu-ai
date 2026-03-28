// ─── i18n Type Definitions for SchemeSetu ──────────────────────────────────

export type Language = "en" | "hi" | "mr" | "bn" | "gu" | "kn" | "te" | "ur";

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

export interface Translations {
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
  langSelect: {
    title: string;
    subtitle: string;
    footer: string;
  };
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
  header: {
    newChat: string;
  };
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
  homeDashboard: {
    greeting: (name?: string) => string;
    subtitle: string;
    searchPlaceholder: string;
    askMe: string;
  };
  csc: {
    nearestCentre: string;
    commonServiceCentresIn: (location: string) => string;
    find: string;
    findNearest: string;
    locating: string;
    nearestFound: string;
    openInMaps: string;
    bookAppointment: string;
    bookingConfirmed: string;
    bookingConfirmedDesc: string;
    yourDetails: string;
    fullName: string;
    phoneNumber: string;
    schemeInterest: string;
    confirmBooking: string;
    sending: string;
    cancel: string;
    showMore: string;
    showLess: string;
    officialLocator: string;
    helpline: string;
    findCscCentre: string;
    hide: string;
  };
  schemeCard: {
    nextSteps: string;
    documentsNeeded: string;
    ready: (done: number, total: number) => string;
    confidence: string;
    verified: (date: string) => string;
    officialSite: string;
    downloadPack: string;
    preparing: string;
    opened: string;
    whatsCovered: string;
    financialBenefits: string;
    benefitAmount: string;
    frequency: string;
    paymentMode: string;
    needOfflineHelp: string;
    offlineHelpDesc: (location: string) => string;
    eligibleMatch: string;
    docHelper: string;
  };
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
