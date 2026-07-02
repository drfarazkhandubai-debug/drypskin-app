export type ConsultType = {
  id: string;
  label: string;
  subtitle: string;
  price: number;
  duration: string;
  icon: string;
  description: string;
};

export type Specialty = {
  id: string;
  label: string;
  icon: string;
};

export type MockDoctor = {
  id: string;
  name: string;
  avatar: string;
  specialty: string;
  rating: number;
  consultations: number;
  bio: string;
};

export type SlotDay = {
  dayLabel: string;
  dateLabel: string;
  times: string[];
};

export type SymptomSummary = {
  riskLevel: "low" | "medium" | "high";
  severityScore: number;
  keyDrivers: string[];
  summary: string;
  duration: string;
  completedAt: string;
};

export type MockConsultation = {
  id: string;
  patientName: string;
  issue: string;
  specialty: string;
  time: string;
  date: string;
  status: "upcoming" | "in-progress" | "completed";
  healthScore?: number;
  energyScore?: number;
  burnoutIndex?: number;
  symptomSummary?: SymptomSummary;
};

export const CONSULT_TYPES: ConsultType[] = [
  {
    id: "nurse",
    label: "Nurse Consultation",
    subtitle: "General wellness & triage",
    price: 150,
    duration: "30 min",
    icon: "thermometer",
    description: "Ideal for wellness queries, IV prep assessments, and general health triage.",
  },
  {
    id: "gp",
    label: "GP Doctor",
    subtitle: "General health concerns",
    price: 350,
    duration: "45 min",
    icon: "activity",
    description: "Full consultation with a licensed GP for symptoms, prescriptions, and referrals.",
  },
  {
    id: "specialist",
    label: "Specialist / Consultant",
    subtitle: "Expert clinical opinion",
    price: 600,
    duration: "60 min",
    icon: "star",
    description: "One-on-one with a board-certified specialist for complex aesthetic or medical cases.",
  },
];

export const SPECIALTIES: Specialty[] = [
  { id: "plastic-surgery",       label: "Plastic Surgery",         icon: "scissors"       },
  { id: "family-medicine",       label: "Family Medicine",         icon: "heart"          },
  { id: "aesthetic-derm",        label: "Aesthetic Dermatology",   icon: "sun"            },
  { id: "psychology",            label: "Psychology",              icon: "message-circle" },
  { id: "psychiatry",            label: "Psychiatry",              icon: "moon"           },
  { id: "functional-medicine",   label: "Functional Medicine",     icon: "zap"            },
];

export const MOCK_DOCTORS: MockDoctor[] = [
  {
    id: "d1",
    name: "Dr. Amara Khan",
    avatar: "AK",
    specialty: "Aesthetic Dermatology",
    rating: 4.9,
    consultations: 342,
    bio: "Board-certified dermatologist specialising in advanced aesthetics and anti-ageing protocols.",
  },
  {
    id: "d2",
    name: "Dr. Hassan Al Najjar",
    avatar: "HN",
    specialty: "Functional Medicine",
    rating: 4.8,
    consultations: 218,
    bio: "Expert in longevity, metabolic health, and personalised wellness programmes.",
  },
  {
    id: "d3",
    name: "Dr. Sofia Reyes",
    avatar: "SR",
    specialty: "Plastic Surgery",
    rating: 4.9,
    consultations: 289,
    bio: "Consultant plastic surgeon with a decade of experience in minimally invasive procedures.",
  },
];

function nextDayLabel(offset: number): { dayLabel: string; dateLabel: string } {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const dayLabel =
    offset === 1
      ? "Tomorrow"
      : d.toLocaleDateString("en-AE", { weekday: "long" });
  const dateLabel = d.toLocaleDateString("en-AE", { day: "numeric", month: "short" });
  return { dayLabel, dateLabel };
}

export const MOCK_SLOTS: SlotDay[] = [
  { ...nextDayLabel(1), times: ["09:00", "10:30", "14:00", "16:00"] },
  { ...nextDayLabel(2), times: ["09:30", "11:00", "13:30", "15:00", "17:00"] },
  { ...nextDayLabel(3), times: ["10:00", "11:30", "14:30", "16:30"] },
];

export const MOCK_CONSULTATIONS: MockConsultation[] = [
  {
    id: "c1",
    patientName: "Sarah M.",
    issue: "Skin texture concerns, post-acne scarring",
    specialty: "Aesthetic Dermatology",
    time: "10:00 AM",
    date: "Today",
    status: "upcoming",
    healthScore: 62,
    energyScore: 55,
    burnoutIndex: 72,
  },
  {
    id: "c2",
    patientName: "James R.",
    issue: "Fatigue, metabolic panel review",
    specialty: "Functional Medicine",
    time: "11:30 AM",
    date: "Today",
    status: "upcoming",
    healthScore: 48,
    energyScore: 40,
    burnoutIndex: 85,
    symptomSummary: {
      riskLevel: "high",
      severityScore: 78,
      keyDrivers: ["Sleep Deficit", "Cortisol Stress", "Dehydration"],
      summary: "James is presenting with significant fatigue and brain fog consistent with adrenal overload. The combination of poor sleep, chronic stress, and low energy warrants a metabolic panel alongside a functional medicine review.",
      duration: "1 week+",
      completedAt: "Today, 9:42 AM",
    },
  },
  {
    id: "c3",
    patientName: "Layla A.",
    issue: "Anti-ageing consultation, filler assessment",
    specialty: "Plastic Surgery",
    time: "02:00 PM",
    date: "Today",
    status: "completed",
    healthScore: 78,
    energyScore: 70,
    burnoutIndex: 38,
  },
];

export const VAT_RATE = 0.05;
