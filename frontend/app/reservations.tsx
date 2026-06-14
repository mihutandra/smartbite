import { Feather } from "@expo/vector-icons";
import { Redirect, router } from "expo-router";
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
import { BottomNavBar } from "../components/BottomNavBar";
import { useAuth } from "../context/auth-context";
import { cancelReservation, fetchMyReservations } from "../services/reservations";
import { type Reservation, type ReservationItem } from "../types/reservation";
import { formatCurrency } from "../utils/product_detail";

type ReservationView = "active" | "history";

export default function ReservationsScreen() {
  const insets = useSafeAreaInsets();
  const { accessToken, status, user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedView, setSelectedView] = useState<ReservationView>("active");
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingReservationId, setCancellingReservationId] = useState("");
  const [error, setError] = useState("");

  const loadReservations = useCallback(async () => {
    if (!accessToken) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetchMyReservations(accessToken);
      setReservations(response);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Nu am putut incarca rezervarile.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (status === "authenticated") {
      void loadReservations();
    }
  }, [loadReservations, status]);

  const activeReservations = useMemo(
    () => reservations.filter((reservation) => reservation.status === "active"),
    [reservations],
  );
  const previousReservations = useMemo(
    () => reservations.filter((reservation) => reservation.status !== "active"),
    [reservations],
  );
  const visibleReservations =
    selectedView === "active" ? activeReservations : previousReservations;

  async function cancelActiveReservation(reservationId: string) {
    if (!accessToken || cancellingReservationId) {
      return;
    }

    setCancellingReservationId(reservationId);
    setError("");

    try {
      const cancelledReservation = await cancelReservation(accessToken, reservationId);
      setReservations((currentReservations) =>
        currentReservations.map((reservation) =>
          reservation.id === cancelledReservation.id ? cancelledReservation : reservation,
        ),
      );
    } catch (cancelError) {
      setError(
        cancelError instanceof Error
          ? cancelError.message
          : "Nu am putut anula rezervarea.",
      );
    } finally {
      setCancellingReservationId("");
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
          <View style={styles.heroTitleRow}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Feather color="#FFF8F0" name="arrow-left" size={19} />
            </Pressable>
            <View style={styles.heroTitleGroup}>
              <Text style={styles.heroTitle}>Rezervarile mele</Text>
            </View>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.segmentedControl}>
            <Pressable
              onPress={() => setSelectedView("active")}
              style={[
                styles.segmentButton,
                selectedView === "active" && styles.segmentButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.segmentText,
                  selectedView === "active" && styles.segmentTextActive,
                ]}
              >
                Active
              </Text>
              <View style={styles.segmentCountPill}>
                <Text style={styles.segmentCountText}>{activeReservations.length}</Text>
              </View>
            </Pressable>
            <Pressable
              onPress={() => setSelectedView("history")}
              style={[
                styles.segmentButton,
                selectedView === "history" && styles.segmentButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.segmentText,
                  selectedView === "history" && styles.segmentTextActive,
                ]}
              >
                Anterioare
              </Text>
              <View style={styles.segmentCountPill}>
                <Text style={styles.segmentCountText}>{previousReservations.length}</Text>
              </View>
            </Pressable>
          </View>

          {isLoading ? (
            <View style={styles.centerState}>
              <ActivityIndicator color="#4E8B5B" size="large" />
            </View>
          ) : error ? (
            <View style={styles.feedbackCard}>
              <Feather color="#C4623B" name="alert-circle" size={28} />
              <Text style={styles.feedbackTitle}>Nu am putut incarca rezervarile</Text>
              <Text style={styles.feedbackText}>{error}</Text>
              <Pressable onPress={() => void loadReservations()} style={styles.retryButton}>
                <Text style={styles.retryButtonText}>Reincearca</Text>
              </Pressable>
            </View>
          ) : visibleReservations.length === 0 ? (
            <View style={styles.feedbackCard}>
              <Feather color="#4E8B5B" name="shopping-bag" size={28} />
              <Text style={styles.feedbackTitle}>
                {selectedView === "active"
                  ? "Nu ai rezervari active"
                  : "Nu ai rezervari anterioare"}
              </Text>
              <Text style={styles.feedbackText}>
                {selectedView === "active"
                  ? "Rezervarile confirmate vor aparea aici."
                  : "Rezervarile finalizate sau anulate vor fi listate aici."}
              </Text>
            </View>
          ) : (
            <View style={styles.reservationList}>
              {visibleReservations.map((reservation) => (
                <ReservationCard
                  key={reservation.id}
                  isCancelling={cancellingReservationId === reservation.id}
                  onCancel={() => void cancelActiveReservation(reservation.id)}
                  reservation={reservation}
                />
              ))}
            </View>
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

function ReservationCard({
  isCancelling,
  onCancel,
  reservation,
}: {
  isCancelling: boolean;
  onCancel: () => void;
  reservation: Reservation;
}) {
  const total = reservation.items.reduce(
    (current, item) => current + toNumber(item.reserved_price) * item.quantity,
    0,
  );
  const currency = reservation.items.find((item) => item.currency)?.currency ?? "lei";
  const firstItem = reservation.items[0];

  return (
    <View style={styles.reservationCard}>
      <View style={styles.reservationHeader}>
        <View>
          <Text style={styles.reservationCode}>{`#${reservation.id.slice(0, 8)}`}</Text>
          <Text style={styles.reservationDate}>{formatDate(reservation.created_at)}</Text>
        </View>
        <View style={[styles.statusPill, getStatusStyle(reservation.status)]}>
          <Text style={styles.statusText}>{getStatusLabel(reservation.status)}</Text>
        </View>
      </View>

      <View style={styles.itemPreviewRow}>
        <ReservationItemImage item={firstItem} />
        <View style={styles.previewTextWrap}>
          <Text numberOfLines={2} style={styles.previewTitle}>
            {getReservationTitle(reservation)}
          </Text>
          <Text numberOfLines={1} style={styles.previewSubtitle}>
            {getSupermarketLabel(reservation)}
          </Text>
        </View>
      </View>

      <View style={styles.itemList}>
        {reservation.items.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <Text numberOfLines={1} style={styles.itemName}>
              {item.product_name ?? "Produs"}
            </Text>
            <Text style={styles.itemMeta}>
              {`${item.quantity} x ${formatCurrency(item.reserved_price, item.currency)}`}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.reservationFooter}>
        <Text style={styles.totalLabel}>Total rezervare</Text>
        <Text style={styles.totalValue}>{formatCurrency(total.toFixed(2), currency)}</Text>
      </View>

      {reservation.status === "active" ? (
        <Pressable
          disabled={isCancelling}
          onPress={onCancel}
          style={[styles.cancelButton, isCancelling && styles.cancelButtonDisabled]}
        >
          {isCancelling ? (
            <ActivityIndicator color="#FFF8F0" size="small" />
          ) : (
            <Feather color="#FFF8F0" name="x-circle" size={16} />
          )}
          <Text style={styles.cancelButtonText}>
            {isCancelling ? "Se anuleaza..." : "Anuleaza rezervarea"}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function ReservationItemImage({ item }: { item: ReservationItem | undefined }) {
  if (item?.product_image_url) {
    return (
      <Image
        resizeMode="cover"
        source={{ uri: item.product_image_url }}
        style={styles.previewImage}
      />
    );
  }

  return (
    <View style={styles.previewFallback}>
      <Text style={styles.previewFallbackText}>
        {(item?.product_name ?? "R").slice(0, 1).toUpperCase()}
      </Text>
    </View>
  );
}

function getReservationTitle(reservation: Reservation) {
  const firstName = reservation.items[0]?.product_name ?? "Rezervare";
  const remainingCount = reservation.items.length - 1;

  if (remainingCount < 1) {
    return firstName;
  }

  return `${firstName} + ${remainingCount} ${remainingCount === 1 ? "produs" : "produse"}`;
}

function getSupermarketLabel(reservation: Reservation) {
  const supermarketName = reservation.items[0]?.supermarket_name;

  if (!supermarketName) {
    return `${reservation.items.length} ${reservation.items.length === 1 ? "produs" : "produse"}`;
  }

  return supermarketName;
}

function getStatusLabel(status: string) {
  switch (status) {
    case "active":
      return "Activa";
    case "cancelled":
      return "Anulata";
    case "completed":
      return "Finalizata";
    case "expired":
      return "Expirata";
    default:
      return "Inactiva";
  }
}

function getStatusStyle(status: string) {
  if (status === "active") {
    return styles.statusActive;
  }

  if (status === "cancelled" || status === "expired") {
    return styles.statusMuted;
  }

  return styles.statusComplete;
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Data indisponibila";
  }

  return new Intl.DateTimeFormat("ro-RO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function toNumber(value: string | number | null | undefined) {
  const numericValue = typeof value === "number" ? value : Number.parseFloat(value ?? "0");
  return Number.isFinite(numericValue) ? numericValue : 0;
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
  segmentedControl: {
    minHeight: 54,
    flexDirection: "row",
    gap: 8,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#F0DFC8",
    backgroundColor: "#FFFDFC",
    padding: 5,
  },
  segmentButton: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    paddingHorizontal: 10,
  },
  segmentButtonActive: {
    backgroundColor: "#4E8B5B",
  },
  segmentText: {
    color: "#7A685C",
    fontSize: 13,
    fontWeight: "900",
  },
  segmentTextActive: {
    color: "#FFF8F0",
  },
  segmentCountPill: {
    minWidth: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "rgba(255, 248, 240, 0.32)",
    paddingHorizontal: 7,
  },
  segmentCountText: {
    color: "#342B26",
    fontSize: 11,
    fontWeight: "900",
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
  reservationList: {
    gap: 14,
  },
  reservationCard: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#F0DFC8",
    backgroundColor: "#FFFDFC",
    padding: 14,
    shadowColor: "#C19A70",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 4,
  },
  reservationHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  reservationCode: {
    color: "#342B26",
    fontSize: 16,
    fontWeight: "900",
  },
  reservationDate: {
    marginTop: 3,
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
  itemPreviewRow: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  previewImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: "#F8DDBF",
  },
  previewFallback: {
    width: 64,
    height: 64,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8DDBF",
  },
  previewFallbackText: {
    color: "#A85928",
    fontSize: 28,
    fontWeight: "900",
  },
  previewTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  previewTitle: {
    color: "#302923",
    fontSize: 15,
    fontWeight: "900",
    lineHeight: 20,
  },
  previewSubtitle: {
    marginTop: 4,
    color: "#3D7E55",
    fontSize: 12,
    fontWeight: "900",
  },
  itemList: {
    marginTop: 14,
    gap: 8,
  },
  itemRow: {
    minHeight: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    borderRadius: 10,
    backgroundColor: "#FFF7EE",
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  itemName: {
    flex: 1,
    minWidth: 0,
    color: "#5D493D",
    fontSize: 12,
    fontWeight: "900",
  },
  itemMeta: {
    color: "#A65E34",
    fontSize: 12,
    fontWeight: "900",
  },
  reservationFooter: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    borderTopWidth: 2,
    borderTopColor: "#F0DFC8",
    paddingTop: 12,
  },
  totalLabel: {
    color: "#7A685C",
    fontSize: 13,
    fontWeight: "800",
  },
  totalValue: {
    color: "#347949",
    fontSize: 17,
    fontWeight: "900",
  },
  cancelButton: {
    minHeight: 48,
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    backgroundColor: "#C4623B",
    paddingHorizontal: 14,
    shadowColor: "#C4623B",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 3,
  },
  cancelButtonDisabled: {
    backgroundColor: "#B79D8E",
    shadowOpacity: 0,
    elevation: 0,
  },
  cancelButtonText: {
    color: "#FFF8F0",
    fontSize: 14,
    fontWeight: "900",
  },
});
