import { Feather } from "@expo/vector-icons";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomNavBar } from "../components/BottomNavBar";
import { MapSupermarketCard, type MapMarker } from "../components/MapSupermarketCard";
import { SupermarketCard } from "../components/SupermarketCard";
import { authHeroStyles } from "../constants/auth-hero-styles";
import { useAuth } from "../context/auth-context";
import {
  fetchSupermarketProducts,
  fetchSupermarkets,
  type Supermarket,
} from "../services/supermarkets";

const INITIAL_REGION = {
  // Temporary fallback centered on Cluj until the backend exposes the user's
  // actual location or a region tailored to the returned supermarket set.
  latitude: 46.7712,
  longitude: 23.6236,
  latitudeDelta: 0.12,
  longitudeDelta: 0.12,
};

const ACCENT_COLORS = ["#E06F34", "#E04935", "#4D8E6A", "#6B8E23", "#C26D3C"];

export default function HomeScreen() {
  const { view } = useLocalSearchParams<{ view?: string }>();
  const insets = useSafeAreaInsets();
  const { signOut, status, user } = useAuth();
  const [supermarkets, setSupermarkets] = useState<Supermarket[]>([]);
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});
  const [selectedStoreId, setSelectedStoreId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [loadError, setLoadError] = useState("");
  const [isLoadingStores, setIsLoadingStores] = useState(true);

  useEffect(() => {
    setViewMode(view === "map" ? "map" : "list");
  }, [view]);

  useEffect(() => {
    if (status !== "authenticated") {
      setIsLoadingStores(false);
      return;
    }

    let isMounted = true;

    async function loadSupermarkets() {
      setIsLoadingStores(true);
      setLoadError("");

      try {
        const supermarketList = await fetchSupermarkets();

        if (!isMounted) {
          return;
        }

        setSupermarkets(supermarketList);
        setSelectedStoreId((current) => current || supermarketList[0]?.id || "");

        const counts = await Promise.all(
          supermarketList.map(async (supermarket) => {
            const products = await fetchSupermarketProducts(supermarket.id);
            return [supermarket.id, products.length] as const;
          }),
        );

        if (!isMounted) {
          return;
        }

        setProductCounts(Object.fromEntries(counts));
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
  }, [status]);

  const filteredStores = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return supermarkets;
    }

    return supermarkets.filter(
      (store) =>
        store.name.toLowerCase().includes(normalizedQuery) ||
        store.address.toLowerCase().includes(normalizedQuery),
    );
  }, [searchQuery, supermarkets]);

  const markers = useMemo<MapMarker[]>(
    () =>
      supermarkets.map((store, index) => ({
        id: store.id,
        name: store.name,
        shortLabel: getShortLabel(store.name),
        coordinate: { latitude: store.latitude, longitude: store.longitude },
        accentColor: ACCENT_COLORS[index % ACCENT_COLORS.length],
        imageSource: store.logo_url ? { uri: store.logo_url } : undefined,
      })),
    [supermarkets],
  );

  // TODO: Harta Magazine is still in progress. The screen UI is in place,
  // but it still relies on the supermarket list response plus a temporary
  // fallback region until dedicated backend map/location endpoints exist.

  const sortedStores = useMemo(
    () =>
      [...filteredStores].sort((left, right) => {
        if (left.id === selectedStoreId) {
          return -1;
        }

        if (right.id === selectedStoreId) {
          return 1;
        }

        return getDistanceKm(left.latitude, left.longitude) - getDistanceKm(right.latitude, right.longitude);
      }),
    [filteredStores, selectedStoreId],
  );

  const selectedStore =
    filteredStores.find((store) => store.id === selectedStoreId) ?? filteredStores[0] ?? supermarkets[0];

  function openStore(storeId: string) {
    setSelectedStoreId(storeId);
    router.push(`/supermarket/${storeId}`);
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
                  <View style={styles.heroControls}>
                    <Pressable style={styles.heroSignOutButton} onPress={() => void signOut()}>
                      <Feather color="#A55D31" name="log-out" size={14} />
                      <Text style={styles.heroSignOutText}>Iesire</Text>
                    </Pressable>

                    <View style={styles.heroActionRow}>
                      <View style={styles.heroPill}>
                        <Feather color="#FFFDF6" name="navigation" size={12} />
                        <Text style={styles.heroPillText}>
                          {selectedStore ? `${getDistanceKm(selectedStore.latitude, selectedStore.longitude).toFixed(1)} km` : "--"}
                        </Text>
                      </View>
                      <Pressable style={styles.heroIconButton} onPress={() => setViewMode("map")}>
                        <Feather color="#FFFDF6" name="map" size={12} />
                      </Pressable>
                    </View>
                  </View>
                </View>

                <View style={styles.searchWrap}>
                  <Feather color="#D9B6A1" name="search" size={18} />
                  <TextInput
                    onChangeText={setSearchQuery}
                    placeholder="Cauta produse..."
                    placeholderTextColor="#D9B6A1"
                    style={styles.searchInput}
                    value={searchQuery}
                  />
                </View>
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
                    <Text style={styles.resultsText}>{`${filteredStores.length} MAGAZINE`}</Text>
                  </View>
                </View>

                <View style={styles.cards}>
                  {sortedStores.map((store, index) => (
                    <SupermarketCard
                      key={store.id}
                      address={store.address}
                      distanceKm={getDistanceKm(store.latitude, store.longitude)}
                      imageSource={store.logo_url ? { uri: store.logo_url } : undefined}
                      name={store.name}
                      offersCount={productCounts[store.id] ?? 0}
                      rating={4.2 + ((index + 1) % 4) * 0.3}
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
                title="Harta Magazine"
                markers={markers}
                selectedMarkerId={selectedStoreId}
                initialRegion={INITIAL_REGION}
                // The map still uses frontend-derived marker positions and selection.
                // If we add backend map/filter endpoints later, this view should switch
                // to server-driven regions, clustering, and map-specific search results.
                onMarkerPress={setSelectedStoreId}
                fullScreen
                topInset={insets.top}
              />
              <View style={styles.mapOverlay}>
                <Pressable onPress={() => setViewMode("list")} style={styles.backToListButton}>
                  <Feather color="#4E8B5B" name="list" size={16} />
                  <Text style={styles.backToListText}>Lista</Text>
                </Pressable>
                <Pressable
                  disabled={!selectedStore}
                  onPress={() => selectedStore && openStore(selectedStore.id)}
                  style={styles.selectedStoreButton}
                >
                  <Text style={styles.selectedStoreButtonText}>
                    {selectedStore ? selectedStore.name : "Selecteaza un magazin"}
                  </Text>
                </Pressable>
              </View>
            </View>
          )}

          <BottomNavBar
            activeTab={viewMode === "list" ? "home" : "map"}
            onTabPress={(tab) => setViewMode(tab === "home" ? "list" : "map")}
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

function getDistanceKm(latitude: number, longitude: number) {
  const distanceInKm =
    haversineDistanceKm(INITIAL_REGION.latitude, INITIAL_REGION.longitude, latitude, longitude);

  return Number(distanceInKm.toFixed(1));
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
  heroControls: {
    alignItems: "flex-end",
    gap: 10,
  },
  heroActionRow: {
    flexDirection: "row",
    gap: 8,
  },
  heroSignOutButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,251,246,0.94)",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  heroSignOutText: {
    color: "#A55D31",
    fontSize: 12,
    fontWeight: "800",
  },
  heroPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  heroPillText: {
    color: "#FFFDF6",
    fontSize: 11,
    fontWeight: "800",
  },
  heroIconButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.22)",
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
  searchInput: {
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
  mapOverlay: {
    position: "absolute",
    right: 14,
    bottom: 18,
    left: 14,
    gap: 10,
  },
  backToListButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.94)",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  backToListText: {
    color: "#4E8B5B",
    fontSize: 13,
    fontWeight: "800",
  },
  selectedStoreButton: {
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.94)",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  selectedStoreButtonText: {
    color: "#3D342D",
    fontSize: 15,
    fontWeight: "800",
  },
});
