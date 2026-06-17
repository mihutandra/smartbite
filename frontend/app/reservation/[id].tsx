import { Feather } from "@expo/vector-icons";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomNavBar } from "../../components/BottomNavBar";
import { useAuth } from "../../context/auth-context";
import { fetchReservationDetail } from "../../services/reservations";
import { type Reservation, type ReservationItem } from "../../types/reservation";
import { formatCurrency, formatShortDate } from "../../utils/product_detail";
import {
  getReservationStatusLabel,
  getReservationStatusTone,
  toNumber,
  type ReservationStatusTone,
} from "../../utils/reservations";

export default function ReservationDetailsScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { accessToken, status, user } = useAuth();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReservation = useCallback(async () => {
    if (!accessToken || typeof id !== "string") {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetchReservationDetail(accessToken, id);
      setReservation(response);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Nu am putut incarca rezervarea.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, id]);

  useEffect(() => {
    if (status === "authenticated") {
      void loadReservation();
    }
  }, [loadReservation, status]);

  const total = useMemo(() => {
    if (!reservation) {
      return 0;
    }

    return reservation.items.reduce(
      (current, item) => current + toNumber(item.reserved_price) * item.quantity,
      0,
    );
  }, [reservation]);
  const currency = reservation?.items.find((item) => item.currency)?.currency ?? "lei";

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
          <View style={styles.heroTitleRow}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Feather color="#FFF8F0" name="arrow-left" size={19} />
            </Pressable>
            <View style={styles.heroTitleGroup}>
              <Text style={styles.heroTitle}>Detalii rezervare</Text>
              <Text style={styles.heroSubtitle}>
                Produsele rezervate si informatiile comenzii.
              </Text>
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
          ) : error || !reservation ? (
            <View style={styles.feedbackCard}>
              <Feather color="#C4623B" name="alert-circle" size={28} />
              <Text style={styles.feedbackTitle}>Nu am putut incarca rezervarea</Text>
              <Text style={styles.feedbackText}>
                {error || "Rezervarea selectata nu exista."}
              </Text>
              <Pressable onPress={() => void loadReservation()} style={styles.retryButton}>
                <Text style={styles.retryButtonText}>Reincearca</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <View style={styles.summaryCard}>
                <View style={styles.summaryHeader}>
                  <View>
                    <Text style={styles.reservationCode}>{`#${reservation.id.slice(0, 8)}`}</Text>
                    <Text style={styles.createdAt}>{formatDateTime(reservation.created_at)}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusPill,
                      getStatusStyle(getReservationStatusTone(reservation.status)),
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {getReservationStatusLabel(reservation.status)}
                    </Text>
                  </View>
                </View>

                <View style={styles.summaryDivider} />

                <DetailRow
                  icon="calendar"
                  label="Creata"
                  value={formatDateTime(reservation.created_at)}
                />
                <DetailRow
                  icon="refresh-cw"
                  label="Ultima actualizare"
                  value={formatDateTime(reservation.updated_at)}
                />
                <DetailRow
                  icon="shopping-bag"
                  label="Produse rezervate"
                  value={`${reservation.items.length}`}
                />
                <DetailRow
                  icon="credit-card"
                  label="Total rezervare"
                  value={formatCurrency(total.toFixed(2), currency)}
                />
              </View>

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Produse</Text>
              </View>

              <View style={styles.itemsList}>
                {reservation.items.map((item) => (
                  <ReservationProductCard key={item.id} item={item} />
                ))}
              </View>
            </>
          )}
        </ScrollView>

        <BottomNavBar
          activeTab="profile"
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

            if (tab === "cart") {
              router.push("/shopping-cart" as never);
              return;
            }

            router.replace("/profile" as never);
          }}
        />
      </View>
    </SafeAreaView>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailIcon}>
        <Feather color="#4E8B5B" name={icon} size={16} />
      </View>
      <View style={styles.detailTextWrap}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

function ReservationProductCard({ item }: { item: ReservationItem }) {
  const total = toNumber(item.reserved_price) * item.quantity;

  return (
    <View style={styles.productCard}>
      {item.product_image_url ? (
        <Image
          resizeMode="cover"
          source={{ uri: item.product_image_url }}
          style={styles.productImage}
        />
      ) : (
        <View style={styles.productImageFallback}>
          <Text style={styles.productImageFallbackText}>
            {(item.product_name ?? "P").slice(0, 1).toUpperCase()}
          </Text>
        </View>
      )}

      <View style={styles.productInfo}>
        <Text numberOfLines={2} style={styles.productName}>
          {item.product_name ?? "Produs"}
        </Text>
        <Text numberOfLines={1} style={styles.storeName}>
          {item.supermarket_name ?? "SmartBite Market"}
        </Text>
        <Text style={styles.expirationText}>
          {`Expira: ${item.expiration_date ? formatShortDate(item.expiration_date) : "Indisponibil"}`}
        </Text>
        <View style={styles.priceLine}>
          <Text style={styles.quantityText}>{`${item.quantity} buc.`}</Text>
          <Text style={styles.itemTotal}>{formatCurrency(total.toFixed(2), item.currency)}</Text>
        </View>
        <Text style={styles.unitPrice}>
          {`${formatCurrency(item.reserved_price, item.currency)} / buc.`}
        </Text>
      </View>
    </View>
  );
}

function getStatusStyle(tone: ReservationStatusTone) {
  if (tone === "active") {
    return styles.statusActive;
  }

  if (tone === "muted") {
    return styles.statusMuted;
  }

  return styles.statusComplete;
}

function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "Data indisponibila";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Data indisponibila";
  }

  return new Intl.DateTimeFormat("ro-RO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
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
    paddingHorizontal: 18,
    paddingBottom: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    backgroundColor: "#F28B31",
    shadowColor: "#B86E2B",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 6,
  },
  heroTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 248, 240, 0.22)",
  },
  heroTitleGroup: {
    flex: 1,
    minWidth: 0,
  },
  heroTitle: {
    color: "#FFF8F0",
    fontSize: 24,
    fontWeight: "900",
  },
  heroSubtitle: {
    marginTop: 4,
    color: "#FFE8CF",
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 18,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 106,
    gap: 16,
  },
  centerState: {
    minHeight: 280,
    alignItems: "center",
    justifyContent: "center",
  },
  feedbackCard: {
    minHeight: 220,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
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
  feedbackTitle: {
    marginTop: 14,
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
  summaryCard: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#F0DFC8",
    backgroundColor: "#FFFDFC",
    padding: 16,
    shadowColor: "#C19A70",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 4,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  reservationCode: {
    color: "#342B26",
    fontSize: 18,
    fontWeight: "900",
  },
  createdAt: {
    marginTop: 4,
    color: "#A98B73",
    fontSize: 12,
    fontWeight: "800",
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statusActive: {
    backgroundColor: "#4E8B5B",
  },
  statusComplete: {
    backgroundColor: "#D66C2D",
  },
  statusMuted: {
    backgroundColor: "#9D9086",
  },
  statusText: {
    color: "#FFF8F0",
    fontSize: 11,
    fontWeight: "900",
  },
  summaryDivider: {
    height: 2,
    backgroundColor: "#F0DFC8",
    marginVertical: 14,
  },
  detailRow: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 6,
  },
  detailIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF4EB",
  },
  detailTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  detailLabel: {
    color: "#A98B73",
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  detailValue: {
    marginTop: 3,
    color: "#342B26",
    fontSize: 14,
    fontWeight: "900",
  },
  sectionHeader: {
    marginTop: 4,
  },
  sectionTitle: {
    color: "#342B26",
    fontSize: 18,
    fontWeight: "900",
  },
  itemsList: {
    gap: 14,
  },
  productCard: {
    flexDirection: "row",
    gap: 12,
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
  productImage: {
    width: 86,
    height: 86,
    borderRadius: 13,
    backgroundColor: "#F8DDBF",
  },
  productImageFallback: {
    width: 86,
    height: 86,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8DDBF",
  },
  productImageFallbackText: {
    color: "#A85928",
    fontSize: 34,
    fontWeight: "900",
  },
  productInfo: {
    flex: 1,
    minWidth: 0,
    gap: 5,
  },
  productName: {
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
  expirationText: {
    color: "#8B7565",
    fontSize: 12,
    fontWeight: "800",
  },
  priceLine: {
    marginTop: 3,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  quantityText: {
    color: "#A65E34",
    fontSize: 12,
    fontWeight: "900",
  },
  itemTotal: {
    color: "#347949",
    fontSize: 15,
    fontWeight: "900",
  },
  unitPrice: {
    color: "#A98B73",
    fontSize: 11,
    fontWeight: "800",
  },
});
