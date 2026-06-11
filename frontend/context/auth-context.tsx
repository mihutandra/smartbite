import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import {
  AuthServiceError,
  fetchCurrentUser,
  login,
  register,
} from "../services/auth";
import { ProfileServiceError, updateProfile as updateProfileRequest } from "../services/profile";
import {
  getStoredAccessToken,
  removeStoredAccessToken,
  setStoredAccessToken,
} from "../services/session-storage";
import { type RegisterPayload, type UpdateProfilePayload, type UserProfile } from "../types/auth";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  accessToken: string | null;
  error: string;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (payload: RegisterPayload) => Promise<void>;
  status: AuthStatus;
  updateProfile: (payload: UpdateProfilePayload) => Promise<UserProfile>;
  user: UserProfile | null;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      try {
        const token = await getStoredAccessToken();

        if (!token) {
          if (isMounted) {
            setStatus("unauthenticated");
          }
          return;
        }

        const currentUser = await fetchCurrentUser(token);

        if (!isMounted) {
          return;
        }

        setAccessToken(token);
        setUser(currentUser);
        setStatus("authenticated");
      } catch {
        await removeStoredAccessToken();

        if (!isMounted) {
          return;
        }

        setAccessToken(null);
        setUser(null);
        setStatus("unauthenticated");
      }
    }

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  async function signIn(email: string, password: string) {
    setError("");
    const loginResult = await login(email, password);
    const currentUser = await fetchCurrentUser(loginResult.access_token);

    await setStoredAccessToken(loginResult.access_token);

    setAccessToken(loginResult.access_token);
    setUser(currentUser);
    setError("");
    setStatus("authenticated");
  }

  async function signUp(payload: RegisterPayload) {
    setError("");
    await register(payload);
    setError("");
  }

  async function signOut() {
    // TODO: This currently performs only a local sign-out by clearing the stored token.
    // Call the backend logout endpoint too once that flow is ready to be implemented.
    await removeStoredAccessToken();
    setAccessToken(null);
    setUser(null);
    setError("");
    setStatus("unauthenticated");
  }

  async function updateProfile(payload: UpdateProfilePayload) {
    if (!accessToken) {
      throw new ProfileServiceError("Trebuie sa fii autentificat pentru a actualiza profilul.");
    }

    setError("");
    const updatedUser = await updateProfileRequest(accessToken, payload);
    setUser(updatedUser);
    setError("");
    return updatedUser;
  }

  const value: AuthContextValue = {
    accessToken,
    error,
    isAuthenticated: status === "authenticated",
    signIn: async (email: string, password: string) => {
      try {
        await signIn(email, password);
      } catch (err) {
        const message =
          err instanceof AuthServiceError
            ? err.message
            : "A aparut o eroare neasteptata. Incearca din nou.";

        setError(message);
        throw err;
      }
    },
    signOut,
    signUp: async (payload: RegisterPayload) => {
      try {
        await signUp(payload);
      } catch (err) {
        const message =
          err instanceof AuthServiceError
            ? err.message
            : "A aparut o eroare neasteptata. Incearca din nou.";

        setError(message);
        throw err;
      }
    },
    status,
    updateProfile: async (payload: UpdateProfilePayload) => {
      try {
        return await updateProfile(payload);
      } catch (err) {
        const message =
          err instanceof ProfileServiceError || err instanceof AuthServiceError
            ? err.message
            : "A aparut o eroare neasteptata. Incearca din nou.";

        setError(message);
        throw err;
      }
    },
    user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
