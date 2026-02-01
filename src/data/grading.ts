export interface GradingCompany {
  id: string;
  name: string;
  fullName: string;
  description: string;
  website: string;
}

export interface GradingTier {
  id: string;
  name: string;
  price: number;
  turnaroundDays: number;
  features: string[];
  recommended?: boolean;
}

export interface GradeScaleItem {
  grade: number;
  label: string;
  description: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export const GRADING_COMPANIES: GradingCompany[] = [
  {
    id: "psa",
    name: "PSA",
    fullName: "Professional Sports Authenticator",
    description: "The largest and most trusted third-party trading card authentication and grading company in the world.",
    website: "https://www.psacard.com"
  },
  {
    id: "bgs",
    name: "BGS",
    fullName: "Beckett Grading Services",
    description: "Industry leader in card grading with sub-grades for centering, corners, edges, and surface.",
    website: "https://www.beckett.com/grading"
  },
  {
    id: "cgc",
    name: "CGC",
    fullName: "Certified Guaranty Company",
    description: "Trusted grading for trading cards, comics, and collectibles with consistent standards.",
    website: "https://www.cgccomics.com"
  },
  {
    id: "sgc",
    name: "SGC",
    fullName: "Sportscard Guaranty Corporation",
    description: "Fast, reliable grading with the iconic black tuxedo label. Popular for vintage cards.",
    website: "https://www.sgccard.com"
  }
];

export const GRADING_TIERS: GradingTier[] = [
  {
    id: "economy",
    name: "Economy",
    price: 15,
    turnaroundDays: 30,
    features: ["Standard authentication", "Digital tracking", "Insurance included"]
  },
  {
    id: "standard",
    name: "Standard",
    price: 25,
    turnaroundDays: 14,
    features: ["Priority authentication", "Digital tracking", "Insurance included", "Faster processing"],
    recommended: true
  },
  {
    id: "express",
    name: "Express",
    price: 50,
    turnaroundDays: 5,
    features: ["Expedited authentication", "Real-time tracking", "Premium insurance", "Fastest processing", "Direct support"]
  }
];

export const GRADE_SCALE: GradeScaleItem[] = [
  { grade: 10, label: "Gem Mint", description: "Perfect card with no visible flaws" },
  { grade: 9, label: "Mint", description: "Near-perfect, minor flaw only visible under close inspection" },
  { grade: 8, label: "NM-MT", description: "Near Mint-Mint, minor wear on one corner or edge" },
  { grade: 7, label: "Near Mint", description: "Slight surface wear or fraying on corners" },
  { grade: 6, label: "EX-NM", description: "Excellent-Near Mint, minor rounding of corners" },
  { grade: 5, label: "Excellent", description: "Visible corner rounding, minor creasing" },
  { grade: 4, label: "VG-EX", description: "Very Good-Excellent, moderate wear" },
  { grade: 3, label: "Very Good", description: "Heavy wear, noticeable creases" },
  { grade: 2, label: "Good", description: "Significant wear, major creases" },
  { grade: 1, label: "Poor", description: "Heavy damage but card is intact" }
];

export const GRADING_FAQS: FAQItem[] = [
  {
    question: "How does the grading process work?",
    answer: "After purchase, you ship your card to our partner facility where experts authenticate and grade it using industry-standard criteria. The card is then sealed in a protective case and shipped to you."
  },
  {
    question: "Which grading company should I choose?",
    answer: "PSA is the most recognized for resale value. BGS provides sub-grades for detailed analysis. CGC is excellent for modern cards. SGC is preferred by many for vintage cards."
  },
  {
    question: "How long does grading take?",
    answer: "Turnaround time depends on the tier you select: Express (5 days), Standard (14 days), or Economy (30 days). Times may vary during peak periods."
  },
  {
    question: "Is my card insured during grading?",
    answer: "Yes, all grading tiers include insurance coverage during shipping to and from the grading facility. Express and Standard tiers include higher coverage limits."
  },
  {
    question: "What if my card doesn't receive the grade I expected?",
    answer: "Grading is based on objective criteria by professional graders. We cannot guarantee specific grades, but all graders are certified and use consistent standards."
  }
];
