import { Feather } from "@expo/vector-icons";
import { Redirect, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import { BottomNavBar } from "../components/BottomNavBar";
import { API_BASE_URL } from "../constants/api";
import { useAuth } from "../context/auth-context";
import {
  confirmShoppingCart,
  fetchShoppingCart,
  fetchShoppingCartSavings,
  removeShoppingCartItem,
} from "../services/shopping-cart";
import { type ShoppingCartItem, type ShoppingCartSavings } from "../types/shopping-cart";
import { formatCurrency } from "../utils/product_detail";

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const { accessToken, status, user } = useAuth();
  const [cartItems, setCartItems] = useState<ShoppingCartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmedReservationId, setConfirmedReservationId] = useState("");
  const [cartSavings, setCartSavings] = useState<ShoppingCartSavings | null>(null);
  const [busyItemId, setBusyItemId] = useState("");
  const [error, setError] = useState("");

  const loadCart = useCallback(async () => {
    if (!accessToken) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const [items, savings] = await Promise.all([
        fetchShoppingCart(accessToken),
        fetchShoppingCartSavings(accessToken),
      ]);
      setCartItems(items);
      setCartSavings(savings);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Nu am putut incarca cosul.");
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (status === "authenticated") {
      void loadCart();
    }
  }, [loadCart, status]);

  const totals = useMemo(() => {
    return cartItems.reduce(
      (current, item) => {
        const quantity = item.quantity;
        const originalPrice = toNumber(item.original_price);
        const discountPrice = toNumber(item.discount_price);

        return {
          original: current.original + originalPrice * quantity,
          discounted: current.discounted + discountPrice * quantity,
        };
      },
      { original: 0, discounted: 0 },
    );
  }, [cartItems]);

  const savings = useMemo(() => {
    const hasBackendItemSavings = cartItems.some((item) => item.savings_per_unit !== null);

    if (hasBackendItemSavings) {
      return cartItems.reduce(
        (current, item) => current + toNumber(item.savings_per_unit) * item.quantity,
        0,
      );
    }

    if (cartSavings) {
      return toNumber(cartSavings.total_savings);
    }

    return Math.max(0, totals.original - totals.discounted);
  }, [cartItems, cartSavings, totals.discounted, totals.original]);
  const currency = cartSavings?.currency ?? cartItems.find((item) => item.currency)?.currency ?? "lei";
  const isCheckoutDisabled = cartItems.length === 0 || isConfirming || isLoading || Boolean(busyItemId);

  async function removeItem(itemId: string) {
    if (!accessToken) {
      return;
    }

    setBusyItemId(itemId);
    setError("");

    try {
      await removeShoppingCartItem(accessToken, itemId);
      setCartItems((currentItems) => currentItems.filter((item) => item.id !== itemId));
      setCartSavings(null);
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "Nu am putut elimina produsul.");
    } finally {
      setBusyItemId("");
    }
  }

  function updateItemQuantity(itemId: string, direction: "decrease" | "increase") {
    setCartSavings(null);
    setCartItems((currentItems) =>
      currentItems.map((item) => {
        if (item.id !== itemId) {
          return item;
        }

        const maxQuantity = Math.max(1, item.stock_quantity ?? item.quantity);
        const nextQuantity =
          direction === "increase"
            ? Math.min(maxQuantity, item.quantity + 1)
            : Math.max(1, item.quantity - 1);

        return {
          ...item,
          quantity: nextQuantity,
        };
      }),
    );
  }

  async function confirmReservation() {
    if (!accessToken || cartItems.length === 0) {
      return;
    }

    setIsConfirming(true);
    setError("");

    try {
      const reservation = await confirmShoppingCart(
        accessToken,
        cartItems.map((item) => ({
          cart_item_id: item.id,
          quantity: item.quantity,
        })),
      );

      setCartItems([]);
      setCartSavings(null);
      setConfirmedReservationId(reservation.id);
    } catch (confirmError) {
      setError(confirmError instanceof Error ? confirmError.message : "Nu am putut confirma rezervarea.");
    } finally {
      setIsConfirming(false);
    }
  }

  if (status === "loading") {
    return <View style={styles.loadingScreen} />;
  }

  if (status !== "authenticated" || !user) {
    return <Redirect href="/login" />;
  }

  return (
    <SafeAreaView style={styles.screen} edges={["left", "right"]}>
      <StatusBar style="light" />
      <View style={styles.shell}>
        <View style={[styles.hero, { paddingTop: insets.top + 18 }]}>
          <View style={styles.heroCircle} />
          <View style={styles.heroTitleRow}>
            <View style={styles.heroTitleGroup}>
              <Feather color="#FFF8F0" name="shopping-bag" size={24} />
              <Text style={styles.heroTitle}>Cosul tau</Text>
            </View>
            <View style={styles.countPill}>
              <Text style={styles.countText}>{`${cartItems.length} ${cartItems.length === 1 ? "produs" : "produse"}`}</Text>
            </View>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {isLoading ? (
            <View style={styles.centerState}>
              <ActivityIndicator color="#4E8B5B" size="large" />
            </View>
          ) : error ? (
            <View style={styles.feedbackCard}>
              <Text style={styles.feedbackTitle}>Nu am putut actualiza cosul</Text>
              <Text style={styles.feedbackText}>{error}</Text>
              <Pressable onPress={() => void loadCart()} style={styles.retryButton}>
                <Text style={styles.retryButtonText}>Reincearca</Text>
              </Pressable>
            </View>
          ) : cartItems.length === 0 ? (
            <View style={styles.feedbackCard}>
              <View style={styles.emptyIconWrap}>
                <Feather color="#4E8B5B" name="shopping-cart" size={28} />
              </View>
              <Text style={styles.feedbackTitle}>Cosul este gol</Text>
              <Text style={styles.feedbackText}>Adauga produse cu reducere si confirma rezervarea aici.</Text>
              <Pressable onPress={() => router.push("/search" as never)} style={styles.retryButton}>
                <Text style={styles.retryButtonText}>Cauta produse</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <View style={styles.itemsList}>
                {cartItems.map((item) => (
                  <CartItemCard
                    key={item.id}
                    item={item}
                    isBusy={isConfirming || busyItemId === item.id}
                    onDecrease={() => updateItemQuantity(item.id, "decrease")}
                    onIncrease={() => updateItemQuantity(item.id, "increase")}
                    onOpen={() =>
                      router.push({
                        pathname: "/product/[id]",
                        params: {
                          id: item.supermarket_product_id,
                          supermarketId: item.supermarket_id ?? undefined,
                        },
                      })
                    }
                    onRemove={() => void removeItem(item.id)}
                  />
                ))}
              </View>

              <View style={styles.savingsPanel}>
                <Text style={styles.savingsEyebrow}>Economii SmartBite!</Text>
                <Text style={styles.savingsSubtitle}>Beneficiezi de cele mai bune oferte.</Text>
                <Text style={styles.savingsValue}>{`${formatMoney(savings, currency)} economisiti`}</Text>
              </View>

              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Rezumat comanda</Text>
                <View style={styles.summaryDivider} />
                <SummaryRow label="Total" value={formatMoney(totals.original, currency)} muted />
                <SummaryRow label="Economii SmartBite" value={`-${formatMoney(savings, currency)}`} accent />
                <View style={styles.summaryDivider} />
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total de plata</Text>
                  <Text style={styles.totalValue}>{formatMoney(totals.discounted, currency)}</Text>
                </View>
              </View>
            </>
          )}
        </ScrollView>

        <View style={[styles.checkoutWrap, { paddingBottom: Math.max(insets.bottom, 14) }]}>
          <Pressable
            disabled={isCheckoutDisabled}
            onPress={() => void confirmReservation()}
            style={[
              styles.confirmButton,
              isCheckoutDisabled && styles.confirmButtonDisabled,
            ]}
          >
            <Text style={styles.confirmText}>
              {isConfirming ? "Se confirma..." : "Confirma rezervarea"}
            </Text>
            <View style={styles.confirmAmountPill}>
              <Text style={styles.confirmAmount}>{formatMoney(totals.discounted, currency)}</Text>
              <Feather color="#FFF8F0" name="arrow-right" size={18} />
            </View>
          </Pressable>
        </View>

        <BottomNavBar
          activeTab="cart"
          onTabPress={(tab) => {
            if (tab === "home") {
              router.replace("/home" as never);
              return;
            }

            if (tab === "map") {
              router.replace("/home?view=map" as never);
              return;
            }

            if (tab === "search") {
              router.push("/search" as never);
              return;
            }

            if (tab === "profile") {
              router.push("/profile" as never);
            }
          }}
        />

        <Modal
          animationType="fade"
          onRequestClose={() => setConfirmedReservationId("")}
          transparent
          visible={Boolean(confirmedReservationId)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.successModalCard}>
              <View style={styles.successIconWrap}>
                <Feather color="#FFF8F0" name="check" size={24} />
              </View>
              <Text style={styles.successTitle}>Rezervare confirmata</Text>
              <Text style={styles.successText}>
                {confirmedReservationId
                  ? `Am creat rezervarea #${confirmedReservationId.slice(0, 8)}. Produsele te asteapta in magazin.`
                  : "Rezervarea a fost creata."}
              </Text>

              <View style={styles.successActions}>
                <Pressable
                  onPress={() => {
                    setConfirmedReservationId("");
                    router.replace("/home" as never);
                  }}
                  style={styles.successSecondaryButton}
                >
                  <Text style={styles.successSecondaryText}>Acasa</Text>
                </Pressable>

                <Pressable
                  onPress={() => setConfirmedReservationId("")}
                  style={styles.successPrimaryButton}
                >
                  <Text style={styles.successPrimaryText}>Inchide</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

function CartItemCard({
  item,
  isBusy,
  onDecrease,
  onIncrease,
  onOpen,
  onRemove,
}: {
  item: ShoppingCartItem;
  isBusy: boolean;
  onDecrease: () => void;
  onIncrease: () => void;
  onOpen: () => void;
  onRemove: () => void;
}) {
  const discountPercentage = getDiscountPercentage(item);
  const currency = item.currency ?? "lei";
  const maxQuantity = Math.max(1, item.stock_quantity ?? item.quantity);
  const canDecrease = item.quantity > 1;
  const canIncrease = item.quantity < maxQuantity;
  const imageUri = item.product_id
    ? `${API_BASE_URL}/api/products/${item.product_id}/image`
    : item.product_image_url;

  return (
    <View style={styles.itemCard}>
      <Pressable disabled={isBusy} onPress={onOpen} style={styles.itemOpenArea}>
        <View style={styles.itemImageWrap}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} resizeMode="cover" style={styles.itemImage} />
          ) : (
            <View style={styles.itemImageFallback}>
              <Text style={styles.itemImageFallbackText}>
                {(item.product_name ?? "P").slice(0, 1).toUpperCase()}
              </Text>
            </View>
          )}
          {discountPercentage > 0 ? (
            <View style={styles.discountBadge}>
              <Text style={styles.discountBadgeText}>{`-${discountPercentage}%`}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.itemDetails}>
          <Text numberOfLines={2} style={styles.itemName}>{item.product_name ?? "Produs"}</Text>
          <Text numberOfLines={1} style={styles.storeName}>{item.supermarket_name ?? "SmartBite Market"}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.discountPrice}>{formatMoney(toNumber(item.discount_price), currency)}</Text>
            <Text style={styles.originalPrice}>{formatMoney(toNumber(item.original_price), currency)}</Text>
          </View>
        </View>
      </Pressable>

      <View style={styles.itemActions}>
        <Pressable disabled={isBusy} onPress={onRemove} style={styles.deleteButton}>
          {isBusy ? (
            <ActivityIndicator color="#C8967B" size="small" />
          ) : (
            <Feather color="#D0A18D" name="trash-2" size={17} />
          )}
        </Pressable>
        <View style={styles.quantityControl}>
          <Pressable
            disabled={!canDecrease || isBusy}
            onPress={onDecrease}
            style={[styles.quantityButton, (!canDecrease || isBusy) && styles.quantityButtonDisabled]}
          >
            <Feather color="#A65E34" name="minus" size={12} />
          </Pressable>
          <Text style={styles.quantityText}>{`Buc: ${item.quantity}`}</Text>
          <Pressable
            disabled={!canIncrease || isBusy}
            onPress={onIncrease}
            style={[styles.quantityButton, (!canIncrease || isBusy) && styles.quantityButtonDisabled]}
          >
            <Feather color="#A65E34" name="plus" size={12} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function SummaryRow({
  label,
  value,
  accent,
  muted,
}: {
  label: string;
  value: string;
  accent?: boolean;
  muted?: boolean;
}) {
  return (
    <View style={styles.summaryRow}>
      <Text style={[styles.summaryLabel, accent && styles.summaryLabelAccent]}>{label}</Text>
      <Text style={[styles.summaryValue, accent && styles.summaryValueAccent, muted && styles.summaryValueMuted]}>
        {value}
      </Text>
    </View>
  );
}

function toNumber(value: string | number | null | undefined) {
  const numericValue = typeof value === "number" ? value : Number.parseFloat(value ?? "0");
  return Number.isFinite(numericValue) ? numericValue : 0;
}

function formatMoney(value: number, currency: string) {
  return formatCurrency(value.toFixed(2), currency || "lei");
}

function getDiscountPercentage(item: ShoppingCartItem) {
  const originalPrice = toNumber(item.original_price);
  const discountPrice = toNumber(item.discount_price);

  if (originalPrice <= 0 || discountPrice >= originalPrice) {
    return 0;
  }

  return Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    backgroundColor: "#F8F5EE",
  },
  screen: {
    flex: 1,
    backgroundColor: "#F8F5EE",
  },
  shell: {
    flex: 1,
    backgroundColor: "#F8F5EE",
  },
  hero: {
    overflow: "hidden",
    paddingHorizontal: 20,
    paddingBottom: 26,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    backgroundColor: "#F28B31",
    shadowColor: "#B86E2B",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 6,
  },
  heroCircle: {
    position: "absolute",
    top: -46,
    left: -20,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(178, 128, 65, 0.22)",
  },
  heroTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  heroTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexShrink: 1,
  },
  heroTitle: {
    color: "#FFF8F0",
    fontSize: 24,
    fontWeight: "900",
  },
  countPill: {
    borderRadius: 999,
    backgroundColor: "#FFF8F0",
    paddingHorizontal: 18,
    paddingVertical: 12,
    shadowColor: "#A05C2D",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 4,
  },
  countText: {
    color: "#C65F32",
    fontSize: 12,
    fontWeight: "900",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 22,
    paddingBottom: 24,
    gap: 24,
  },
  centerState: {
    minHeight: 280,
    alignItems: "center",
    justifyContent: "center",
  },
  itemsList: {
    gap: 16,
  },
  itemCard: {
    minHeight: 118,
    flexDirection: "row",
    gap: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#F0DFC8",
    backgroundColor: "#FFFDFC",
    padding: 12,
    shadowColor: "#C19A70",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 4,
  },
  itemOpenArea: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    gap: 14,
  },
  itemImageWrap: {
    width: 88,
    height: 88,
    borderRadius: 14,
    backgroundColor: "#F8DDBF",
  },
  itemImage: {
    width: "100%",
    height: "100%",
    borderRadius: 14,
  },
  itemImageFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  itemImageFallbackText: {
    color: "#A85928",
    fontSize: 34,
    fontWeight: "900",
  },
  discountBadge: {
    position: "absolute",
    top: 0,
    right: -2,
    borderRadius: 999,
    backgroundColor: "#DF7440",
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  discountBadgeText: {
    color: "#FFF8F0",
    fontSize: 10,
    fontWeight: "900",
  },
  itemDetails: {
    flex: 1,
    minWidth: 0,
    paddingTop: 2,
    gap: 9,
  },
  itemName: {
    color: "#302923",
    fontSize: 15,
    fontWeight: "900",
    lineHeight: 20,
  },
  storeName: {
    color: "#3D7E55",
    fontSize: 12,
    fontWeight: "900",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    flexWrap: "wrap",
    gap: 8,
  },
  discountPrice: {
    color: "#347949",
    fontSize: 16,
    fontWeight: "900",
  },
  originalPrice: {
    color: "#B9998C",
    fontSize: 11,
    fontWeight: "900",
    textDecorationLine: "line-through",
    paddingBottom: 2,
  },
  itemActions: {
    width: 88,
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  deleteButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8EEE6",
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "#F0B76F",
    backgroundColor: "#FFF7EE",
    paddingHorizontal: 6,
    paddingVertical: 5,
  },
  quantityButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  quantityButtonDisabled: {
    opacity: 0.36,
  },
  quantityText: {
    color: "#342B26",
    fontSize: 11,
    fontWeight: "900",
    minWidth: 38,
    textAlign: "center",
  },
  savingsPanel: {
    minHeight: 174,
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#4E8B5B",
    paddingHorizontal: 22,
    shadowColor: "#4E8B5B",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 6,
  },
  savingsEyebrow: {
    color: "#FFF8F0",
    fontSize: 18,
    fontWeight: "900",
  },
  savingsSubtitle: {
    marginTop: 10,
    color: "#DDEBDE",
    fontSize: 13,
    fontWeight: "800",
  },
  savingsValue: {
    marginTop: 16,
    maxWidth: 250,
    color: "#FFF8F0",
    fontSize: 32,
    fontWeight: "900",
    lineHeight: 38,
  },
  summaryCard: {
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#F0DFC8",
    backgroundColor: "#FFFDFC",
    padding: 20,
    shadowColor: "#C19A70",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 4,
  },
  summaryTitle: {
    color: "#342B26",
    fontSize: 19,
    fontWeight: "900",
  },
  summaryDivider: {
    height: 2,
    backgroundColor: "#F0B76F",
    marginVertical: 14,
  },
  summaryRow: {
    minHeight: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  summaryLabel: {
    color: "#6E6157",
    fontSize: 14,
    fontWeight: "800",
  },
  summaryLabelAccent: {
    color: "#347949",
    fontWeight: "900",
  },
  summaryValue: {
    color: "#342B26",
    fontSize: 14,
    fontWeight: "900",
  },
  summaryValueAccent: {
    color: "#347949",
  },
  summaryValueMuted: {
    color: "#7C6F66",
    textDecorationLine: "line-through",
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  totalLabel: {
    color: "#342B26",
    fontSize: 19,
    fontWeight: "900",
  },
  totalValue: {
    color: "#347949",
    fontSize: 19,
    fontWeight: "900",
  },
  checkoutWrap: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 2,
    borderBottomWidth: 0,
    borderColor: "#F0B76F",
    backgroundColor: "#FFFDFC",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  confirmButton: {
    minHeight: 66,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    borderRadius: 14,
    backgroundColor: "#347949",
    paddingHorizontal: 20,
    shadowColor: "#347949",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 16,
    elevation: 4,
  },
  confirmButtonDisabled: {
    backgroundColor: "#A9B9A9",
    shadowOpacity: 0,
    elevation: 0,
  },
  confirmText: {
    flex: 1,
    color: "#FFF8F0",
    fontSize: 16,
    fontWeight: "900",
  },
  confirmAmountPill: {
    minWidth: 112,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.22)",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  confirmAmount: {
    color: "#FFF8F0",
    fontSize: 15,
    fontWeight: "900",
  },
  feedbackCard: {
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#F0DFC8",
    backgroundColor: "#FFFDFC",
    padding: 22,
    shadowColor: "#C19A70",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 4,
  },
  emptyIconWrap: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF4EB",
    marginBottom: 14,
  },
  feedbackTitle: {
    color: "#342B26",
    fontSize: 19,
    fontWeight: "900",
    textAlign: "center",
  },
  feedbackText: {
    marginTop: 8,
    color: "#7A685C",
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 18,
    borderRadius: 999,
    backgroundColor: "#F28B31",
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  retryButtonText: {
    color: "#FFF8F0",
    fontSize: 14,
    fontWeight: "900",
  },
  modalOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(53, 38, 28, 0.42)",
    paddingHorizontal: 24,
  },
  successModalCard: {
    width: "100%",
    maxWidth: 360,
    alignItems: "center",
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "#F0B76F",
    backgroundColor: "#FFF9F2",
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 20,
    shadowColor: "#A76731",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.22,
    shadowRadius: 28,
    elevation: 8,
  },
  successIconWrap: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#347949",
    shadowColor: "#347949",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 4,
  },
  successTitle: {
    marginTop: 16,
    color: "#342B26",
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
  },
  successText: {
    marginTop: 10,
    color: "#7A685C",
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
  },
  successActions: {
    width: "100%",
    flexDirection: "row",
    gap: 10,
    marginTop: 22,
  },
  successSecondaryButton: {
    flex: 1,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#F0B76F",
    backgroundColor: "#FFFDF8",
    paddingHorizontal: 14,
  },
  successSecondaryText: {
    color: "#A65E34",
    fontSize: 15,
    fontWeight: "900",
  },
  successPrimaryButton: {
    flex: 1,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "#347949",
    paddingHorizontal: 14,
    shadowColor: "#347949",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 4,
  },
  successPrimaryText: {
    color: "#FFF8F0",
    fontSize: 15,
    fontWeight: "900",
  },
});
