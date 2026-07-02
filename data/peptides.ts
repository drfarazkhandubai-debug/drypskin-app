export interface Peptide {
  id: string;
  name: string;
  dosage: string;
  price: string;
  category: "recovery" | "anti-aging" | "performance" | "hormonal" | "skin" | "sleep" | "weight";
  categoryLabel: string;
  shortDescription: string;
  fullDescription: string;
  benefits: string[];
  url: string;
  icon: string;
}

export const peptideCategories = [
  { id: "all", label: "All" },
  { id: "recovery", label: "Recovery" },
  { id: "anti-aging", label: "Anti-Aging" },
  { id: "performance", label: "Performance" },
  { id: "hormonal", label: "Hormonal" },
  { id: "skin", label: "Skin" },
  { id: "sleep", label: "Sleep" },
  { id: "weight", label: "Weight" },
];

export const peptides: Peptide[] = [
  {
    id: "bpc-157-6mg",
    name: "BPC 157",
    dosage: "6mg",
    price: "AED 1,515",
    category: "recovery",
    categoryLabel: "Recovery",
    shortDescription: "Highly regarded for targeted recovery support, resilience, and overall balance in active lifestyles.",
    fullDescription:
      "BPC 157 (Body Protection Compound) is a well-known synthetic peptide derived from a protein found naturally in gastric juice. Widely favoured by wellness enthusiasts, it supports recovery, tissue resilience, and overall balance. Often incorporated into routine wellness protocols, BPC 157 6mg is appreciated for its clean, targeted profile.",
    benefits: ["Tissue recovery support", "Gut & joint resilience", "Inflammation balance", "Performance recovery"],
    url: "https://peptidedxb.shop/products/bpc-157-6mg",
    icon: "activity",
  },
  {
    id: "ghk-cu-30mg",
    name: "GHK-Cu",
    dosage: "30mg",
    price: "AED 1,515",
    category: "skin",
    categoryLabel: "Skin",
    shortDescription: "A copper-binding peptide celebrated for skin renewal, firmness, and radiant complexion.",
    fullDescription:
      "GHK-Cu (Copper Peptide) is a celebrated peptide in the aesthetics world, known for its ability to support skin renewal, collagen production, and firmness. Widely used in both topical and wellness routines, it promotes a rejuvenated, youthful appearance and overall skin health.",
    benefits: ["Collagen & elastin production", "Skin firmness & texture", "Wound healing support", "Anti-aging skin care"],
    url: "https://peptidedxb.shop/products/ghk-cu-30mg",
    icon: "sun",
  },
  {
    id: "epithalon-30mg",
    name: "Epithalon",
    dosage: "30mg",
    price: "AED 2,520",
    category: "anti-aging",
    categoryLabel: "Anti-Aging",
    shortDescription: "Trusted for longevity-focused wellness, cellular vitality, and supporting telomere health.",
    fullDescription:
      "Epithalon is a renowned longevity peptide trusted for its connection to cellular balance and telomere support. Widely incorporated into anti-aging protocols, it is appreciated for its role in promoting biological resilience, recovery, and overall vitality. Popular among those with a longevity-focused wellness approach.",
    benefits: ["Telomere length support", "Cellular longevity", "Antioxidant activity", "Hormonal balance"],
    url: "https://peptidedxb.shop/products/epithalon-30mg",
    icon: "clock",
  },
  {
    id: "ipamorelin-6mg",
    name: "Ipamorelin",
    dosage: "6mg",
    price: "AED 1,100",
    category: "performance",
    categoryLabel: "Performance",
    shortDescription: "Clean and targeted performance support, promoting recovery, lean body composition, and vitality.",
    fullDescription:
      "Ipamorelin is a selective growth hormone secretagogue favoured for its clean, targeted support with minimal side effects. Popular among active individuals, it supports performance, recovery, and lean body composition. Often used in conjunction with CJC-1295 for enhanced effect.",
    benefits: ["Growth hormone stimulation", "Lean muscle support", "Improved recovery", "Better sleep quality"],
    url: "https://peptidedxb.shop/products/ipamorelin-6mg",
    icon: "zap",
  },
  {
    id: "cjc-3mg",
    name: "CJC-1295",
    dosage: "3mg",
    price: "AED 1,080",
    category: "performance",
    categoryLabel: "Performance",
    shortDescription: "Supports long-term balance, vitality, and performance with sustained wellness benefits.",
    fullDescription:
      "CJC-1295 is a highly popular growth hormone releasing hormone (GHRH) analogue, appreciated for its prolonged action and sustained wellness support. Used by wellness-focused individuals to promote recovery, performance balance, and overall vitality across extended periods.",
    benefits: ["Sustained GH release", "Fat metabolism support", "Enhanced recovery", "Vitality & energy"],
    url: "https://peptidedxb.shop/products/cjc-3mg",
    icon: "trending-up",
  },
  {
    id: "cjc-3mg-ipamorelin-6mg",
    name: "CJC + Ipamorelin",
    dosage: "3mg / 6mg",
    price: "AED 2,130",
    category: "performance",
    categoryLabel: "Performance",
    shortDescription: "A synergistic blend of two premier peptides — enhanced performance, recovery, and vitality.",
    fullDescription:
      "The CJC 3mg / Ipamorelin 6mg blend combines two highly regarded peptides that work in harmony to support performance, recovery, and overall wellness. This synergistic pairing is one of the most popular combinations in the wellness community, amplifying the benefits of each individual peptide.",
    benefits: ["Amplified GH release", "Lean body composition", "Deep recovery support", "Improved vitality"],
    url: "https://peptidedxb.shop/products/cjc-3mg-ipamorelin-6mg",
    icon: "layers",
  },
  {
    id: "sermorelin-3mg",
    name: "Sermorelin",
    dosage: "3mg",
    price: "AED 1,980",
    category: "hormonal",
    categoryLabel: "Hormonal",
    shortDescription: "Promotes natural GH release, balance, and long-term vitality for wellness-driven individuals.",
    fullDescription:
      "Sermorelin is a well-established GHRH analogue used in wellness routines to support natural growth hormone balance, recovery, and long-term vitality. Appreciated for its ability to promote GH release in a physiologically balanced manner, Sermorelin is favoured by wellness-oriented individuals seeking sustainable support.",
    benefits: ["Natural GH stimulation", "Sleep & recovery support", "Body composition balance", "Hormonal harmony"],
    url: "https://peptidedxb.shop/products/sermorelin-3mg",
    icon: "refresh-cw",
  },
  {
    id: "igf-1-lr3-300mcg",
    name: "IGF-1 LR3",
    dosage: "300mcg",
    price: "AED 1,485",
    category: "performance",
    categoryLabel: "Performance",
    shortDescription: "Advanced performance peptide supporting strength, recovery, and overall vitality for active lifestyles.",
    fullDescription:
      "IGF-1 LR3 (Insulin-like Growth Factor 1 Long R3) is a highly regarded peptide known for supporting strength, recovery, and overall performance. Favoured by athletes and wellness enthusiasts, it promotes lean muscle support and recovery at a cellular level.",
    benefits: ["Muscle development support", "Enhanced recovery", "Strength & performance", "Cellular regeneration"],
    url: "https://peptidedxb.shop/products/igf-1-lr3-300mcg",
    icon: "bar-chart-2",
  },
  {
    id: "mots-c-30mg",
    name: "MOTS-C",
    dosage: "30mg",
    price: "AED 4,380",
    category: "performance",
    categoryLabel: "Performance",
    shortDescription: "A mitochondrial-derived peptide supporting energy, resilience, and metabolic balance.",
    fullDescription:
      "MOTS-C is a unique mitochondrial-derived peptide widely appreciated for its role in promoting metabolic balance, energy, and physical resilience. Known for its connection to cellular vitality and metabolic support, MOTS-C is popular among those with active, performance-driven lifestyles.",
    benefits: ["Mitochondrial energy support", "Metabolic balance", "Physical resilience", "Anti-inflammatory activity"],
    url: "https://peptidedxb.shop/products/mots-c-30mg",
    icon: "cpu",
  },
  {
    id: "pt-141-20mg",
    name: "PT-141",
    dosage: "20mg",
    price: "AED 1,800",
    category: "hormonal",
    categoryLabel: "Hormonal",
    shortDescription: "A targeted wellness peptide supporting vitality, balance, and overall wellbeing.",
    fullDescription:
      "PT-141 (Bremelanotide) is a unique peptide with a distinct wellness profile. Appreciated for its targeted support and role in promoting balance and overall vitality, it is often incorporated into holistic wellness routines for those seeking a more complete approach to wellbeing.",
    benefits: ["Vitality support", "Hormonal balance", "Overall wellbeing", "Wellness routine integration"],
    url: "https://peptidedxb.shop/products/pt-141-20mg",
    icon: "heart",
  },
  {
    id: "dsip-2mg",
    name: "DSIP",
    dosage: "2mg",
    price: "AED 1,800",
    category: "sleep",
    categoryLabel: "Sleep",
    shortDescription: "Promotes relaxation, deep recovery sleep, and overall wellbeing for a balanced lifestyle.",
    fullDescription:
      "DSIP (Delta Sleep-Inducing Peptide) is a naturally occurring neuropeptide widely appreciated for its role in supporting relaxation and restful sleep. Known for its calming profile, DSIP 2mg is incorporated into wellness routines by those seeking deeper recovery and overall balance.",
    benefits: ["Sleep quality support", "Relaxation & calm", "Recovery enhancement", "Hormonal balance during sleep"],
    url: "https://peptidedxb.shop/products/dsip-2mg",
    icon: "moon",
  },
  {
    id: "kisspeptin-10-acetate-3mg",
    name: "Kisspeptin-10",
    dosage: "3mg",
    price: "AED 2,175",
    category: "hormonal",
    categoryLabel: "Hormonal",
    shortDescription: "Supports hormonal harmony, vitality, and reproductive wellness in balanced wellness protocols.",
    fullDescription:
      "Kisspeptin-10 Acetate is a neuropeptide with a key role in hormonal signalling and balance. Appreciated for its wellness profile, it supports hormonal harmony and vitality in those seeking a targeted approach to reproductive health and overall balance.",
    benefits: ["Hormonal harmony", "LH & FSH support", "Reproductive wellness", "Mood & vitality balance"],
    url: "https://peptidedxb.shop/products/kisspeptin-10-acetate-3mg",
    icon: "git-branch",
  },
  {
    id: "thymosin-alpha-9mg",
    name: "Thymosin Alpha",
    dosage: "9mg",
    price: "AED 1,740",
    category: "recovery",
    categoryLabel: "Recovery",
    shortDescription: "Supports immune harmony, resilience, and recovery-focused wellness with a restorative profile.",
    fullDescription:
      "Thymosin Alpha 1 is a naturally occurring peptide found in the thymus, widely appreciated for its immunomodulatory profile. Known for supporting immune system balance and resilience, Thymosin Alpha 9mg is favoured by those seeking a recovery-focused wellness approach.",
    benefits: ["Immune system support", "Recovery & resilience", "Anti-inflammatory balance", "Cellular health"],
    url: "https://peptidedxb.shop/products/thymosin-alpha-9mg",
    icon: "shield",
  },
  {
    id: "thymosin-beta-9mg",
    name: "Thymosin Beta",
    dosage: "9mg",
    price: "AED 1,725",
    category: "recovery",
    categoryLabel: "Recovery",
    shortDescription: "Supports tissue repair, recovery, and overall wellbeing with a restorative and resilience-focused profile.",
    fullDescription:
      "Thymosin Beta 4 is a naturally occurring peptide appreciated for its role in supporting tissue repair, recovery, and overall wellbeing. Known within the wellness community for its restorative profile, Thymosin Beta 9mg is often incorporated into recovery-focused protocols.",
    benefits: ["Tissue repair support", "Recovery acceleration", "Anti-inflammatory activity", "Overall resilience"],
    url: "https://peptidedxb.shop/products/thymosin-beta-9mg",
    icon: "wind",
  },
  {
    id: "aod-0604-3mg",
    name: "AOD-9604",
    dosage: "3.6mg",
    price: "AED 1,620",
    category: "weight",
    categoryLabel: "Weight",
    shortDescription: "A refined peptide fragment supporting active lifestyles and body composition management.",
    fullDescription:
      "AOD-9604 is a modified fragment of human growth hormone (hGH) designed to support body composition and metabolic balance. Appreciated for its precision-focused approach, it complements active lifestyles and wellness routines that prioritise a balanced body composition.",
    benefits: ["Fat metabolism support", "Body composition balance", "Metabolic regulation", "Active lifestyle support"],
    url: "https://peptidedxb.shop/products/aod-0604-3mg",
    icon: "percent",
  },
];
