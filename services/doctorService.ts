import { apiGet } from "./apiClient";
import { MOCK_DOCTORS, MOCK_SLOTS, type MockDoctor, type SlotDay } from "@/data/teleconsult";

export type ApiDoctor = {
  id: string;
  name: string;
  specialty: string | null;
  role: "nurse" | "gp" | "specialist";
  rating: number;
  total_consults: number;
  bio: string | null;
};

const toMockDoctor = (d: ApiDoctor): MockDoctor => ({
  id: d.id,
  name: d.name,
  specialty: d.specialty ?? "General Practice",
  rating: d.rating,
  role: d.role,
  avatar: d.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase(),
  consultations: d.total_consults,
});

export const doctorService = {
  async getDoctors(role?: string): Promise<MockDoctor[]> {
    try {
      const path = role
        ? `/api/consultations/doctors?role=${role}`
        : "/api/consultations/doctors";
      const data = await apiGet<{ doctors: ApiDoctor[] }>(path);
      return data.doctors.map(toMockDoctor);
    } catch (err) {
      console.warn("[doctorService] Falling back to mock data:", err);
      return MOCK_DOCTORS;
    }
  },

  async getDoctorById(id: string): Promise<MockDoctor | null> {
    try {
      const all = await apiGet<{ doctors: ApiDoctor[] }>("/api/consultations/doctors");
      const d = all.doctors.find((x) => x.id === id);
      return d ? toMockDoctor(d) : null;
    } catch {
      return MOCK_DOCTORS.find((d) => d.id === id) ?? null;
    }
  },

  async getAvailability(_specialtyId?: string): Promise<SlotDay[]> {
    try {
      const data = await apiGet<{
        availability: Array<{
          id: string;
          date: string;
          dayLabel: string;
          dateLabel: string;
          times: string[];
        }>;
      }>("/api/consultations/availability");
      return data.availability;
    } catch (err) {
      console.warn("[doctorService] Falling back to mock slots:", err);
      return MOCK_SLOTS;
    }
  },

  async getDoctorForSpecialty(specialtyId: string): Promise<MockDoctor> {
    const specialtyMap: Record<string, string> = {
      "plastic-surgery": "Plastic Surgery",
      "family-medicine": "Family Medicine",
      "aesthetic-derm": "Aesthetic Dermatology",
      psychology: "Psychology",
      psychiatry: "Psychiatry",
      "functional-medicine": "Functional Medicine",
    };
    const specialtyName = specialtyMap[specialtyId] ?? specialtyId;
    try {
      const data = await apiGet<{ doctors: ApiDoctor[] }>(
        `/api/consultations/doctors?role=specialist&specialty=${encodeURIComponent(specialtyName)}`
      );
      if (data.doctors.length > 0) return toMockDoctor(data.doctors[0]);
    } catch {
      // fall through
    }
    return (
      MOCK_DOCTORS.find((d) => d.specialty === specialtyName) ?? MOCK_DOCTORS[0]
    );
  },
};
