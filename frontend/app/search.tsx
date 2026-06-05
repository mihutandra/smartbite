import { Feather } from "@expo/vector-icons";
import { Redirect, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomNavBar } from "../components/BottomNavBar";
import { useAuth } from "../context/auth-context";
import {
  fetchAllSupermarketCatalogProducts,
  fetchAllSupermarkets,
} from "../services/supermarkets";
import { type Supermarket, type SupermarketProduct } from "../types/supermarket";
import { formatCurrency } from "../utils/product_detail";

type SearchResultGroup = {
  supermarket: Supermarket;
  products: SupermarketProduct[];
};

const PREVIEW_PRODUCT_COUNT = 2;

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const { status, user } = useAuth();
  const [query, setQuery] = useState("");
  const [supermarkets, setSupermarkets] = useState<Supermarket[]>([]);
  const [allProducts, setAllProducts] = useState<SupermarketProduct[]>([]);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (status !== "authenticated" || !user) {
      return;
    }

    let isMounted = true;

    async function loadInitialCatalog() {
      setIsBootstrapping(true);
      setLoadError("");

      try {
        const [supermarketList, catalogProducts] = await Promise.all([
          fetchAllSupermarkets(),
          fetchAllSupermarketCatalogProducts(),
        ]);

        if (!isMounted) {
          return;
        }

        setSupermarkets(supermarketList);
        setAllProducts(catalogProducts);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setLoadError(
          error instanceof Error ? error.message : "Nu am putut incarca datele pentru cautare.",
        );
      } finally {
        if (isMounted) {
          setIsBootstrapping(false);
        }
      }
    }

    void loadInitialCatalog();

    return () => {
      isMounted = false;
    };
  }, [status, user]);

  const productsBySupermarket = useMemo(() => {
    const map = new Map<string, SupermarketProduct[]>();

    allProducts.forEach((product) => {
      const currentProducts = map.get(product.supermarket_id) ?? [];
      currentProducts.push(product);
      map.set(product.supermarket_id, currentProducts);
    });

    return map;
  }, [allProducts]);

  const results = useMemo<SearchResultGroup[]>(() => {
    const normalizedQuery = normalizeSearchValue(query);

    if (!normalizedQuery) {
      return supermarkets.map((supermarket) => ({
        supermarket,
        products: (productsBySupermarket.get(supermarket.id) ?? []).slice(0, PREVIEW_PRODUCT_COUNT),
      }));
    }

    const matchedProducts = allProducts.filter((product) =>
      [
        product.product_name,
        product.product_description,
        product.product_brand,
        product.category_name,
        product.supermarket_name,
      ].some((value) => matchesQuery(value, normalizedQuery)),
    );

    const matchedProductsBySupermarket = new Map<string, SupermarketProduct[]>();

    matchedProducts.forEach((product) => {
      const currentProducts = matchedProductsBySupermarket.get(product.supermarket_id) ?? [];

      if (currentProducts.length < PREVIEW_PRODUCT_COUNT) {
        currentProducts.push(product);
      }

      matchedProductsBySupermarket.set(product.supermarket_id, currentProducts);
    });

    return supermarkets
      .filter((supermarket) => {
        if (matchedProductsBySupermarket.has(supermarket.id)) {
          return true;
        }

        return (
          matchesQuery(supermarket.name, normalizedQuery) ||
          matchesQuery(supermarket.address, normalizedQuery)
        );
      })
      .map((supermarket) => ({
        supermarket,
        products:
          matchedProductsBySupermarket.get(supermarket.id) ??
          (productsBySupermarket.get(supermarket.id) ?? []).slice(0, PREVIEW_PRODUCT_COUNT),
      }));
  }, [allProducts, productsBySupermarket, query, supermarkets]);

  const resultCountLabel = useMemo(() => {
    const count = results.length;
    return `${count} ${count === 1 ? "rezultat" : "rezultate"}`;
  }, [results.length]);

  if (status === "loading") {
    return <View style={styles.loadingScreen} />;
  }

  if (status !== "authenticated" || !user) {
    return <Redirect href="/login" />;
  }

  return (
    <SafeAreaView style={styles.screen} edges={["left", "right"]}>
      <StatusBar style="light" />
      <View style={[styles.hero, { paddingTop: insets.top + 14 }]}>
        <View style={styles.heroBlobLeft} />
        <View style={styles.heroBlobRight} />

        <View style={styles.heroTextBlock}>
          <View style={styles.heroTitleRow}>
            <Text style={styles.heroTitlePrimary}>CAUTA</Text>
            <Text style={styles.heroTitleSecondary}>OFERTE</Text>
          </View>
          <Text style={styles.heroSubtitle}>Gaseste ce cauti rapid si usor</Text>
        </View>

        <View style={styles.searchInputWrap}>
          <Feather color="#D3B8A4" name="search" size={18} />
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={setQuery}
            placeholder="Cauta supermarket sau produs..."
            placeholderTextColor="#D3B8A4"
            style={styles.searchInput}
            value={query}
          />
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsLabel}>{resultCountLabel}</Text>
          {isBootstrapping ? (
            <ActivityIndicator color="#4E8B5B" size="small" />
          ) : null}
        </View>

        {loadError ? (
          <View style={styles.feedbackCard}>
            <Text style={styles.feedbackTitle}>Nu am putut incarca rezultatele</Text>
            <Text style={styles.feedbackText}>{loadError}</Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.resultsContent}
          >
            {!isBootstrapping && !results.length ? (
              <View style={styles.feedbackCard}>
                <Text style={styles.feedbackTitle}>Nu am gasit rezultate</Text>
                <Text style={styles.feedbackText}>
                  Incearca alt nume de produs sau alt supermarket.
                </Text>
              </View>
            ) : null}

            {results.map((group) => (
              <View key={group.supermarket.id} style={styles.resultCard}>
                <View style={styles.resultCardHeader}>
                  <View style={styles.resultTextBlock}>
                    <Text style={styles.storeName}>{group.supermarket.name}</Text>
                    <Text style={styles.storeAddress}>{group.supermarket.address}</Text>
                  </View>

                  <Pressable
                    onPress={() => router.push(`/supermarket/${group.supermarket.id}` as never)}
                    style={styles.viewProductsButton}
                  >
                    <Text style={styles.viewProductsText}>Vezi produse</Text>
                    <Feather color="#A65E34" name="arrow-right" size={16} />
                  </Pressable>
                </View>

                <View style={styles.productPreviewRow}>
                  {group.products.map((product) => (
                    <Pressable
                      key={product.id}
                      onPress={() =>
                        router.push({
                          pathname: "/product/[id]",
                          params: { id: product.id, supermarketId: product.supermarket_id },
                        })
                      }
                      style={styles.productPreviewCard}
                    >
                      <View style={styles.productImageWrap}>
                        {product.product_image_url ? (
                          <Image
                            source={{ uri: product.product_image_url }}
                            style={styles.productImage}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={styles.productImageFallback}>
                            <Text style={styles.productImageFallbackText}>
                              {(product.product_name ?? "Produs").slice(0, 1).toUpperCase()}
                            </Text>
                          </View>
                        )}
                      </View>

                      <Text numberOfLines={2} style={styles.productName}>
                        {product.product_name ?? "Produs"}
                      </Text>
                      <Text style={styles.productPrice}>
                        {formatCurrency(product.discount_price, product.currency)}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      <BottomNavBar
        activeTab="search"
        onTabPress={(tab) => {
          if (tab === "home") {
            router.replace("/home" as never);
            return;
          }

          if (tab === "map") {
            router.replace("/home?view=map" as never);
            return;
          }

          if (tab === "cart") {
            router.push("/shopping-cart" as never);
          }
        }}
      />
    </SafeAreaView>
  );
}

function matchesQuery(value: string | null | undefined, query: string) {
  return normalizeSearchValue(value).includes(query);
}

function normalizeSearchValue(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ß/g, "ss")
    .toLocaleLowerCase()
    .trim();
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    backgroundColor: "#F8F5EE",
  },
  screen: {
    flex: 1,
    backgroundColor: "#FBF7EF",
  },
  hero: {
    overflow: "hidden",
    paddingHorizontal: 24,
    paddingBottom: 30,
    backgroundColor: "#F28B31",
  },
  heroBlobLeft: {
    position: "absolute",
    top: -28,
    left: -26,
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: "rgba(255, 210, 154, 0.26)",
  },
  heroBlobRight: {
    position: "absolute",
    right: -18,
    bottom: -32,
    width: 94,
    height: 94,
    borderRadius: 47,
    backgroundColor: "rgba(180, 170, 103, 0.38)",
  },
  heroTextBlock: {
    gap: 6,
  },
  heroTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  heroTitlePrimary: {
    color: "#18724D",
    fontSize: 24,
    fontWeight: "900",
  },
  heroTitleSecondary: {
    color: "#BF5E32",
    fontSize: 24,
    fontWeight: "900",
    marginLeft: 2,
  },
  heroSubtitle: {
    color: "#FFF7ED",
    fontSize: 13,
    fontWeight: "700",
  },
  searchInputWrap: {
    marginTop: 16,
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 18,
    backgroundColor: "#FFFDFC",
    paddingHorizontal: 16,
    shadowColor: "#B56F2E",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    color: "#43352C",
    fontSize: 16,
    fontWeight: "600",
    paddingVertical: 12,
  },
  body: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 22,
  },
  resultsHeader: {
    minHeight: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  resultsLabel: {
    color: "#A6653A",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 2.2,
    textTransform: "uppercase",
  },
  resultsContent: {
    gap: 18,
    paddingTop: 14,
    paddingBottom: 24,
  },
  resultCard: {
    borderRadius: 28,
    borderWidth: 2,
    borderColor: "#EFE1CD",
    backgroundColor: "#FFFDFC",
    padding: 18,
    shadowColor: "#C19A70",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 4,
  },
  resultCardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 14,
  },
  resultTextBlock: {
    flex: 1,
    gap: 8,
  },
  storeName: {
    color: "#312924",
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 24,
  },
  storeAddress: {
    color: "#7D6A5E",
    fontSize: 14,
    lineHeight: 20,
  },
  viewProductsButton: {
    minWidth: 124,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "#EDBE78",
    backgroundColor: "#FFFDF8",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  viewProductsText: {
    color: "#A65E34",
    fontSize: 14,
    fontWeight: "900",
  },
  productPreviewRow: {
    marginTop: 18,
    flexDirection: "row",
    gap: 14,
  },
  productPreviewCard: {
    flex: 1,
    minWidth: 0,
    overflow: "hidden",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#F0DFC8",
    backgroundColor: "#FFFDFC",
    paddingBottom: 14,
  },
  productImageWrap: {
    height: 106,
    backgroundColor: "#F9E4CB",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  productImageFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5C58F",
  },
  productImageFallbackText: {
    color: "#A85928",
    fontSize: 34,
    fontWeight: "900",
  },
  productName: {
    minHeight: 46,
    color: "#2F2924",
    fontSize: 14,
    fontWeight: "900",
    lineHeight: 20,
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  productPrice: {
    color: "#347949",
    fontSize: 14,
    fontWeight: "900",
    paddingHorizontal: 12,
    paddingTop: 6,
  },
  feedbackCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#ECDCC6",
    backgroundColor: "#FFFDFC",
    padding: 22,
  },
  feedbackTitle: {
    color: "#342D28",
    fontSize: 18,
    fontWeight: "900",
  },
  feedbackText: {
    marginTop: 8,
    color: "#7A685C",
    fontSize: 14,
    lineHeight: 21,
  },
});
