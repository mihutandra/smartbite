import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const ACCESS_TOKEN_KEY = "smartbite.access_token";
const USER_LOCATION_KEY = "smartbite.user_location";

export type StoredUserLocation = {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  capturedAt: string;
};

function canUseLocalStorage() {
  return Platform.OS === "web" && typeof window !== "undefined";
}

export async function getStoredAccessToken() {
  if (canUseLocalStorage()) {
    return window.localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function setStoredAccessToken(token: string) {
  if (canUseLocalStorage()) {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
    return;
  }

  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
}

export async function removeStoredAccessToken() {
  if (canUseLocalStorage()) {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    return;
  }

  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
}

export async function getStoredUserLocation(): Promise<StoredUserLocation | null> {
  const rawValue = canUseLocalStorage()
    ? window.localStorage.getItem(USER_LOCATION_KEY)
    : await SecureStore.getItemAsync(USER_LOCATION_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as Partial<StoredUserLocation>;

    const latitude = parsed.latitude;
    const longitude = parsed.longitude;

    if (!isValidCoordinate(latitude, -90, 90) || !isValidCoordinate(longitude, -180, 180)) {
      return null;
    }

    return {
      latitude,
      longitude,
      accuracy: typeof parsed.accuracy === "number" ? parsed.accuracy : null,
      capturedAt: typeof parsed.capturedAt === "string" ? parsed.capturedAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export async function setStoredUserLocation(location: StoredUserLocation) {
  const value = JSON.stringify(location);

  if (canUseLocalStorage()) {
    window.localStorage.setItem(USER_LOCATION_KEY, value);
    return;
  }

  await SecureStore.setItemAsync(USER_LOCATION_KEY, value);
}

export async function removeStoredUserLocation() {
  if (canUseLocalStorage()) {
    window.localStorage.removeItem(USER_LOCATION_KEY);
    return;
  }

  await SecureStore.deleteItemAsync(USER_LOCATION_KEY);
}

function isValidCoordinate(value: unknown, minimum: number, maximum: number): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= minimum &&
    value <= maximum
  );
}
