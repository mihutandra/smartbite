import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomNavBar } from "../../components/BottomNavBar";
import { fetchSupermarketProduct } from "../../services/supermarkets";
import { type SupermarketProduct } from "../../types/supermarket";
import {
  calculateDiscountPercentage,
  calculateSavings,
  formatCurrency,
  formatShortDate,
  getCategoryLabel,
} from "../../utils/product_detail";

export default function ProductDetailsScreen() {
  const insets = useSafeAreaInsets();
  const { id, supermarketId } = useLocalSearchParams<{ id?: string; supermarketId?: string }>();
  const [product, setProduct] = useState<SupermarketProduct | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isReserveNoticeVisible, setIsReserveNoticeVisible] = useState(false);

  useEffect(() => {
    if (typeof id !== "string") {
      return;
    }

    let isMounted = true;

    async function loadProduct() {
      setIsLoading(true);
      setLoadError("");

      try {
        const response = await fetchSupermarketProduct(id);

        if (!isMounted) {
          return;
        }

        setProduct(response);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setLoadError(
          error instanceof Error ? error.message : "Nu am putut incarca produsul selectat.",
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadProduct();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const discountPercentage = useMemo(
    () => (product ? calculateDiscountPercentage(product) : 0),
    [product],
  );
  const maxQuantity = Math.max(1, product?.stock_quantity ?? 1);

  function reserveProduct() {
    if (!product) {
      return;
    }

    setIsReserveNoticeVisible(true);
  }

  return (
    <SafeAreaView style={styles.screen} edges={["left", "right"]}>
      <StatusBar style="dark" />
      {isLoading ? (
        <View style={styles.centerState}>
          <ActivityIndicator color="#4F8C62" size="large" />
        </View>
      ) : loadError || !product ? (
        <View style={styles.centerState}>
          <Text style={styles.errorTitle}>Nu am putut incarca produsul</Text>
          <Text style={styles.errorText}>{loadError || "Produsul selectat nu exista."}</Text>
        </View>
      ) : (
        <View style={styles.contentShell}>
          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={[styles.topSection, { paddingTop: insets.top + 10 }]}>
              <Pressable onPress={() => router.back()} style={styles.backButton}>
                <Feather color="#7F4A25" name="arrow-left" size={18} />
              </Pressable>

              <View style={styles.heroImageWrap}>
                {product.product_image_url ? (
                  <Image source={{ uri: product.product_image_url }} style={styles.heroImage} resizeMode="contain" />
                ) : (
                  <View style={styles.imageFallback}>
                    <Text style={styles.imageFallbackText}>
                      {(product.product_name ?? "Produs").slice(0, 1).toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>

              {discountPercentage > 0 ? (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>{`%${discountPercentage} reducere`}</Text>
                </View>
              ) : null}
            </View>

            <View style={styles.panel}>
              <View style={styles.panelHandle} />

              <Text style={styles.productName}>{product.product_name ?? "Produs"}</Text>
              <Text style={styles.description}>
                {product.product_description?.trim() || "Descriere indisponibila pentru acest produs."}
              </Text>

              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{getCategoryLabel(product)}</Text>
              </View>

              <View style={styles.priceCard}>
                <View style={styles.priceRow}>
                  <Text style={styles.discountPrice}>{formatCurrency(product.discount_price, product.currency)}</Text>
                  <Text style={styles.originalPrice}>{formatCurrency(product.original_price, product.currency)}</Text>
                </View>
                <View style={styles.savingsBadge}>
                  <Text style={styles.savingsText}>{`Economisesti ${calculateSavings(product)} lei`}</Text>
                </View>
              </View>

              <InfoPanel
                icon="clock"
                label="Expira"
                value={formatShortDate(product.expiration_date)}
              />
              <InfoPanel
                icon="package"
                label="Stoc"
                value={`${product.stock_quantity} disponibile`}
              />

              <View style={styles.actionSection}>
                <View style={styles.actionRow}>
                  <View style={styles.quantityCard}>
                    <Pressable
                      onPress={() => setQuantity((current) => Math.max(1, current - 1))}
                      style={styles.quantityButton}
                    >
                      <Text style={styles.quantityButtonText}>-</Text>
                    </Pressable>
                    <Text style={styles.quantityValue}>{quantity}</Text>
                    <Pressable
                      onPress={() => setQuantity((current) => Math.min(maxQuantity, current + 1))}
                      style={[
                        styles.quantityButton,
                        quantity >= maxQuantity && styles.quantityButtonDisabled,
                      ]}
                    >
                      <Text style={styles.quantityButtonText}>+</Text>
                    </Pressable>
                  </View>

                  <Pressable onPress={reserveProduct} style={styles.reserveButton}>
                    <Feather color="#FFF8F0" name="shopping-bag" size={16} />
                    <Text style={styles.reserveButtonText}>Rezerva acum</Text>
                  </Pressable>
                </View>
              </View>
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
                router.push("/cart" as never);
                return;
              }

              if (typeof supermarketId === "string") {
                router.replace(`/supermarket/${supermarketId}` as never);
                return;
              }

              router.replace("/home?view=map" as never);
            }}
          />

          <Modal
            animationType="fade"
            transparent
            visible={isReserveNoticeVisible}
            onRequestClose={() => setIsReserveNoticeVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalCard}>
                <View style={styles.modalIconWrap}>
                  <Feather color="#FFF8F0" name="check" size={22} />
                </View>
                <Text style={styles.modalTitle}>Produs rezervat</Text>
                <Text style={styles.modalText}>
                  {`Ai adaugat ${quantity} x ${product.product_name ?? "produs"} in cos.`}
                </Text>

                <View style={styles.modalActions}>
                  <Pressable
                    onPress={() => setIsReserveNoticeVisible(false)}
                    style={styles.modalSecondaryButton}
                  >
                    <Text style={styles.modalSecondaryButtonText}>Ramai aici</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      setIsReserveNoticeVisible(false);
                      router.push("/cart" as never);
                    }}
                    style={styles.modalPrimaryButton}
                  >
                    <Text style={styles.modalPrimaryButtonText}>Mergi la cos</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      )}
    </SafeAreaView>
  );
}

function InfoPanel({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoPanel}>
      <View style={styles.infoIconWrap}>
        <Feather color="#FFFFFF" name={icon} size={16} />
      </View>
      <View style={styles.infoTextWrap}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "#F7F2E8",
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
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    paddingBottom: 16,
  },
  topSection: {
    position: "relative",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingBottom: 10,
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
  heroImageWrap: {
    height: 240,
    alignItems: "center",
    justifyContent: "center",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  imageFallback: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 28,
    backgroundColor: "#F9E2C9",
  },
  imageFallbackText: {
    color: "#A85928",
    fontSize: 80,
    fontWeight: "900",
  },
  discountBadge: {
    position: "absolute",
    bottom: -8,
    left: 18,
    borderRadius: 999,
    backgroundColor: "#D66C2D",
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  discountText: {
    color: "#FFF8F0",
    fontSize: 13,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  panel: {
    marginTop: 4,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 2,
    borderColor: "#EDBE78",
    backgroundColor: "#FFFDFC",
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 16,
    gap: 12,
  },
  panelHandle: {
    alignSelf: "center",
    width: 50,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#F0C67F",
    marginBottom: 6,
  },
  productName: {
    color: "#342B26",
    fontSize: 20,
    fontWeight: "900",
    lineHeight: 28,
  },
  description: {
    color: "#857366",
    fontSize: 14,
    lineHeight: 22,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: "#D66C2D",
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  categoryText: {
    color: "#FFF8F0",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  priceCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#C9D8B5",
    backgroundColor: "#EEF5E8",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    shadowColor: "#B5C59F",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 3,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    flexWrap: "wrap",
  },
  discountPrice: {
    color: "#327C4A",
    fontSize: 24,
    fontWeight: "900",
  },
  originalPrice: {
    color: "#B9998C",
    fontSize: 13,
    fontWeight: "800",
    textDecorationLine: "line-through",
    paddingBottom: 3,
  },
  savingsBadge: {
    borderRadius: 999,
    backgroundColor: "#D66C2D",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  savingsText: {
    color: "#FFF8F0",
    fontSize: 11,
    fontWeight: "900",
  },
  infoPanel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#F0B76F",
    backgroundColor: "#FFF7EE",
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  infoIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E18235",
    shadowColor: "#E4B37B",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 3,
  },
  infoTextWrap: {
    gap: 3,
  },
  infoLabel: {
    color: "#A56336",
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  infoValue: {
    color: "#322A25",
    fontSize: 16,
    fontWeight: "900",
  },
  actionSection: {
    marginTop: 4,
    borderRadius: 20,
    backgroundColor: "#FFF9F1",
    padding: 4,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  quantityCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#EEC179",
    backgroundColor: "#FFFDF8",
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  quantityButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    shadowColor: "#D5BA9A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 2,
  },
  quantityButtonDisabled: {
    opacity: 0.45,
  },
  quantityButtonText: {
    color: "#5D493D",
    fontSize: 18,
    fontWeight: "900",
  },
  quantityValue: {
    color: "#2F2824",
    fontSize: 18,
    fontWeight: "900",
    minWidth: 18,
    textAlign: "center",
  },
  reserveButton: {
    flex: 1,
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 18,
    backgroundColor: "#4F8C62",
    shadowColor: "#4F8C62",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 4,
  },
  reserveButtonText: {
    color: "#FFF8F0",
    fontSize: 17,
    fontWeight: "900",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(53, 38, 28, 0.42)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: "#EDBE78",
    backgroundColor: "#FFF9F2",
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 20,
    alignItems: "center",
    shadowColor: "#A76731",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.22,
    shadowRadius: 28,
    elevation: 8,
  },
  modalIconWrap: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4F8C62",
    shadowColor: "#4F8C62",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 4,
  },
  modalTitle: {
    marginTop: 16,
    color: "#342B26",
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
  },
  modalText: {
    marginTop: 10,
    color: "#7A685C",
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
  },
  modalActions: {
    marginTop: 22,
    width: "100%",
    gap: 10,
  },
  modalSecondaryButton: {
    minHeight: 50,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#EDBE78",
    backgroundColor: "#FFFDF8",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  modalSecondaryButtonText: {
    color: "#A15D33",
    fontSize: 15,
    fontWeight: "900",
  },
  modalPrimaryButton: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: "#D66C2D",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    shadowColor: "#D66C2D",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 4,
  },
  modalPrimaryButtonText: {
    color: "#FFF8F0",
    fontSize: 15,
    fontWeight: "900",
  },
});
