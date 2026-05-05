import Constants from "expo-constants";
import { Platform } from "react-native";

const DEFAULT_API_PORT = "8001";

function normalizeBaseUrl(url: string) {
  return url.trim().replace(/\/$/, "");
}

function getDefaultApiBaseUrl() {
  const configuredUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  const isBrowser = typeof window !== "undefined" && typeof document !== "undefined";

  // In browser, never use mobile LAN env defaults.
  if (isBrowser) {
    return `http://${window.location.hostname}:${DEFAULT_API_PORT}`;
  }

  if (configuredUrl) {
    return normalizeBaseUrl(configuredUrl);
  }

  if (Platform.OS === "android") {
    return `http://10.0.2.2:${DEFAULT_API_PORT}`;
  }

  const expoGoConfig = Constants.expoGoConfig as { debuggerHost?: string } | null;
  const debuggerHost = expoGoConfig?.debuggerHost;

  if (debuggerHost) {
    const host = debuggerHost.split(":")[0];

    if (host) {
      return `http://${host}:${DEFAULT_API_PORT}`;
    }
  }

  return `http://localhost:${DEFAULT_API_PORT}`;
}

export const API_BASE_URL = getDefaultApiBaseUrl();
