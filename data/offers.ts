// ─── Monthly Offers ───────────────────────────────────────────────────────────
// Images are pulled directly from drypskin.com/special-offer
// To update each month: replace the image URLs with the new campaign graphics
// and update `month`, `title`, and `whatsappMessage` accordingly.
// ──────────────────────────────────────────────────────────────────────────────

export interface Offer {
  id: string;
  month: string;
  title: string;
  subtitle?: string;
  image: string;
  whatsappMessage: string;
  badge?: string;
}

export const WHATSAPP_NUMBER = "971586078532";

// ─── Current offers — pulled from drypskin.com/special-offer ─────────────────
export const offers: Offer[] = [
  {
    id: "ramadan-2026-1",
    month: "Ramadan 2026",
    title: "Double Chin — Lipolysis Package",
    subtitle: "Flat 50% off · AED 1,499 only",
    image: "https://drypskin.com/assets/frontend/img/ramadan-2026-1.webp",
    whatsappMessage: "Hi Drypskin! I'm interested in the Ramadan Double Chin Lipolysis offer (Flat 50% off, AED 1,499). Please help me book.",
    badge: "FLAT 50% OFF",
  },
  {
    id: "ramadan-2026-2",
    month: "Ramadan 2026",
    title: "Weight Loss IV Drip",
    subtitle: "Get in shape this Ramadan · AED 1,450",
    image: "https://drypskin.com/assets/frontend/img/ramadan-2026-2.webp",
    whatsappMessage: "Hi Drypskin! I'm interested in the Ramadan Weight Loss IV Drip offer (AED 1,450). Please help me book.",
    badge: "RAMADAN SPECIAL",
  },
  {
    id: "ramadan-2026-3",
    month: "Ramadan 2026",
    title: "HIFU Ultraformer III",
    subtitle: "Non-surgical facelift · Flat 50% off",
    image: "https://drypskin.com/assets/frontend/img/ramadan-2026-3.webp",
    whatsappMessage: "Hi Drypskin! I'm interested in the Ramadan HIFU Ultraformer III offer (Flat 50% off). Please help me book.",
    badge: "FLAT 50% OFF",
  },
  {
    id: "ramadan-2026-4",
    month: "Ramadan 2026",
    title: "Co La Vie IV Drip",
    subtitle: "Total wellness · Flat 50% off · AED 845",
    image: "https://drypskin.com/assets/frontend/img/ramadan-2026-4.webp",
    whatsappMessage: "Hi Drypskin! I'm interested in the Ramadan Co La Vie IV Drip offer (Flat 50% off, AED 845). Please help me book.",
    badge: "FLAT 50% OFF",
  },
  {
    id: "ramadan-2026-5",
    month: "Ramadan 2026",
    title: "Laser Hair Removal",
    subtitle: "Full face AED 125 · Full body AED 550",
    image: "https://drypskin.com/assets/frontend/img/ramadan-2026-5.webp",
    whatsappMessage: "Hi Drypskin! I'm interested in the Ramadan Laser Hair Removal offer. Please help me book.",
    badge: "50% OFF",
  },
  {
    id: "ramadan-2026-6",
    month: "Ramadan 2026",
    title: "Weight Loss Package",
    subtitle: "Transform your body · Up to 70% off",
    image: "https://drypskin.com/assets/frontend/img/ramadan-2026-6.webp",
    whatsappMessage: "Hi Drypskin! I'm interested in the Ramadan Weight Loss Package (up to 70% off). Please help me book.",
    badge: "UP TO 70% OFF",
  },
  {
    id: "ramadan-2026-7",
    month: "Ramadan 2026",
    title: "Body Sculpting — Package 1",
    subtitle: "3D sculpting · Focused fat reduction",
    image: "https://drypskin.com/assets/frontend/img/ramadan-2026-7.webp",
    whatsappMessage: "Hi Drypskin! I'm interested in the Ramadan Body Sculpting Package 1. Please help me book.",
    badge: "RAMADAN SPECIAL",
  },
  {
    id: "ramadan-2026-8",
    month: "Ramadan 2026",
    title: "Body Sculpting — Package 2",
    subtitle: "EMSculpt · Advanced fat reduction",
    image: "https://drypskin.com/assets/frontend/img/ramadan-2026-8.webp",
    whatsappMessage: "Hi Drypskin! I'm interested in the Ramadan Body Sculpting Package 2 (EMSculpt). Please help me book.",
    badge: "RAMADAN SPECIAL",
  },
  {
    id: "ramadan-2026-9",
    month: "Ramadan 2026",
    title: "Ramadan Special Offer 9",
    subtitle: "Limited time · Book now",
    image: "https://drypskin.com/assets/frontend/img/ramadan-2026-9.webp",
    whatsappMessage: "Hi Drypskin! I'm interested in the Ramadan Special Offer 9. Please share details and help me book.",
    badge: "LIMITED TIME",
  },
  {
    id: "ramadan-2026-10",
    month: "Ramadan 2026",
    title: "Ramadan Special Offer 10",
    subtitle: "Limited time · Book now",
    image: "https://drypskin.com/assets/frontend/img/ramadan-2026-10.webp",
    whatsappMessage: "Hi Drypskin! I'm interested in the Ramadan Special Offer 10. Please share details and help me book.",
    badge: "LIMITED TIME",
  },
];
