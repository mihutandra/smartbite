import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import * as Location from "expo-location";
import {
  getStoredUserLocation,
  removeStoredUserLocation,
  setStoredUserLocation,
  type StoredUserLocation,
} from "../services/session-storage";
import { useAuth } from "./auth-context";

type LocationStatus = "idle" | "requesting" | "granted" | "denied" | "unavailable" | "error";

export type UserLocation = StoredUserLocation;

type LocationContextValue = {
  error: string;
  isRequestingLocation: boolean;
  requestUserLocation: (options?: RequestUserLocationOptions) => Promise<UserLocation | null>;
  status: LocationStatus;
  userLocation: UserLocation | null;
};

type RequestUserLocationOptions = {
  waitForProfileSync?: boolean;
};

type SaveLocationOptions = {
  forcePersist?: boolean;
  waitForProfileSync?: boolean;
};

const LocationContext = createContext<LocationContextValue | undefined>(undefined);
const LOCATION_PERSIST_INTERVAL_MS = 60_000;

export function LocationProvider({ children }: { children: ReactNode }) {
  const { status: authStatus, updateProfile, user } = useAuth();
  const [status, setStatus] = useState<LocationStatus>("idle");
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [error, setError] = useState("");
  const [hasHydratedLocation, setHasHydratedLocation] = useState(false);
  const lastPersistedLocationAtRef = useRef(0);
  const lastSyncedProfileLocationAtRef = useRef(0);

  const syncProfileLocation = useCallback(async (location: UserLocation, capturedAt: Date, options?: SaveLocationOptions) => {
    if (
      authStatus !== "authenticated" ||
      (!options?.forcePersist &&
        capturedAt.getTime() - lastSyncedProfileLocationAtRef.current < LOCATION_PERSIST_INTERVAL_MS)
    ) {
      return false;
    }

    let profileLocation: string | null = null;

    try {
      const geocodedAddresses = await Location.reverseGeocodeAsync({
        latitude: location.latitude,
        longitude: location.longitude,
      });

      profileLocation = formatProfileLocation(geocodedAddresses[0]);
    } catch {
      profileLocation = null;
    }

    try {
      await updateProfile({
        latitude: location.latitude,
        longitude: location.longitude,
        ...(profileLocation ? { location: profileLocation } : {}),
      });
      lastSyncedProfileLocationAtRef.current = capturedAt.getTime();
      return true;
    } catch {
      // Location should still be usable locally if profile sync fails.
      return false;
    }
  }, [authStatus, updateProfile]);

  const saveLocation = useCallback(async (position: Location.LocationObject, options?: SaveLocationOptions) => {
    const capturedAt = new Date();
    const nextLocation: UserLocation = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: typeof position.coords.accuracy === "number" ? position.coords.accuracy : null,
      capturedAt: capturedAt.toISOString(),
    };

    if (
      options?.forcePersist ||
      capturedAt.getTime() - lastPersistedLocationAtRef.current >= LOCATION_PERSIST_INTERVAL_MS
    ) {
      await setStoredUserLocation(nextLocation);
      lastPersistedLocationAtRef.current = capturedAt.getTime();
    }

    setUserLocation(nextLocation);
    setStatus("granted");
    setError("");
    if (options?.waitForProfileSync) {
      const didSyncProfileLocation = await syncProfileLocation(nextLocation, capturedAt, options);

      if (!didSyncProfileLocation) {
        throw new Error("Nu am putut salva locatia in profil.");
      }
    } else {
      void syncProfileLocation(nextLocation, capturedAt, options);
    }
    return nextLocation;
  }, [syncProfileLocation]);

  const requestUserLocation = useCallback(async (options?: RequestUserLocationOptions) => {
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

      return await saveLocation(position, {
        forcePersist: true,
        waitForProfileSync: options?.waitForProfileSync,
      });
    } catch (locationError) {
      const message = "Nu am putut detecta locatia curenta.";

      setStatus("error");
      setError(message);
      return null;
    }
  }, [saveLocation]);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      setStatus("idle");
      setUserLocation(null);
      setError("");
      setHasHydratedLocation(false);
      lastPersistedLocationAtRef.current = 0;
      lastSyncedProfileLocationAtRef.current = 0;
      void removeStoredUserLocation();
      return;
    }

    if (authStatus !== "authenticated") {
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
        lastPersistedLocationAtRef.current = Date.now();
        lastSyncedProfileLocationAtRef.current = Date.now();
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
        lastPersistedLocationAtRef.current = Date.now();
        lastSyncedProfileLocationAtRef.current = Date.now();
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

        await saveLocation(currentPosition, { forcePersist: true });

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

function formatProfileLocation(address: Location.LocationGeocodedAddress | undefined) {
  if (!address) {
    return null;
  }

  const locality = address.city || address.subregion || address.region || address.district;
  const country = address.country;

  if (locality && country) {
    return `${locality}, ${country}`;
  }

  return locality || country || null;
}
