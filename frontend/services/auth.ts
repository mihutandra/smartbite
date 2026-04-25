import { API_BASE_URL } from "../constants/api";

export type LoginResponse = {
  access_token: string;
  token_type: string;
};

export class AuthServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthServiceError";
  }
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email.trim(),
      password,
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const detail =
      typeof data?.detail === "string"
        ? data.detail
        : "Nu am reusit sa te conectam. Verifica datele si incearca din nou.";

    throw new AuthServiceError(detail);
  }

  if (typeof data?.access_token !== "string" || typeof data?.token_type !== "string") {
    throw new AuthServiceError("Serverul a returnat un raspuns invalid.");
  }

  return data as LoginResponse;
}
