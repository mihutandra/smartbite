import { API_BASE_URL } from "../constants/api";
import { type UpdateProfilePayload, type UserProfile } from "../types/auth";
import { type ProfileSavings } from "../types/profile";

export class ProfileServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProfileServiceError";
  }
}

const PROFILE_REQUEST_TIMEOUT_MS = 15_000;

function formatValidationPath(path: unknown) {
  if (!Array.isArray(path) || path.length === 0) {
    return "Camp invalid";
  }

  const cleanedPath = path
    .filter((part) => part !== "body")
    .map((part) => String(part))
    .join(".");

  return cleanedPath || "Camp invalid";
}

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

  if (Array.isArray(detail) && detail.length > 0) {
    const firstError = detail[0];

    if (typeof firstError === "string" && firstError.trim()) {
      return firstError;
    }

    if (typeof firstError === "object" && firstError !== null) {
      const message = "msg" in firstError && typeof firstError.msg === "string" ? firstError.msg : null;
      const path = "loc" in firstError ? formatValidationPath(firstError.loc) : null;

      if (message && path) {
        return `${path}: ${message}`;
      }

      if (message) {
        return message;
      }
    }
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
    throw new ProfileServiceError(
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
  const timeoutId = setTimeout(() => controller.abort(), PROFILE_REQUEST_TIMEOUT_MS);

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
    return new ProfileServiceError(
      "Cererea dureaza prea mult. Verifica serverul si incearca din nou.",
    );
  }

  return new ProfileServiceError(`Nu ne putem conecta la server la ${API_BASE_URL}.`);
}

export async function fetchProfileSavings(accessToken: string): Promise<ProfileSavings> {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/profile/savings`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await parseApiResponse<ProfileSavings>(response);

    if (typeof data?.total_savings !== "string" && typeof data?.total_savings !== "number") {
      throw new ProfileServiceError("Serverul a returnat un raspuns invalid.");
    }

    return {
      total_savings: String(data.total_savings),
      currency: data.currency || "RON",
    };
  } catch (error) {
    if (error instanceof ProfileServiceError) {
      throw error;
    }

    throw createConnectionError(error);
  }
}

export async function updateProfile(
  accessToken: string,
  payload: UpdateProfilePayload,
): Promise<UserProfile> {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/profile`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await parseApiResponse<UserProfile>(response);

    if (typeof data?.id !== "string" || typeof data?.email !== "string") {
      throw new ProfileServiceError("Serverul a returnat un raspuns invalid.");
    }

    return data;
  } catch (error) {
    if (error instanceof ProfileServiceError) {
      throw error;
    }

    throw createConnectionError(error);
  }
}
