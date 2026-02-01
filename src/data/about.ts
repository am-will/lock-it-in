export interface CoreValue {
  icon: string; // emoji
  title: string;
  description: string;
}

export interface TeamMember {
  name: string;
  role: string;
  avatarUrl: string; // dicebear URL
}

export interface StatItem {
  value: string;
  label: string;
}

export const CORE_VALUES: CoreValue[] = [
  {
    icon: "🤝",
    title: "Trust",
    description: "We verify every user to create a marketplace where collectors can trade with confidence."
  },
  {
    icon: "🔐",
    title: "Security",
    description: "Your transactions and personal data are protected by industry-leading security measures."
  },
  {
    icon: "🌟",
    title: "Community",
    description: "Built by collectors for collectors. We understand what matters to the trading card community."
  },
  {
    icon: "🚀",
    title: "Innovation",
    description: "We're constantly improving our platform with features like real-time locking and seamless grading."
  }
];

export const TEAM_MEMBERS: TeamMember[] = [
  {
    name: "Alex Chen",
    role: "Founder & CEO",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=AlexChen"
  },
  {
    name: "Sarah Martinez",
    role: "Head of Operations",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=SarahMartinez"
  },
  {
    name: "Jordan Kim",
    role: "Lead Developer",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=JordanKim"
  }
];

export const STATS: StatItem[] = [
  {
    value: "10,000+",
    label: "Cards Sold"
  },
  {
    value: "5,000+",
    label: "Verified Users"
  },
  {
    value: "4.9/5",
    label: "Average Rating"
  },
  {
    value: "99.8%",
    label: "Successful Trades"
  }
];

export const STORY_PARAGRAPHS: string[] = [
  "Lock It In was born from a simple frustration: buying and selling trading cards online was risky, complicated, and filled with uncertainty. As collectors ourselves, we experienced the anxiety of wondering if a seller was legitimate, if the card would arrive as described, or if our payment was secure.",
  "We set out to build the marketplace we wished existed. One where every user is verified, where cards can be locked instantly while you complete your purchase, and where professional grading is just a click away. A place where collectors can focus on what they love—the cards—instead of worrying about the transaction.",
  "Today, Lock It In is home to thousands of verified collectors who trade with confidence. Whether you're hunting for that grail card to complete your collection or selling cards to fund your next big purchase, we're here to make it safe, simple, and enjoyable."
];
