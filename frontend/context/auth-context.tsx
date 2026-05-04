import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import {
  AuthServiceError,
  fetchCurrentUser,
  login,
  RegisterPayload,
  register,
  UserProfile,
} from "../services/auth";
import {
  getStoredAccessToken,
  removeStoredAccessToken,
  setStoredAccessToken,
} from "../services/session-storage";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  accessToken: string | null;
  error: string;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (payload: RegisterPayload) => Promise<void>;
  status: AuthStatus;
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
    await removeStoredAccessToken();
    setAccessToken(null);
    setUser(null);
    setError("");
    setStatus("unauthenticated");
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
