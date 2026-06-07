import { Stack } from "expo-router";
import { AuthProvider } from "../context/auth-context";
import { LocationProvider } from "../context/location-context";

export default function RootLayout() {
  return (
    <AuthProvider>
      <LocationProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </LocationProvider>
    </AuthProvider>
  );
}
