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

async function parseApiResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const detail =
      typeof data?.detail === "string"
        ? data.detail
        : "Nu am reusit sa procesam cererea. Incearca din nou.";

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
