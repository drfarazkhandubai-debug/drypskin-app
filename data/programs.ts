export interface Program {
  id: string;
  name: string;
  subtitle: string;
  tagline: string;
  description: string;
  includes: string[];
  price: string;
  priceNote: string;
  badge?: string;
  dark?: boolean;
}

export const programs: Program[] = [
  {
    id: "glow-program",
    name: "Glow Program",
    subtitle: "IV Glow Facial",
    tagline: "Radiance from within",
    description:
      "A curated combination of our signature Hydrafacial and IV Glow drip — designed to deliver full-body radiance. Your skin will thank you.",
    includes: [
      "Hydrafacial treatment",
      "IV Glow drip (Vitamin C + Glutathione)",
      "Skin analysis & consultation",
      "Aftercare products",
    ],
    price: "AED 799",
    priceNote: "per session",
    badge: "Most Popular",
  },
  {
    id: "anti-aging",
    name: "Anti-Aging Program",
    subtitle: "Skin Boosters",
    tagline: "Turn back the clock",
    description:
      "Our comprehensive anti-aging protocol combines the most effective treatments to restore youthful radiance and smooth fine lines.",
    includes: [
      "Fine Lines + Wrinkle Treatment",
      "Skin Boosters (Profhilo/Juvederm)",
      "IV Immunity + Collagen Drip",
      "Monthly review & adjustment",
    ],
    price: "AED 1,500",
    priceNote: "per session",
    badge: "Best Results",
  },
  {
    id: "vip-membership",
    name: "VIP Membership",
    subtitle: "Private Wellness Club",
    tagline: "Your personal wellness sanctuary",
    description:
      "Unlimited access to our exclusive member benefits. Priority booking, monthly treatments, and a dedicated care team.",
    includes: [
      "1 Facial per month",
      "1 IV Drip per month",
      "Priority booking",
      "10% off all additional treatments",
      "10% off on any promotional running offer",
      "Free home service",
      "1 free OligoScan every 3 months (minerals, heavy metals & vitamins)",
      "Dedicated care coordinator",
      "Free consultations",
    ],
    price: "AED 999",
    priceNote: "per month",
    badge: "VIP",
    dark: true,
  },
];

export const quickActions = [
  { id: "iv-drip", label: "Book IV Drip", icon: "droplet", route: "/iv-therapy" },
  { id: "facial", label: "Book Facial", icon: "sun", route: "/facials" },
  { id: "consult", label: "Consultation", icon: "message-circle", route: "/book" },
  { id: "glow", label: "Glow Program", icon: "star", route: "/program/glow-program" },
  { id: "anti-aging", label: "Anti-Aging", icon: "zap", route: "/program/anti-aging" },
  { id: "membership", label: "VIP Club", icon: "award", route: "/program/vip-membership" },
];
