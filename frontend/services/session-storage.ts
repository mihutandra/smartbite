import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const ACCESS_TOKEN_KEY = "smartbite.access_token";

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
