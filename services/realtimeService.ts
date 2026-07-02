import { supabase } from "@/lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";

export type AppointmentEvent = {
  event: "booked" | "status_changed";
  appointmentId: string;
  status?: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
  userId?: string;
};

export type ApplicationEvent = {
  event: "approved" | "rejected";
  applicationId: string;
  doctorName?: string;
};

export type ConsultStatus = "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";

export const CONSULT_STATUS_LABELS: Record<ConsultStatus, string> = {
  pending:     "Pending",
  confirmed:   "Confirmed",
  in_progress: "Doctor Joined",
  completed:   "Completed",
  cancelled:   "Cancelled",
};

export const CONSULT_STATUS_ORDER: ConsultStatus[] = [
  "confirmed",
  "in_progress",
  "completed",
];

export function subscribeToAppointments(
  callback: (data: AppointmentEvent) => void
): RealtimeChannel {
  return supabase
    .channel("appointments")
    .on("broadcast", { event: "booked" }, ({ payload }) => callback(payload as AppointmentEvent))
    .on("broadcast", { event: "status_changed" }, ({ payload }) => callback(payload as AppointmentEvent))
    .subscribe();
}

export function subscribeToConsultStatus(
  appointmentId: string,
  callback: (status: ConsultStatus, raw: AppointmentEvent) => void
): RealtimeChannel {
  return supabase
    .channel(`appointments-${appointmentId}`)
    .on("broadcast", { event: "status_changed" }, ({ payload }) => {
      const data = payload as AppointmentEvent;
      if (data.appointmentId === appointmentId && data.status) {
        callback(data.status as ConsultStatus, data);
      }
    })
    .subscribe();
}

export function subscribeToDoctorApplications(
  callback: (data: ApplicationEvent) => void
): RealtimeChannel {
  return supabase
    .channel("doctor-applications")
    .on("broadcast", { event: "approved" }, ({ payload }) => callback(payload as ApplicationEvent))
    .on("broadcast", { event: "rejected" }, ({ payload }) => callback(payload as ApplicationEvent))
    .subscribe();
}

export function unsubscribe(channel: RealtimeChannel) {
  supabase.removeChannel(channel);
}
