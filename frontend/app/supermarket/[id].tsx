import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomNavBar } from "../../components/BottomNavBar";
import { ProductCard } from "../../components/ProductCard";
import { RemoteLogo } from "../../components/RemoteLogo";
import { useLocation } from "../../context/location-context";
import {
  fetchAllSupermarketProducts,
  fetchSupermarketDetails,
} from "../../services/supermarkets";
import { type Supermarket, type SupermarketProduct } from "../../types/supermarket";
import { getSupermarketLogoUrls } from "../../utils/images";
import { getCategoryLabel } from "../../utils/product_detail";

const FALLBACK_REGION = {
  latitude: 46.7712,
  longitude: 23.6236,
};

export default function SupermarketProductsScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { userLocation } = useLocation();
  const [supermarket, setSupermarket] = useState<Supermarket | null>(null);
  const [products, setProducts] = useState<SupermarketProduct[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("Toate");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (typeof id !== "string") {
      setIsLoading(false);
      setLoadError("Magazinul selectat este invalid.");
      return;
    }

    let isMounted = true;
    const supermarketId = id;

    async function loadData() {
      setIsLoading(true);
      setLoadError("");

      try {
        const [supermarketResponse, productsResponse] = await Promise.all([
          fetchSupermarketDetails(supermarketId),
          fetchAllSupermarketProducts(supermarketId),
        ]);

        if (!isMounted) {
          return;
        }

        setSupermarket(supermarketResponse);
        setProducts(productsResponse);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setLoadError(
          error instanceof Error ? error.message : "Nu am putut incarca produsele magazinului.",
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadData();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const categories = useMemo(() => {
    const values = Array.from(new Set(products.map((product) => getCategoryLabel(product))));
    return ["Toate", ...values];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const categoryProducts =
      selectedCategory === "Toate"
        ? products
        : products.filter((product) => getCategoryLabel(product) === selectedCategory);

    return categoryProducts;
  }, [products, selectedCategory]);

  const displayedRows = useMemo(() => {
    const rows: SupermarketProduct[][] = [];

    for (let index = 0; index < filteredProducts.length; index += 2) {
      rows.push(filteredProducts.slice(index, index + 2));
    }

    return rows;
  }, [filteredProducts]);

  const distanceKm = supermarket
    ? getDistanceKm(
        userLocation?.latitude ?? FALLBACK_REGION.latitude,
        userLocation?.longitude ?? FALLBACK_REGION.longitude,
        supermarket.latitude,
        supermarket.longitude,
      ).toFixed(1)
    : "--";
  const logoUrls = supermarket ? getSupermarketLogoUrls(supermarket.name, supermarket.logo_url) : [];

  return (
    <SafeAreaView style={styles.screen} edges={["left", "right"]}>
      <StatusBar style="light" />
      {isLoading ? (
        <View style={styles.centerState}>
          <ActivityIndicator color="#4F8C62" size="large" />
        </View>
      ) : loadError ? (
        <View style={styles.centerState}>
          <Text style={styles.errorTitle}>Nu am putut incarca magazinul</Text>
          <Text style={styles.errorText}>{loadError}</Text>
        </View>
      ) : (
        <View style={styles.contentShell}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <View style={[styles.hero, { paddingTop: insets.top + 14 }]}>
              <View style={styles.heroBlobLeft} />
              <View style={styles.heroBlobRight} />

              <View style={styles.storeCard}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                  <Feather color="#7F4A25" name="arrow-left" size={18} />
                </Pressable>

                <View style={styles.storeInfo}>
                  <View style={styles.storeTextBlock}>
                    <Text style={styles.storeName}>{supermarket?.name ?? "Supermarket"}</Text>
                    <Text style={styles.storeAddress}>{supermarket?.address ?? "Adresa indisponibila"}</Text>
                  </View>

                  <View style={styles.logoFrame}>
                    {logoUrls.length ? (
                      <RemoteLogo
                        fallback={
                          <View style={styles.logoFallback}>
                            <Text style={styles.logoFallbackText}>{getStoreInitials(supermarket?.name ?? "SM")}</Text>
                          </View>
                        }
                        height={70}
                        urls={logoUrls}
                        width={70}
                        style={styles.logoImage}
                      />
                    ) : (
                      <View style={styles.logoFallback}>
                        <Text style={styles.logoFallbackText}>{getStoreInitials(supermarket?.name ?? "SM")}</Text>
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.statsRow}>
                  <InfoChip color="#E49B4C" icon="star" label="4.5" />
                  <InfoChip color="#5C9064" icon="clock" label={`${distanceKm} km`} />
                </View>
              </View>
            </View>

            <View style={styles.body}>
              <Text style={styles.sectionLabel}>Categorii</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryRow}
              >
                {categories.map((category) => {
                  const isSelected = selectedCategory === category;

                  return (
                    <Pressable
                      key={category}
                      onPress={() => setSelectedCategory(category)}
                      style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
                    >
                      <Text style={[styles.categoryChipText, isSelected && styles.categoryChipTextActive]}>
                        {category}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              <View style={styles.productsHeader}>
                <Text style={styles.productsCount}>{`${filteredProducts.length} produse`}</Text>
              </View>

              {filteredProducts.length ? (
                <View style={styles.grid}>
                  {displayedRows.map((row, rowIndex) => (
                    <View key={`row-${rowIndex}`} style={styles.gridRow}>
                      {row.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          onPress={() =>
                            router.push({
                              pathname: "/product/[id]",
                              params: { id: product.id, supermarketId: product.supermarket_id },
                            })
                          }
                        />
                      ))}
                      {row.length === 1 ? <View style={styles.gridSpacer} /> : null}
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyTitle}>Nu exista produse in aceasta categorie</Text>
                  <Text style={styles.emptyText}>Incearca alta categorie sau revino mai tarziu.</Text>
                </View>
              )}
            </View>
          </ScrollView>

          <BottomNavBar
            activeTab="map"
            onTabPress={(tab) => {
              if (tab === "home") {
                router.replace("/home" as never);
                return;
              }

              if (tab === "search") {
                router.push("/search" as never);
                return;
              }

              if (tab === "cart") {
                router.push("/shopping-cart" as never);
                return;
              }

              router.replace("/home?view=map" as never);
            }}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

function InfoChip({
  color,
  icon,
  label,
}: {
  color: string;
  icon: keyof typeof Feather.glyphMap;
  label: string;
}) {
  return (
    <View style={[styles.infoChip, { backgroundColor: `${color}18` }]}>
      <Feather color={color} name={icon} size={13} />
      <Text style={[styles.infoChipText, { color }]}>{label}</Text>
    </View>
  );
}

function getStoreInitials(name: string) {
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
    backgroundColor: "#F7F2E8",
  },
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  errorTitle: {
    color: "#3A3029",
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
  },
  errorText: {
    marginTop: 8,
    color: "#876D5D",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 21,
  },
  contentShell: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  hero: {
    overflow: "hidden",
    paddingHorizontal: 14,
    paddingBottom: 26,
    backgroundColor: "#F3953D",
    shadowColor: "#B96F2F",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 6,
  },
  heroBlobLeft: {
    position: "absolute",
    top: -12,
    left: -48,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(246, 204, 158, 0.42)",
  },
  heroBlobRight: {
    position: "absolute",
    right: -26,
    bottom: -44,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(161, 153, 84, 0.42)",
  },
  storeCard: {
    borderRadius: 30,
    backgroundColor: "#FFF9F3",
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 16,
    shadowColor: "#BC8146",
    shadowOffset: { width: 0, height: 9 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 4,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF4E2",
    shadowColor: "#C89562",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 3,
  },
  storeInfo: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  storeTextBlock: {
    flex: 1,
    gap: 8,
  },
  storeName: {
    color: "#7C3515",
    fontSize: 22,
    fontWeight: "900",
    lineHeight: 31,
  },
  storeAddress: {
    color: "#8E7A6D",
    fontSize: 14,
    fontWeight: "500",
  },
  logoFrame: {
    width: 84,
    height: 84,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "#F0B462",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  logoImage: {
    width: 70,
    height: 70,
  },
  logoFallback: {
    width: 62,
    height: 62,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF0E0",
  },
  logoFallbackText: {
    color: "#C5542B",
    fontSize: 24,
    fontWeight: "900",
  },
  statsRow: {
    marginTop: 16,
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  infoChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  infoChipText: {
    fontSize: 13,
    fontWeight: "800",
  },
  body: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 24,
    gap: 18,
  },
  sectionLabel: {
    color: "#CB652F",
    fontSize: 16,
    fontWeight: "900",
  },
  categoryRow: {
    gap: 10,
    paddingRight: 24,
  },
  categoryChip: {
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "#E8B35C",
    backgroundColor: "#FFFDF9",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  categoryChipActive: {
    backgroundColor: "#E98A33",
    borderColor: "#E98A33",
  },
  categoryChipText: {
    color: "#914A24",
    fontSize: 14,
    fontWeight: "800",
  },
  categoryChipTextActive: {
    color: "#FFF9EF",
  },
  productsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 10,
  },
  productsTitle: {
    color: "#312925",
    fontSize: 18,
    fontWeight: "900",
  },
  productsCount: {
    color: "#4F8C62",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 1.6,
    textTransform: "uppercase",
  },
  grid: {
    gap: 16,
    paddingBottom: 8,
  },
  gridRow: {
    flexDirection: "row",
    gap: 16,
  },
  gridSpacer: {
    flex: 1,
  },
  emptyState: {
    borderRadius: 24,
    backgroundColor: "#FFF9F2",
    padding: 22,
    borderWidth: 1,
    borderColor: "#F0D9BC",
  },
  emptyTitle: {
    color: "#3A3029",
    fontSize: 16,
    fontWeight: "800",
  },
  emptyText: {
    marginTop: 6,
    color: "#856E60",
    fontSize: 14,
    lineHeight: 20,
  },
});
