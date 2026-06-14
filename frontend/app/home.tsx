import { Feather } from "@expo/vector-icons";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomNavBar } from "../components/BottomNavBar";
import { MapSupermarketCard } from "../components/MapSupermarketCard";
import { SupermarketCard } from "../components/SupermarketCard";
import { authHeroStyles } from "../constants/auth-hero-styles";
import { useAuth } from "../context/auth-context";
import { useLocation } from "../context/location-context";
import {
  fetchAllSupermarkets,
  fetchSupermarketsInBounds,
  fetchSupermarketProductCounts,
} from "../services/supermarkets";
import { type MapMarker, type MapRegion } from "../types/map";
import { type Supermarket, type SupermarketMapMarker } from "../types/supermarket";

const FALLBACK_REGION = {
  latitude: 46.7712,
  longitude: 23.6236,
  latitudeDelta: 0.12,
  longitudeDelta: 0.12,
};

const ACCENT_COLORS = ["#E06F34", "#E04935", "#4D8E6A", "#6B8E23", "#C26D3C"];
const HOME_SUPERMARKET_PAGE_SIZE = 100;
const HOME_MAP_MARKER_LIMIT = 500;
const LOCATION_QUERY_PRECISION = 3;

type MapSupermarketDisplay = SupermarketMapMarker;

export default function HomeScreen() {
  const { view } = useLocalSearchParams<{ view?: string }>();
  const insets = useSafeAreaInsets();
  const { status, user } = useAuth();
  const { isRequestingLocation, requestUserLocation, userLocation } = useLocation();
  const [supermarkets, setSupermarkets] = useState<Supermarket[]>([]);
  const [mapSupermarkets, setMapSupermarkets] = useState<SupermarketMapMarker[]>([]);
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});
  const [selectedStoreId, setSelectedStoreId] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [loadError, setLoadError] = useState("");
  const [isLoadingStores, setIsLoadingStores] = useState(true);
  const [mapRenderKey, setMapRenderKey] = useState(0);
  const [mapRegion, setMapRegion] = useState<MapRegion>(FALLBACK_REGION);
  const [hasCenteredMapOnUserLocation, setHasCenteredMapOnUserLocation] = useState(false);
  const userLatitude = userLocation?.latitude;
  const userLongitude = userLocation?.longitude;
  const locationQuery = useMemo(
    () =>
      typeof userLatitude === "number" && typeof userLongitude === "number"
        ? {
            latitude: Number(userLatitude.toFixed(LOCATION_QUERY_PRECISION)),
            longitude: Number(userLongitude.toFixed(LOCATION_QUERY_PRECISION)),
          }
        : undefined,
    [userLatitude, userLongitude],
  );

  useEffect(() => {
    setViewMode(view === "map" ? "map" : "list");
  }, [view]);

  useEffect(() => {
    if (status !== "authenticated") {
      setIsLoadingStores(false);
      setProductCounts({});
      return;
    }

    let isMounted = true;

    async function loadSupermarkets() {
      setIsLoadingStores(true);
      setLoadError("");

      try {
        const supermarketList = await fetchAllSupermarkets(HOME_SUPERMARKET_PAGE_SIZE, locationQuery);

        if (!isMounted) {
          return;
        }

        setSupermarkets(supermarketList);
        setSelectedStoreId((current) => current || supermarketList[0]?.id || "");
        setIsLoadingStores(false);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setLoadError(
          error instanceof Error ? error.message : "Nu am putut incarca lista de supermarketuri.",
        );
      } finally {
        if (isMounted) {
          setIsLoadingStores(false);
        }
      }
    }

    void loadSupermarkets();

    return () => {
      isMounted = false;
    };
  }, [locationQuery, status]);

  useEffect(() => {
    if (status !== "authenticated") {
      return;
    }

    let isMounted = true;

    async function loadProductCounts() {
      try {
        const counts = await fetchSupermarketProductCounts();

        if (!isMounted) {
          return;
        }

        setProductCounts(counts);
      } catch {
        if (!isMounted) {
          return;
        }

        // Keep the supermarket list visible even if the offer counts load later or fail.
        setProductCounts({});
      }
    }

    void loadProductCounts();

    return () => {
      isMounted = false;
    };
  }, [status]);

  const locationRegion = useMemo(
    () => ({
      latitude: userLocation?.latitude ?? FALLBACK_REGION.latitude,
      longitude: userLocation?.longitude ?? FALLBACK_REGION.longitude,
      latitudeDelta: FALLBACK_REGION.latitudeDelta,
      longitudeDelta: FALLBACK_REGION.longitudeDelta,
    }),
    [userLocation?.latitude, userLocation?.longitude],
  );

  useEffect(() => {
    if (!userLocation || hasCenteredMapOnUserLocation) {
      return;
    }

    setMapRegion(locationRegion);
    setMapRenderKey((current) => current + 1);
    setHasCenteredMapOnUserLocation(true);
  }, [hasCenteredMapOnUserLocation, locationRegion, userLocation]);

  const mapBounds = useMemo(
    () => getBoundsFromRegion(mapRegion),
    [mapRegion],
  );

  const handleMapRegionChange = useCallback((nextRegion: MapRegion) => {
    setMapRegion((currentRegion) =>
      areMapRegionsClose(currentRegion, nextRegion) ? currentRegion : nextRegion,
    );
  }, []);

  useEffect(() => {
    if (status !== "authenticated" || viewMode !== "map") {
      return;
    }

    let isMounted = true;

    async function loadMapSupermarkets() {
      try {
        const mapResults = await fetchSupermarketsInBounds(
          {
            ...mapBounds,
            limit: HOME_MAP_MARKER_LIMIT,
          },
          locationQuery,
        );

        if (!isMounted) {
          return;
        }

        setMapSupermarkets(mapResults);
        setSelectedStoreId((current) => {
          if (!mapResults.length || mapResults.some((store) => store.id === current)) {
            return current;
          }

          return mapResults[0]?.id ?? current;
        });
      } catch {
        if (!isMounted) {
          return;
        }

        setMapSupermarkets([]);
      }
    }

    void loadMapSupermarkets();

    return () => {
      isMounted = false;
    };
  }, [locationQuery, mapBounds, status, viewMode]);

  const getStoreDistanceKm = useMemo(
    () => (latitude: number, longitude: number) =>
      getDistanceKm(locationRegion.latitude, locationRegion.longitude, latitude, longitude),
    [locationRegion.latitude, locationRegion.longitude],
  );

  const getSupermarketDistanceKm = useMemo(
    () => (store: Pick<Supermarket, "distance_km" | "latitude" | "longitude">) =>
      store.distance_km ?? getStoreDistanceKm(store.latitude, store.longitude),
    [getStoreDistanceKm],
  );
  const getMapStoreDistanceKm = useMemo(
    () => (store: Pick<SupermarketMapMarker, "distance_km" | "latitude" | "longitude">) =>
      store.distance_km ?? getStoreDistanceKm(store.latitude, store.longitude),
    [getStoreDistanceKm],
  );

  const sortedStores = useMemo(
    () =>
      [...supermarkets].sort(
        (left, right) => getSupermarketDistanceKm(left) - getSupermarketDistanceKm(right),
      ),
    [getSupermarketDistanceKm, supermarkets],
  );

  const mapStoreSource = useMemo<MapSupermarketDisplay[]>(
    () =>
      mapSupermarkets.length > 0
        ? mapSupermarkets
        : sortedStores.map((store) => ({
            id: store.id,
            name: store.name,
            address: store.address,
            latitude: store.latitude,
            longitude: store.longitude,
            logo_url: store.logo_url,
            rating: store.rating ?? null,
            offers_count: productCounts[store.id] ?? 0,
            distance_km: store.distance_km ?? getStoreDistanceKm(store.latitude, store.longitude),
          })),
    [getStoreDistanceKm, mapSupermarkets, productCounts, sortedStores],
  );

  const markers = useMemo<MapMarker[]>(
    () =>
      mapStoreSource.map((store, index) => ({
        id: store.id,
        name: store.name,
        shortLabel: getShortLabel(store.name),
        coordinate: { latitude: store.latitude, longitude: store.longitude },
        accentColor: ACCENT_COLORS[index % ACCENT_COLORS.length],
        logoUrl: store.logo_url,
      })),
    [mapStoreSource],
  );

  const selectedMapStore =
    mapStoreSource.find((store) => store.id === selectedStoreId) ?? mapStoreSource[0];
  const nearbyMapStores = useMemo(
    () =>
      [...mapStoreSource]
        .sort((left, right) => getMapStoreDistanceKm(left) - getMapStoreDistanceKm(right))
        .slice(0, 6),
    [getMapStoreDistanceKm, mapStoreSource],
  );

  function openStore(storeId: string) {
    setSelectedStoreId(storeId);
    router.push(`/supermarket/${storeId}` as never);
  }

  async function recenterMap() {
    const nextLocation = await requestUserLocation();
    setMapRegion(
      nextLocation
        ? {
            ...locationRegion,
            latitude: nextLocation.latitude,
            longitude: nextLocation.longitude,
          }
        : locationRegion,
    );
    setMapRenderKey((current) => current + 1);
  }

  if (status === "loading") {
    return (
      <SafeAreaView style={styles.loadingScreen} edges={["top", "left", "right", "bottom"]}>
        <ActivityIndicator size="large" color="#5D9B68" />
      </SafeAreaView>
    );
  }

  if (status !== "authenticated" || !user) {
    return <Redirect href="/login" />;
  }

  return (
    <SafeAreaView style={styles.screen} edges={["left", "right"]}>
      <StatusBar style="light" />
      {isLoadingStores ? (
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color="#5D9B68" />
        </View>
      ) : loadError ? (
        <View style={styles.loadingCard}>
          <Text style={styles.errorTitle}>Nu am putut incarca supermarketurile</Text>
          <Text style={styles.errorText}>{loadError}</Text>
        </View>
      ) : (
        <View style={styles.deviceShell}>
          {viewMode === "list" ? (
            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              <View style={[styles.hero, { paddingTop: insets.top + 18 }]}>
                <View style={styles.heroBlobLeft} />
                <View style={styles.heroBlobRight} />
                <View style={styles.heroTopRow}>
                  <View>
                    <Text style={styles.brandTitle}>
                      <Text style={styles.brandGreen}>SMART</Text>
                      <Text style={styles.brandOrange}>BITE</Text>
                    </Text>
                    <Text style={styles.heroSubtitle}>Alege inteligent. Traieste sustenabil</Text>
                  </View>
                </View>

                <Pressable onPress={() => router.push("/search" as never)} style={styles.searchWrap}>
                  <Feather color="#D9B6A1" name="search" size={18} />
                  <Text style={styles.searchPlaceholder}>Cauta produse...</Text>
                </Pressable>
              </View>

              <View style={styles.body}>
                <View style={styles.modeSwitch}>
                  <Pressable
                    onPress={() => setViewMode("list")}
                    style={[styles.modeSwitchButton, styles.modeSwitchButtonActive]}
                  >
                    <Text style={[styles.modeSwitchText, styles.modeSwitchTextActive]}>Lista</Text>
                  </Pressable>
                  <Pressable onPress={() => setViewMode("map")} style={styles.modeSwitchButton}>
                    <Text style={styles.modeSwitchText}>Harta</Text>
                  </Pressable>
                </View>

                <View style={styles.resultsRow}>
                  <View style={styles.resultsPill}>
                    <Text style={styles.resultsText}>{`${supermarkets.length} MAGAZINE`}</Text>
                  </View>
                </View>

                <View style={styles.cards}>
                  {sortedStores.map((store, index) => (
                    <SupermarketCard
                      key={store.id}
                      address={store.address}
                      distanceKm={getSupermarketDistanceKm(store)}
                      logoUrl={store.logo_url}
                      name={store.name}
                      offersCount={productCounts[store.id]}
                      // TODO: Add rating once the backend exposes supermarket ratings/reviews.
                      accentColor={ACCENT_COLORS[index % ACCENT_COLORS.length]}
                      logoLabel={getShortLabel(store.name)}
                      onPress={() => openStore(store.id)}
                      style={store.id === selectedStoreId ? styles.selectedCard : undefined}
                    />
                  ))}
                </View>
              </View>
            </ScrollView>
          ) : (
            <View style={styles.mapScreen}>
              <MapSupermarketCard
                key={`map-${mapRenderKey}`}
                title="Harta Magazine"
                markers={markers}
                selectedMarkerId={selectedStoreId}
                initialRegion={mapRegion}
                onMarkerPress={setSelectedStoreId}
                onRegionChangeComplete={handleMapRegionChange}
                fullScreen
                topInset={insets.top}
                userCoordinate={
                  userLocation
                    ? { latitude: userLocation.latitude, longitude: userLocation.longitude }
                    : null
                }
              />

              <View style={[styles.mapTopControls, { top: insets.top + 70 }]}>
                <Pressable onPress={() => setViewMode("list")} style={styles.mapIconButton}>
                  <Feather color="#4E8B5B" name="list" size={18} />
                </Pressable>
                <Pressable onPress={() => router.push("/search" as never)} style={styles.mapIconButton}>
                  <Feather color="#4E8B5B" name="search" size={18} />
                </Pressable>
                <Pressable
                  disabled={isRequestingLocation}
                  onPress={() => void recenterMap()}
                  style={styles.mapIconButton}
                >
                  {isRequestingLocation ? (
                    <ActivityIndicator color="#4E8B5B" size="small" />
                  ) : (
                    <Feather color="#4E8B5B" name="crosshair" size={18} />
                  )}
                </Pressable>
              </View>

              <View style={styles.mapBottomSheet}>
                <View style={styles.mapSheetHandle} />

                <View style={styles.mapSheetHeader}>
                  <View style={styles.mapSheetTitleBlock}>
                    <Text style={styles.mapSheetEyebrow}>
                      {`${mapStoreSource.length} magazine in zona`}
                    </Text>
                    <Text numberOfLines={1} style={styles.mapSheetTitle}>
                      {selectedMapStore ? selectedMapStore.name : "Alege un magazin"}
                    </Text>
                    <Text numberOfLines={1} style={styles.mapSheetAddress}>
                      {selectedMapStore?.address ?? "Selecteaza un pin de pe harta"}
                    </Text>
                  </View>

                  <Pressable
                    disabled={!selectedMapStore}
                    onPress={() => selectedMapStore && openStore(selectedMapStore.id)}
                    style={[styles.mapDetailsButton, !selectedMapStore && styles.mapDetailsButtonDisabled]}
                  >
                    <Feather color="#FFFDF6" name="arrow-right" size={17} />
                  </Pressable>
                </View>

                {selectedMapStore ? (
                  <View style={styles.mapStatsRow}>
                    <View style={styles.mapStatPill}>
                      <Feather color="#4E8B5B" name="navigation" size={13} />
                      <Text style={styles.mapStatText}>
                        {formatDistance(getMapStoreDistanceKm(selectedMapStore))}
                      </Text>
                    </View>
                    <View style={styles.mapStatPill}>
                      <Feather color="#A65E34" name="tag" size={13} />
                      <Text style={styles.mapStatText}>
                        {`${selectedMapStore.offers_count} oferte`}
                      </Text>
                    </View>
                  </View>
                ) : null}

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.nearbyStoreStrip}
                >
                  {nearbyMapStores.map((store) => {
                    const isSelected = store.id === selectedStoreId;

                    return (
                      <Pressable
                        key={store.id}
                        onPress={() => setSelectedStoreId(store.id)}
                        style={[styles.nearbyStoreChip, isSelected && styles.nearbyStoreChipActive]}
                      >
                        <Text
                          numberOfLines={1}
                          style={[styles.nearbyStoreName, isSelected && styles.nearbyStoreNameActive]}
                        >
                          {store.name}
                        </Text>
                        <Text style={styles.nearbyStoreDistance}>
                          {formatDistance(getMapStoreDistanceKm(store))}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            </View>
          )}

          <BottomNavBar
            activeTab={viewMode === "list" ? "home" : "map"}
            onTabPress={(tab) => {
              if (tab === "search") {
                router.push("/search" as never);
                return;
              }

              if (tab === "cart") {
                router.push("/shopping-cart" as never);
                return;
              }

              setViewMode(tab === "home" ? "list" : "map");
            }}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

function getShortLabel(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function getDistanceKm(
  fromLatitude: number,
  fromLongitude: number,
  toLatitude: number,
  toLongitude: number,
) {
  const distanceInKm = haversineDistanceKm(fromLatitude, fromLongitude, toLatitude, toLongitude);

  return Number(distanceInKm.toFixed(1));
}

function getBoundsFromRegion(region: {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}) {
  return {
    south: clampCoordinate(region.latitude - region.latitudeDelta / 2, -90, 90),
    north: clampCoordinate(region.latitude + region.latitudeDelta / 2, -90, 90),
    west: clampCoordinate(region.longitude - region.longitudeDelta / 2, -180, 180),
    east: clampCoordinate(region.longitude + region.longitudeDelta / 2, -180, 180),
  };
}

function clampCoordinate(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function areMapRegionsClose(left: MapRegion, right: MapRegion) {
  return (
    Math.abs(left.latitude - right.latitude) < 0.0005 &&
    Math.abs(left.longitude - right.longitude) < 0.0005 &&
    Math.abs(left.latitudeDelta - right.latitudeDelta) < 0.001 &&
    Math.abs(left.longitudeDelta - right.longitudeDelta) < 0.001
  );
}

function formatDistance(distanceKm: number) {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }

  return `${distanceKm.toFixed(1)} km`;
}

function haversineDistanceKm(
  fromLatitude: number,
  fromLongitude: number,
  toLatitude: number,
  toLongitude: number,
) {
  const earthRadiusKm = 6371;
  const latitudeDelta = toRadians(toLatitude - fromLatitude);
  const longitudeDelta = toRadians(toLongitude - fromLongitude);
  const a =
    Math.sin(latitudeDelta / 2) * Math.sin(latitudeDelta / 2) +
    Math.cos(toRadians(fromLatitude)) *
      Math.cos(toRadians(toLatitude)) *
      Math.sin(longitudeDelta / 2) *
      Math.sin(longitudeDelta / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F4F0E6",
  },
  loadingScreen: {
    flex: 1,
    backgroundColor: "#F4F0E6",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingCard: {
    flex: 1,
    backgroundColor: "#FFF9F0",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  errorTitle: {
    color: "#423B35",
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
  },
  errorText: {
    marginTop: 8,
    color: "#8A6C58",
    fontSize: 14,
    textAlign: "center",
  },
  deviceShell: {
    flex: 1,
    backgroundColor: "#F4F0E6",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 0,
  },
  hero: {
    ...authHeroStyles.hero,
    paddingHorizontal: 14,
    paddingBottom: 22,
  },
  heroBlobLeft: {
    ...authHeroStyles.heroCircleSmall,
    left: -18,
    top: undefined,
    bottom: -28,
  },
  heroBlobRight: {
    ...authHeroStyles.heroCircleLarge,
    right: -10,
    top: -24,
    bottom: undefined,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  brandGreen: {
    color: "#2E8B57",
  },
  brandOrange: {
    color: "#D7682B",
  },
  heroSubtitle: {
    marginTop: 4,
    color: "#FFF8F0",
    fontSize: 12,
    fontWeight: "600",
  },
  searchWrap: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 16,
    backgroundColor: "#FFFDFC",
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  searchPlaceholder: {
    flex: 1,
    color: "#715E54",
    fontSize: 15,
    fontWeight: "600",
  },
  body: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 16,
  },
  modeSwitch: {
    alignSelf: "flex-end",
    flexDirection: "row",
    gap: 4,
    borderRadius: 999,
    backgroundColor: "#EEE3D5",
    padding: 4,
    marginBottom: 10,
  },
  modeSwitchButton: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  modeSwitchButtonActive: {
    backgroundColor: "#FFFFFF",
  },
  modeSwitchText: {
    color: "#917B6F",
    fontSize: 12,
    fontWeight: "800",
  },
  modeSwitchTextActive: {
    color: "#4E8B5B",
  },
  resultsRow: {
    marginBottom: 12,
  },
  resultsPill: {
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: "#F1C790",
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  resultsText: {
    color: "#8E5428",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.6,
  },
  cards: {
    gap: 14,
  },
  selectedCard: {
    borderColor: "#E8BF82",
    shadowColor: "#C59154",
    shadowOpacity: 0.18,
  },
  mapScreen: {
    flex: 1,
  },
  mapTopControls: {
    position: "absolute",
    right: 14,
    gap: 8,
  },
  mapIconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.94)",
    shadowColor: "#80572D",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
    elevation: 5,
  },
  mapBottomSheet: {
    position: "absolute",
    right: 12,
    bottom: 14,
    left: 12,
    borderRadius: 24,
    backgroundColor: "rgba(255,253,249,0.97)",
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 14,
    shadowColor: "#80572D",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  mapSheetHandle: {
    alignSelf: "center",
    width: 42,
    height: 4,
    borderRadius: 999,
    backgroundColor: "#E2CDB8",
    marginBottom: 10,
  },
  mapSheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  mapSheetTitleBlock: {
    flex: 1,
    minWidth: 0,
  },
  mapSheetEyebrow: {
    color: "#A65E34",
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  mapSheetTitle: {
    color: "#3D342D",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 2,
  },
  mapSheetAddress: {
    color: "#837268",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  mapDetailsButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4E8B5B",
  },
  mapDetailsButtonDisabled: {
    opacity: 0.45,
  },
  mapStatsRow: {
    marginTop: 12,
    flexDirection: "row",
    gap: 8,
  },
  mapStatPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    backgroundColor: "#F3E6D8",
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  mapStatText: {
    color: "#5A473B",
    fontSize: 12,
    fontWeight: "900",
  },
  nearbyStoreStrip: {
    gap: 8,
    paddingTop: 12,
  },
  nearbyStoreChip: {
    minWidth: 132,
    maxWidth: 168,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EAD7C1",
    backgroundColor: "#FFF9F0",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  nearbyStoreChipActive: {
    borderColor: "#4E8B5B",
    backgroundColor: "#EDF6EF",
  },
  nearbyStoreName: {
    color: "#3D342D",
    fontSize: 12,
    fontWeight: "900",
  },
  nearbyStoreNameActive: {
    color: "#3E7C4E",
  },
  nearbyStoreDistance: {
    marginTop: 4,
    color: "#8B7668",
    fontSize: 11,
    fontWeight: "800",
  },
});
