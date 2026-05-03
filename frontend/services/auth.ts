import { API_BASE_URL } from "../constants/api";

export type LoginResponse = {
  access_token: string;
  token_type: string;
};

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  updated_at: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  phone: string;
};

export type RegisterResponse = UserProfile;

export class AuthServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthServiceError";
  }
}

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
    const detail = extractErrorMessage(
      data ?? rawText,
      rawText.trim() || "Nu am reusit sa procesam cererea. Incearca din nou.",
    );

    throw new AuthServiceError(detail);
  }

  return data as T;
}

function createJsonHeaders(accessToken?: string) {
  return {
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: createJsonHeaders(),
      body: JSON.stringify({
        email: email.trim(),
        password,
      }),
    });

    const data = await parseApiResponse<LoginResponse>(response);

    if (typeof data?.access_token !== "string" || typeof data?.token_type !== "string") {
      throw new AuthServiceError("Serverul a returnat un raspuns invalid.");
    }

    return data as LoginResponse;
  } catch (error) {
    if (error instanceof AuthServiceError) {
      throw error;
    }

    throw new AuthServiceError(`Nu ne putem conecta la server la ${API_BASE_URL}.`);
  }
}

export async function register(payload: RegisterPayload): Promise<RegisterResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: createJsonHeaders(),
      body: JSON.stringify({
        ...payload,
        name: payload.name.trim(),
        email: payload.email.trim(),
        phone: payload.phone.trim(),
      }),
    });

    const data = await parseApiResponse<RegisterResponse>(response);

    if (typeof data?.id !== "string" || typeof data?.email !== "string") {
      throw new AuthServiceError("Serverul a returnat un raspuns invalid.");
    }

    return data;
  } catch (error) {
    if (error instanceof AuthServiceError) {
      throw error;
    }

    throw new AuthServiceError(`Nu ne putem conecta la server la ${API_BASE_URL}.`);
  }
}

export async function fetchCurrentUser(accessToken: string): Promise<UserProfile> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: "GET",
      headers: createJsonHeaders(accessToken),
    });

    const data = await parseApiResponse<UserProfile>(response);

    if (typeof data?.id !== "string" || typeof data?.email !== "string") {
      throw new AuthServiceError("Serverul a returnat un raspuns invalid.");
    }

    return data;
  } catch (error) {
    if (error instanceof AuthServiceError) {
      throw error;
    }

    throw new AuthServiceError(`Nu ne putem conecta la server la ${API_BASE_URL}.`);
  }
}
