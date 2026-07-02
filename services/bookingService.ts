import { apiGet, apiPatch, apiPost } from "./apiClient";
import type { ConsultType, Specialty, SlotDay } from "@/data/teleconsult";

const VAT = 0.05;

export type BookingPayload = {
  consultType: ConsultType;
  specialty: Specialty | null;
  slotDay: SlotDay;
  slotTime: string;
  doctorId?: string;
  patientName?: string;
  patientEmail?: string;
  paymentIntentId?: string;
};

export type Booking = {
  id: string;
  consult_type: string;
  specialty: string | null;
  scheduled_date: string;
  scheduled_time: string;
  doctor_name: string | null;
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
  price: number;
  vat_amount: number;
  total_amount: number;
  video_room_id: string | null;
  created_at: string;
};

const MOCK_BOOKINGS: Booking[] = [];

export const bookingService = {
  async createBooking(payload: BookingPayload): Promise<Booking> {
    try {
      const data = await apiPost<{ appointment: Booking }>("/api/consultations/book", {
        consultType: payload.consultType.id,
        specialty: payload.specialty?.label ?? null,
        doctorId: payload.doctorId ?? null,
        scheduledDate: payload.slotDay.date,
        scheduledTime: payload.slotTime,
        patientName: payload.patientName ?? null,
        patientEmail: payload.patientEmail ?? null,
        paymentIntentId: payload.paymentIntentId ?? null,
      });
      return data.appointment;
    } catch (err) {
      console.warn("[bookingService] API unavailable, using mock:", err);
      const vatAmount = payload.consultType.price * VAT;
      const booking: Booking = {
        id: `bk_${Date.now()}`,
        consult_type: payload.consultType.id,
        specialty: payload.specialty?.label ?? null,
        scheduled_date: payload.slotDay.date,
        scheduled_time: payload.slotTime,
        doctor_name: null,
        status: "confirmed",
        price: payload.consultType.price,
        vat_amount: vatAmount,
        total_amount: payload.consultType.price + vatAmount,
        video_room_id: `room_mock_${Date.now()}`,
        created_at: new Date().toISOString(),
      };
      MOCK_BOOKINGS.unshift(booking);
      return booking;
    }
  },

  async getBookings(userId?: string, email?: string): Promise<Booking[]> {
    if (!userId && !email) return [...MOCK_BOOKINGS];
    try {
      const path = userId
        ? "/api/consultations/appointments"
        : `/api/consultations/appointments?email=${encodeURIComponent(email!)}`;
      const headers = userId ? { "x-user-id": userId } : undefined;
      const data = await apiGet<{ appointments: Booking[] }>(path, headers);
      return data.appointments;
    } catch {
      return [...MOCK_BOOKINGS];
    }
  },

  async cancelBooking(id: string): Promise<void> {
    try {
      await apiPatch(`/api/consultations/appointments/${id}/status`, { status: "cancelled" });
    } catch {
      const b = MOCK_BOOKINGS.find((x) => x.id === id);
      if (b) b.status = "cancelled";
    }
  },

  async updateStatus(
    id: string,
    status: "in_progress" | "completed" | "confirmed"
  ): Promise<void> {
    try {
      await apiPatch(`/api/consultations/appointments/${id}/status`, { status });
    } catch {
      // best effort
    }
  },
};
