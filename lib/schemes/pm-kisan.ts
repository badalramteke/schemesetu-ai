// lib/pm-kisan.ts

export const pmKisanScheme = {
    "schemeId": "pm-kisan",
    "schemeName": "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
    "source": "https://pmkisan.gov.in",
    "eligibility": {
      "targetGroup": "Landholding farmer families with cultivable land.",
      "requirements": [
        "Must own cultivable land in their name",
        "Must have a valid Aadhaar number",
        "Bank account must be seeded with Aadhaar for Direct Benefit Transfer (DBT)"
      ],
      "exclusions": [
        "Institutional landholders",
        "Anyone who paid income tax in the last assessment year",
        "Current or former constitutional post holders, Ministers, MPs, MLAs, Mayors",
        "Serving or retired government employees (except Class IV/Group D)",
        "Pensioners with a monthly pension of ₹10,000 or more",
        "Registered professionals like Doctors, Engineers, Lawyers, CAs"
      ],
      "simplifiedEligibility": {
        "basicRequirements": [
          "Do you own farming land in your name? (Yes)",
          "Is your bank account linked to your Aadhaar? (Yes)"
        ],
        "automaticallyExcluded": [
          "If you pay income tax, you cannot apply.",
          "If you get a pension of ₹10,000+, you cannot apply.",
          "If you are a doctor, lawyer, or govt employee, you cannot apply."
        ]
      }
    },
    "requiredDocuments": [
      "📄 Aadhaar Card (Mandatory)",
      "📋 Land ownership records (Khatauni/Khasra)",
      "🏦 Bank passbook / Account details",
      "📱 Aadhaar-linked mobile number"
    ],
    "benefits": {
      "totalAnnualAmount": 6000,
      "currency": "INR",
      "paymentMode": "Direct Benefit Transfer (DBT) directly to Aadhaar-linked bank account",
      "installments": [
        {
          "period": "April - July",
          "amount": 2000
        },
        {
          "period": "August - November",
          "amount": 2000
        },
        {
          "period": "December - March",
          "amount": 2000
        }
      ]
    },
    "applicationProcess": [
      {
        "step": 1,
        "title": "Online Registration",
        "description": "Go to pmkisan.gov.in and click 'New Farmer Registration'. Enter Aadhaar and mobile number."
      },
      {
        "step": 2,
        "title": "Data Entry",
        "description": "Fill in personal details, bank details, and exact land record details (Survey/Khata number)."
      },
      {
        "step": 3,
        "title": "Verification",
        "description": "Form goes to State Nodal Officer for digital verification against land and tax databases."
      },
      {
        "step": 4,
        "title": "e-KYC",
        "description": "Complete mandatory e-KYC using Aadhaar OTP or biometric at CSC."
      }
    ],
    "processDetails": {
      "canApplyOnline": true,
      "canApplyAtCSC": true,
      "requiresCSCVisit": false,
      "fullyDigital": true,
      "processType": "Hybrid (Can do online, but CSC available for those without internet)"
    },
    "timeline": {
      "registrationToApproval": "Not specified (Depends entirely on State government verification speed)",
      "firstPaymentAfter": "Not specified (Depends on the next active installment cycle after approval)",
      "paymentFrequency": "Every 4 months"
    },
    "ruralUserTips": [
      "Make sure the spelling of your name on Aadhaar exactly matches your bank account.",
      "You MUST link your Aadhaar to your bank account (NPCI mapping), or the money will fail.",
      "Check your status online using your Aadhaar number before going to the block office."
    ],
    "commonRejectionReasons": [
      "Aadhaar is not seeded to the bank account for DBT.",
      "Name mismatch between Aadhaar and Bank records.",
      "State government rejected the land record details.",
      "Found paying income tax during automated database checks."
    ],
    "contactInfo": {
      "website": "https://pmkisan.gov.in",
      "helpline": "155261 / 011-24300606",
      "email": "pmkisan-ict@gov.in"
    }
};