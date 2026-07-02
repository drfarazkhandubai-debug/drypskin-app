export interface Protocol {
  id: string;
  area: string;
  tagline: string;
  subtagline: string;
  badge: string;
  packageName: string;
  price: string;
  priceNote: string;
  color: string;
  accentColor: string;
  icon: string;
  includes: ProtocolItem[];
  description: string;
}

export interface ProtocolItem {
  name: string;
  type: "iv" | "peptide";
  bullets: string[];
}

export const protocols: Protocol[] = [
  {
    id: "longevity",
    area: "Longevity",
    tagline: "Age Less.\nLive More.",
    subtagline: "Cellular Rejuvenation · Science-Backed",
    badge: "Foundation Package",
    packageName: "Cellular Youth",
    price: "AED 2,880",
    priceNote: "Free skin consultation included with every session",
    color: "#5C7A6B",
    accentColor: "#A8C4B8",
    icon: "clock",
    description:
      "Designed for those who want to defy time at the cellular level. This longevity protocol combines NAD+ infusion with Epithalon — the telomere-extending peptide — to slow biological aging, restore cellular energy, and promote radiant, youthful skin.",
    includes: [
      {
        name: "NAD IV (100mg)",
        type: "iv",
        bullets: [
          "Replenishes cellular energy (ATP production)",
          "Activates DNA repair enzymes (sirtuins)",
          "Improves mitochondrial function & longevity markers",
        ],
      },
      {
        name: "Glutathione + Vitamin C IV",
        type: "iv",
        bullets: [
          "Master antioxidant for cellular protection",
          "Brightens skin tone & neutralises free radicals",
          "Boosts immune resilience",
        ],
      },
      {
        name: "Epithalon Peptide Pen",
        type: "peptide",
        bullets: [
          "Telomere-lengthening bioregulator peptide",
          "Restores pineal gland function & sleep quality",
          "Reduces oxidative stress at the cellular level",
        ],
      },
    ],
  },
  {
    id: "energy",
    area: "Energy",
    tagline: "Perform at\nYour Peak.",
    subtagline: "Sustained Performance · Science-Driven",
    badge: "Signature Package",
    packageName: "Peak Performance",
    price: "AED 2,880",
    priceNote: "Free consultation included with every session",
    color: "#C4956A",
    accentColor: "#E8C99A",
    icon: "zap",
    description:
      "Engineered for peak performance. The Hakuna IV Myers Cocktail supercharges energy at the cellular level, while CJC + Ipamorelin peptides optimise growth hormone output for sustained stamina, faster recovery, and lean body composition.",
    includes: [
      {
        name: "Hakuna IV / Myers Cocktail",
        type: "iv",
        bullets: [
          "High-dose B-complex, Magnesium, Vitamin C",
          "Restores cellular energy and reduces fatigue",
          "Enhances athletic endurance and mental focus",
        ],
      },
      {
        name: "CJC + Ipamorelin",
        type: "peptide",
        bullets: [
          "Growth hormone-releasing peptide stack",
          "Increases lean muscle mass and fat metabolism",
          "Improves sleep quality and recovery speed",
        ],
      },
    ],
  },
  {
    id: "fat-loss",
    area: "Fat Loss",
    tagline: "Burn Fat.\nFeel Alive.",
    subtagline: "Science-Driven Fat Loss · Visible Results",
    badge: "Kickstart Metabolism",
    packageName: "Fat Burn Protocol",
    price: "AED 2,880",
    priceNote: "Free consultation included with every session",
    color: "#B05A3A",
    accentColor: "#E08060",
    icon: "activity",
    description:
      "A clinically designed fat-loss protocol combining L-Carnitine IV infusion with our proprietary fat-burning peptide pen. Targets visceral fat, accelerates lipid metabolism, and preserves lean muscle — all while keeping energy levels high.",
    includes: [
      {
        name: "Phantom — Signature Fat Burn IV",
        type: "iv",
        bullets: [
          "High-dose L-Carnitine for fat-to-energy conversion",
          "Boosts metabolic rate and thermogenesis",
          "Reduces appetite and sugar cravings",
        ],
      },
      {
        name: "Drypskin Signature Fat Burning Pen",
        type: "peptide",
        bullets: [
          "Targeted peptide blend for localised fat reduction",
          "Stimulates lipolysis at the cellular level",
          "Preserves lean muscle during fat loss phase",
        ],
      },
    ],
  },
  {
    id: "recovery",
    area: "Recovery",
    tagline: "Recover.\nRegenerate.",
    subtagline: "Accelerated Healing at the Cellular Level",
    badge: "Recovery Program",
    packageName: "Wolverine Stack",
    price: "AED 2,880",
    priceNote: "Free consultation included with every session",
    color: "#4A5B8A",
    accentColor: "#8A9ACA",
    icon: "shield",
    description:
      "Inspired by the Wolverine protocol — the most aggressive regenerative peptide stack available. Ozone therapy floods your cells with oxygen for deep healing, while BPC-157 and TB4 (Thymosin Beta-4) accelerate tissue repair, reduce inflammation, and restore physical integrity.",
    includes: [
      {
        name: "Ozone Therapy (5 pass)",
        type: "iv",
        bullets: [
          "Oxidative healing for deep cellular oxygenation",
          "Immune system activation and pathogen elimination",
          "Dramatically improves circulation and energy",
        ],
      },
      {
        name: "BPC + TB4 (Wolverine Stack)",
        type: "peptide",
        bullets: [
          "BPC-157: Body Protection Compound for gut, joint & tissue healing",
          "TB4 (Thymosin Beta-4): Regulates actin and promotes wound closure",
          "The most powerful regenerative peptide combination available",
        ],
      },
    ],
  },
  {
    id: "cognition",
    area: "Cognition",
    tagline: "Think Sharp.\nLive Bright.",
    subtagline: "Supercharge Your Brain Power",
    badge: "Cognition Program",
    packageName: "Brain Optimiser",
    price: "AED 2,880",
    priceNote: "Free consultation included with every session",
    color: "#5A7A8A",
    accentColor: "#8AB8CA",
    icon: "cpu",
    description:
      "Precision brain optimisation for high-performers. NAD+ IV therapy restores the neurological energy pathways that decline with age and stress, while Semax — a powerful nootropic peptide — enhances neuroplasticity, memory consolidation, and mental resilience.",
    includes: [
      {
        name: "NAD+ IV Therapy",
        type: "iv",
        bullets: [
          "Restores neurological ATP and cognitive energy",
          "Activates BDNF (Brain-Derived Neurotrophic Factor)",
          "Reduces brain fog, improves mental clarity",
        ],
      },
      {
        name: "Peptide Semax Nasal Spray",
        type: "peptide",
        bullets: [
          "Nootropic peptide that enhances memory and focus",
          "Promotes neuroplasticity and stress resilience",
          "Fast-acting via nasal route for direct CNS delivery",
        ],
      },
    ],
  },
  {
    id: "immunity",
    area: "Immunity",
    tagline: "Stronger Immunity.\nHealthier You.",
    subtagline: "Clinically Backed · Result-Oriented",
    badge: "Signature Package",
    packageName: "Immune Defense Boost",
    price: "AED 2,880",
    priceNote: "Free consultation included with every session",
    color: "#0D6E7A",
    accentColor: "#4EA8B8",
    icon: "crosshair",
    description:
      "Advanced immune support designed to fortify your body's natural defenses at the cellular level. The Jaguar IV delivers a specialized immune-boosting formula, Glutathione IV provides master antioxidant protection, and Thymosin Alpha-1 — one of the most powerful immune-modulating peptides — trains your immune system to respond with precision and strength.",
    includes: [
      {
        name: "Jaguar IV (Specialized Formula)",
        type: "iv",
        bullets: [
          "Specialized high-dose immune-boosting IV formula",
          "Fortifies white blood cell production and activity",
          "Delivers targeted micronutrients for rapid immune response",
        ],
      },
      {
        name: "Glutathione IV (1 Session)",
        type: "iv",
        bullets: [
          "Master antioxidant — neutralises free radicals and oxidative stress",
          "Supports detoxification pathways and liver function",
          "Brightens skin and reduces systemic inflammation",
        ],
      },
      {
        name: "Thymosin Alpha-1 Peptide",
        type: "peptide",
        bullets: [
          "FDA-recognised immune-modulating peptide (Zadaxin)",
          "Activates T-cells, NK cells, and dendritic cells",
          "Used clinically for chronic infections, cancer support, and immune deficiency",
        ],
      },
    ],
  },
  {
    id: "beauty",
    area: "Beauty",
    tagline: "Rejuvenate.\nRepair. Radiate.",
    subtagline: "Advanced Skin Rejuvenation at the Cellular Level",
    badge: "Glam IV + GHK-Cu Therapy",
    packageName: "Inner Glow Protocol",
    price: "AED 2,880",
    priceNote: "Free skin consultation included with every session",
    color: "#8A5A6A",
    accentColor: "#C49AAA",
    icon: "sun",
    description:
      "The ultimate inside-out beauty protocol. Our Glam IV delivers a potent mix of beauty vitamins, antioxidants, and glutathione directly into your bloodstream, while GHK-Cu — the copper peptide — stimulates collagen synthesis and reverses visible signs of skin aging.",
    includes: [
      {
        name: "Glam IV Infusion",
        type: "iv",
        bullets: [
          "Beauty-enhancing vitamins, antioxidants & glutathione",
          "Deep hydration and skin brightening from within",
          "Boosts collagen production and skin radiance",
        ],
      },
      {
        name: "GHK-Cu Peptide Therapy",
        type: "peptide",
        bullets: [
          "Copper peptide — one of the most studied anti-aging molecules",
          "Supports skin repair, elasticity and collagen remodelling",
          "Reduces fine lines, inflammation, and oxidative damage",
        ],
      },
    ],
  },
];
