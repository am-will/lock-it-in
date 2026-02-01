export interface SellerBenefit {
  icon: string; // emoji or simple identifier
  title: string;
  description: string;
}

export interface ProcessStep {
  number: number;
  title: string;
  description: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export const SELLER_BENEFITS: SellerBenefit[] = [
  {
    icon: "💰",
    title: "0% Seller Fees",
    description: "Keep 100% of your sale price during our launch period. No hidden fees or surprises."
  },
  {
    icon: "🛡️",
    title: "Verified Buyers",
    description: "Every buyer is phone and identity verified, reducing fraud and ensuring serious offers."
  },
  {
    icon: "⚡",
    title: "Fast Payout",
    description: "Get paid within 2 business days after the buyer receives and confirms the card."
  },
  {
    icon: "🔒",
    title: "Seller Protection",
    description: "Our secure escrow system protects you from fraudulent chargebacks and disputes."
  },
  {
    icon: "📱",
    title: "Easy Listing",
    description: "Create professional listings in minutes with our streamlined listing tool and image upload."
  }
];

export const SELLER_PROCESS: ProcessStep[] = [
  {
    number: 1,
    title: "Create Listing",
    description: "Snap photos, set your price, and write a description. Our tools make it simple."
  },
  {
    number: 2,
    title: "Verify Identity",
    description: "Complete our quick identity verification to build trust with potential buyers."
  },
  {
    number: 3,
    title: "Make Sale",
    description: "When a buyer locks your card, ship it within 2 business days with tracking."
  },
  {
    number: 4,
    title: "Get Paid",
    description: "Funds are released to your account once the buyer confirms receipt."
  }
];

export const SELLER_FAQS: FAQItem[] = [
  {
    question: "How much does it cost to sell?",
    answer: "During our launch period, there are absolutely no seller fees. You keep 100% of the sale price. We may introduce a small commission in the future, but early sellers will be grandfathered into favorable rates."
  },
  {
    question: "How do I get paid?",
    answer: "We process payouts via direct bank transfer (ACH) or PayPal. You can set up your preferred payout method in your account settings. Payouts are initiated within 2 business days after the buyer confirms receipt."
  },
  {
    question: "What if a buyer returns a card?",
    answer: "All sales are final unless the card is significantly not as described. We require buyers to confirm their purchase decision during checkout, and our identity verification reduces frivolous returns."
  },
  {
    question: "How should I ship cards?",
    answer: "We require sellers to use tracked shipping with adequate protection (card sleeves, top loaders, bubble mailers). You'll receive detailed shipping guidelines after making a sale."
  },
  {
    question: "Can I sell graded and ungraded cards?",
    answer: "Yes! You can list both raw (ungraded) and professionally graded cards. Graded cards from PSA, BGS, CGC, and SGC are all supported."
  }
];
