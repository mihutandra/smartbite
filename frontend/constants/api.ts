import Constants from "expo-constants";
import { Platform } from "react-native";

const DEFAULT_API_PORT = "8001";

function getHostFromExpoConfig() {
  const expoConfig = Constants.expoConfig as { hostUri?: string } | null;
  const hostUri = expoConfig?.hostUri;

  if (!hostUri) {
    return null;
  }

  return hostUri.split(":")[0] ?? null;
}

function getDefaultApiBaseUrl() {
  const configuredUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, "");
  }

  const host = getHostFromExpoConfig();

  if (host) {
    return `http://${host}:${DEFAULT_API_PORT}`;
  }

  if (Platform.OS === "android") {
    return `http://10.0.2.2:${DEFAULT_API_PORT}`;
  }

  return `http://localhost:${DEFAULT_API_PORT}`;
}

export const API_BASE_URL = getDefaultApiBaseUrl();
