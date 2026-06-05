import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as Location from "expo-location";
import {
  getStoredUserLocation,
  setStoredUserLocation,
  type StoredUserLocation,
} from "../services/session-storage";
import { useAuth } from "./auth-context";

type LocationStatus = "idle" | "requesting" | "granted" | "denied" | "unavailable" | "error";

export type UserLocation = StoredUserLocation;

type LocationContextValue = {
  error: string;
  isRequestingLocation: boolean;
  requestUserLocation: () => Promise<UserLocation | null>;
  status: LocationStatus;
  userLocation: UserLocation | null;
};

const LocationContext = createContext<LocationContextValue | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const { status: authStatus, user } = useAuth();
  const [status, setStatus] = useState<LocationStatus>("idle");
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [error, setError] = useState("");
  const [hasHydratedLocation, setHasHydratedLocation] = useState(false);

  const saveLocation = useCallback(async (position: Location.LocationObject) => {
    const nextLocation: UserLocation = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: typeof position.coords.accuracy === "number" ? position.coords.accuracy : null,
      capturedAt: new Date().toISOString(),
    };

    await setStoredUserLocation(nextLocation);
    setUserLocation(nextLocation);
    setStatus("granted");
    setError("");
    return nextLocation;
  }, []);

  const requestUserLocation = useCallback(async () => {
    setStatus("requesting");
    setError("");

    try {
      const permission = await Location.requestForegroundPermissionsAsync();

      if (permission.status !== Location.PermissionStatus.GRANTED) {
        const message = "Permisiunea pentru locatie a fost refuzata.";
        setStatus("denied");
        setError(message);
        return null;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return await saveLocation(position);
    } catch (locationError) {
      const message = "Nu am putut detecta locatia curenta.";

      setStatus("error");
      setError(message);
      return null;
    }
  }, [saveLocation]);

  useEffect(() => {
    if (authStatus !== "authenticated") {
      setStatus("idle");
      setUserLocation(null);
      setError("");
      setHasHydratedLocation(false);
      return;
    }

    let isMounted = true;

    async function hydrateLocation() {
      const storedLocation = await getStoredUserLocation();

      if (!isMounted) {
        return;
      }

      if (storedLocation) {
        setUserLocation(storedLocation);
        setStatus("granted");
        setHasHydratedLocation(true);
        return;
      }

      const profileLatitude = user?.latitude;
      const profileLongitude = user?.longitude;
      const profileUpdatedAt = user?.updated_at;

      if (profileLatitude != null && profileLongitude != null && profileUpdatedAt) {
        setUserLocation({
          latitude: profileLatitude,
          longitude: profileLongitude,
          accuracy: null,
          capturedAt: profileUpdatedAt,
        });
        setStatus("granted");
      }

      setHasHydratedLocation(true);
    }

    void hydrateLocation();

    return () => {
      isMounted = false;
    };
  }, [authStatus, user?.latitude, user?.longitude, user?.updated_at]);

  useEffect(() => {
    if (authStatus !== "authenticated" || !hasHydratedLocation) {
      return;
    }

    let isMounted = true;
    let subscription: Location.LocationSubscription | null = null;

    async function watchUserLocation() {
      setStatus((current) => (current === "granted" ? current : "requesting"));
      setError("");

      try {
        const permission = await Location.requestForegroundPermissionsAsync();

        if (!isMounted) {
          return;
        }

        if (permission.status !== Location.PermissionStatus.GRANTED) {
          setStatus("denied");
          setError("Permisiunea pentru locatie a fost refuzata.");
          return;
        }

        const currentPosition = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (!isMounted) {
          return;
        }

        await saveLocation(currentPosition);

        const nextSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            distanceInterval: 25,
            timeInterval: 10_000,
          },
          (position) => {
            void saveLocation(position);
          },
        );

        if (!isMounted) {
          nextSubscription.remove();
          return;
        }

        subscription = nextSubscription;
      } catch {
        if (!isMounted) {
          return;
        }

        setStatus("error");
        setError("Nu am putut detecta locatia curenta.");
      }
    }

    void watchUserLocation();

    return () => {
      isMounted = false;
      subscription?.remove();
    };
  }, [authStatus, hasHydratedLocation, saveLocation]);

  const value = useMemo<LocationContextValue>(
    () => ({
      error,
      isRequestingLocation: status === "requesting",
      requestUserLocation,
      status,
      userLocation,
    }),
    [error, requestUserLocation, status, userLocation],
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocation() {
  const context = useContext(LocationContext);

  if (!context) {
    throw new Error("useLocation must be used within a LocationProvider");
  }

  return context;
}
