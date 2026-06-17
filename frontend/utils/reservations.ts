import { type ReservationStatus } from "../types/reservation";

export type ReservationStatusTone = "active" | "complete" | "muted";

const reservationStatuses = new Set<string>([
  "active",
  "cancelled",
  "completed",
  "expired",
]);

const reservationStatusLabels: Record<ReservationStatus, string> = {
  active: "Activa",
  cancelled: "Anulata",
  completed: "Finalizata",
  expired: "Expirata",
};

export function isReservationStatus(status: unknown): status is ReservationStatus {
  return typeof status === "string" && reservationStatuses.has(status);
}

export function getReservationStatusLabel(status: ReservationStatus) {
  return reservationStatusLabels[status];
}

export function getReservationStatusTone(status: ReservationStatus): ReservationStatusTone {
  if (status === "active") {
    return "active";
  }

  if (status === "cancelled" || status === "expired") {
    return "muted";
  }

  return "complete";
}

export function toNumber(value: string | number | null | undefined) {
  const numericValue = typeof value === "number" ? value : Number.parseFloat(value ?? "0");
  return Number.isFinite(numericValue) ? numericValue : 0;
}
