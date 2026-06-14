import { API_BASE_URL } from "../constants/api";
import { type Reservation } from "../types/reservation";

export class ReservationServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReservationServiceError";
  }
}

const RESERVATION_REQUEST_TIMEOUT_MS = 15_000;

function extractErrorMessage(data: unknown, fallbackMessage: string) {
  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (typeof data !== "object" || data === null) {
    return fallbackMessage;
  }

  const detail = "detail" in data ? data.detail : undefined;

  if (typeof detail === "string" && detail.trim()) {
    return detail;
  }

  return fallbackMessage;
}

async function parseApiResponse<T>(response: Response): Promise<T> {
  const rawText = await response.text();
  let data: unknown = null;

  if (rawText) {
    try {
      data = JSON.parse(rawText);
    } catch {
      data = rawText;
    }
  }

  if (!response.ok) {
    throw new ReservationServiceError(
      extractErrorMessage(
        data ?? rawText,
        rawText.trim() || "Nu am reusit sa procesam cererea. Incearca din nou.",
      ),
    );
  }

  return data as T;
}

async function fetchWithTimeout(url: string, options: RequestInit) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), RESERVATION_REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

function createConnectionError(error: unknown) {
  if (error instanceof Error && error.name === "AbortError") {
    return new ReservationServiceError(
      "Cererea dureaza prea mult. Verifica serverul si incearca din nou.",
    );
  }

  return new ReservationServiceError(`Nu ne putem conecta la server la ${API_BASE_URL}.`);
}

export async function fetchMyReservations(accessToken: string): Promise<Reservation[]> {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/reservations/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await parseApiResponse<Reservation[]>(response);

    if (!Array.isArray(data)) {
      throw new ReservationServiceError("Serverul a returnat un raspuns invalid.");
    }

    return data;
  } catch (error) {
    if (error instanceof ReservationServiceError) {
      throw error;
    }

    throw createConnectionError(error);
  }
}

export async function fetchReservationDetail(
  accessToken: string,
  reservationId: string,
): Promise<Reservation> {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/reservations/${reservationId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return await parseApiResponse<Reservation>(response);
  } catch (error) {
    if (error instanceof ReservationServiceError) {
      throw error;
    }

    throw createConnectionError(error);
  }
}

export async function cancelReservation(
  accessToken: string,
  reservationId: string,
): Promise<Reservation> {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/reservations/${reservationId}/cancel`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return await parseApiResponse<Reservation>(response);
  } catch (error) {
    if (error instanceof ReservationServiceError) {
      throw error;
    }

    throw createConnectionError(error);
  }
}
