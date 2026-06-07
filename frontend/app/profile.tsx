import { Feather } from "@expo/vector-icons";
import { Redirect, router } from "expo-router";
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
import { BottomNavBar } from "../components/BottomNavBar";
import { useAuth } from "../context/auth-context";
import { fetchProfileSavings } from "../services/profile";
import { fetchMyReservations } from "../services/reservations";
import { type Reservation } from "../types/reservation";
import { formatCurrency, formatShortDate } from "../utils/product_detail";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { accessToken, signOut, status, user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [savings, setSavings] = useState("0.00");
  const [savingsCurrency, setSavingsCurrency] = useState("RON");
  const [isLoadingReservations, setIsLoadingReservations] = useState(true);
  const [reservationsError, setReservationsError] = useState("");

  useEffect(() => {
    if (status !== "authenticated" || !accessToken) {
      setIsLoadingReservations(false);
      return;
    }

    const token = accessToken;
    let isMounted = true;

    async function loadReservations() {
      setIsLoadingReservations(true);
      setReservationsError("");

      try {
        const [reservationList, profileSavings] = await Promise.all([
          fetchMyReservations(token),
          fetchProfileSavings(token),
        ]);

        if (!isMounted) {
          return;
        }

        setReservations(reservationList);
        setSavings(profileSavings.total_savings);
        setSavingsCurrency(profileSavings.currency);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setReservationsError(
          error instanceof Error ? error.message : "Nu am putut incarca rezervarile.",
        );
      } finally {
        if (isMounted) {
          setIsLoadingReservations(false);
        }
      }
    }

    void loadReservations();

    return () => {
      isMounted = false;
    };
  }, [accessToken, status]);

  const visibleReservations = useMemo(() => reservations.slice(0, 3), [reservations]);

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

      <View style={styles.deviceShell}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={[styles.hero, { paddingTop: insets.top + 32 }]}>
            <View style={styles.heroCircle} />
            <View style={styles.profileRow}>
              <View style={styles.avatar}>
                <Feather color="#111111" name="user" size={48} />
              </View>
              <View style={styles.profileTextBlock}>
                <Text numberOfLines={1} style={styles.userName}>
                  {user.name}
                </Text>
                <View style={styles.memberRow}>
                  <View style={styles.memberDot} />
                  <Text style={styles.memberText}>SmartBite Member</Text>
                </View>
              </View>
            </View>

            <View style={styles.savingsCard}>
              <Text style={styles.savingsAmount}>{formatCurrency(savings, savingsCurrency)}</Text>
              <Text style={styles.savingsLabel}>ECONOMISITI</Text>
            </View>
          </View>

          <View style={styles.body}>
            <SectionLabel label="CONT" />
            <View style={styles.cardGroup}>
              <ProfileAction
                icon="user"
                iconColor="#477D60"
                iconBackground="#EAF4EE"
                label="Informatii personale"
                onPress={() => router.push("/personal-info" as never)}
              />
            </View>

            <View style={styles.sectionHeaderRow}>
              <SectionLabel label="REZERVARILE MELE" />
              <Text style={styles.sectionCount}>{`${reservations.length} total`}</Text>
            </View>
            <View style={styles.reservationGroup}>
              {isLoadingReservations ? (
                <View style={styles.reservationFeedback}>
                  <ActivityIndicator color="#5D9B68" size="small" />
                  <Text style={styles.reservationFeedbackText}>Se incarca rezervarile...</Text>
                </View>
              ) : reservationsError ? (
                <View style={styles.reservationFeedback}>
                  <Feather color="#C4623B" name="alert-circle" size={18} />
                  <Text style={styles.reservationFeedbackText}>{reservationsError}</Text>
                </View>
              ) : visibleReservations.length ? (
                visibleReservations.map((reservation) => (
                  <ReservationCard key={reservation.id} reservation={reservation} />
                ))
              ) : (
                <View style={styles.reservationFeedback}>
                  <Feather color="#5D9B68" name="calendar" size={18} />
                  <Text style={styles.reservationFeedbackText}>Nu ai rezervari active momentan.</Text>
                </View>
              )}
            </View>

            <SectionLabel label="SUPORT" />
            <View style={styles.cardGroup}>
              <ProfileAction
                icon="log-out"
                iconColor="#C4623B"
                iconBackground="#FFF2E4"
                label="Deconectare"
                onPress={() => void signOut()}
              />
              <View style={styles.divider} />
              <ProfileAction
                icon="help-circle"
                iconColor="#A65E34"
                iconBackground="#FFF2E4"
                label="Sterge Cont"
                onPress={() => undefined}
              />
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerVersion}>SmartBite v1.0.0</Text>
              <Text style={styles.footerTagline}>Alege inteligent. Traieste sustenabil</Text>
            </View>
          </View>
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
              router.push("/cart" as never);
            }
          }}
        />
      </View>
    </SafeAreaView>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <View style={styles.sectionLabel}>
      <Text style={styles.sectionLabelText}>{label}</Text>
    </View>
  );
}

type ProfileActionProps = {
  icon: keyof typeof Feather.glyphMap;
  iconBackground: string;
  iconColor: string;
  label: string;
  onPress: () => void;
};

function ProfileAction({ icon, iconBackground, iconColor, label, onPress }: ProfileActionProps) {
  return (
    <Pressable onPress={onPress} style={styles.profileAction}>
      <View style={[styles.actionIcon, { backgroundColor: iconBackground }]}>
        <Feather color={iconColor} name={icon} size={18} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
      <Feather color="#D8BDA5" name="chevron-right" size={20} />
    </Pressable>
  );
}

function ReservationCard({ reservation }: { reservation: Reservation }) {
  const itemCount = reservation.items.reduce((total, item) => total + item.quantity, 0);
  const total = reservation.items.reduce(
    (sum, item) => sum + Number(item.reserved_price) * item.quantity,
    0,
  );
  const firstItem = reservation.items[0];
  const storeName = firstItem?.supermarket_name ?? "SmartBite";
  const title = firstItem?.product_name
    ? `${firstItem.product_name}${reservation.items.length > 1 ? ` +${reservation.items.length - 1}` : ""}`
    : "Rezervare SmartBite";

  return (
    <View style={styles.reservationCard}>
      <View style={styles.reservationTopRow}>
        <View style={styles.reservationIcon}>
          <Feather color="#FFFFFF" name="shopping-bag" size={18} />
        </View>
        <View style={styles.reservationTextBlock}>
          <Text numberOfLines={1} style={styles.reservationTitle}>
            {title}
          </Text>
          <Text numberOfLines={1} style={styles.reservationStore}>
            {storeName}
          </Text>
        </View>
        <View style={styles.statusPill}>
          <Text style={styles.statusText}>
            {reservation.status === "active" ? "Activa" : "Inactiva"}
          </Text>
        </View>
      </View>
      <View style={styles.reservationMetaRow}>
        <Text style={styles.reservationMeta}>{`${itemCount} produse`}</Text>
        <Text style={styles.reservationMeta}>{formatShortDate(reservation.created_at)}</Text>
        <Text style={styles.reservationTotal}>{formatCurrency(total.toFixed(2), "RON")}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8F5EE",
  },
  screen: {
    flex: 1,
    backgroundColor: "#F8F5EE",
  },
  deviceShell: {
    flex: 1,
    backgroundColor: "#FFFDF8",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  hero: {
    position: "relative",
    overflow: "hidden",
    marginHorizontal: 14,
    minHeight: 324,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    backgroundColor: "#4F9465",
    paddingHorizontal: 28,
    paddingBottom: 28,
    shadowColor: "#376747",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.28,
    shadowRadius: 22,
    elevation: 10,
  },
  heroCircle: {
    position: "absolute",
    top: -34,
    right: -28,
    width: 126,
    height: 126,
    borderRadius: 63,
    backgroundColor: "rgba(236, 191, 120, 0.26)",
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "#FFFFFF",
    backgroundColor: "#FFFFFF",
  },
  profileTextBlock: {
    flex: 1,
    minWidth: 0,
  },
  userName: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "900",
  },
  memberRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  memberDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#F0BE74",
  },
  memberText: {
    color: "#FFF8EC",
    fontSize: 13,
    fontWeight: "800",
  },
  savingsCard: {
    marginTop: 28,
    minHeight: 120,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.34)",
    backgroundColor: "rgba(255, 255, 255, 0.16)",
  },
  savingsAmount: {
    color: "#FFFFFF",
    fontSize: 29,
    fontWeight: "900",
  },
  savingsLabel: {
    marginTop: 4,
    color: "#FFF8EC",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  body: {
    paddingHorizontal: 22,
    paddingTop: 24,
  },
  sectionHeaderRow: {
    marginTop: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionLabel: {
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: "#F1C790",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sectionLabelText: {
    color: "#9D5730",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  sectionCount: {
    color: "#A98B73",
    fontSize: 12,
    fontWeight: "800",
  },
  cardGroup: {
    overflow: "hidden",
    marginTop: 12,
    marginBottom: 22,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#F0E3D4",
    backgroundColor: "#FFFFFF",
    shadowColor: "#B89573",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 4,
  },
  profileAction: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(166, 94, 52, 0.1)",
  },
  actionLabel: {
    flex: 1,
    color: "#36302B",
    fontSize: 15,
    fontWeight: "900",
  },
  divider: {
    height: 2,
    backgroundColor: "#F0E3D4",
  },
  reservationGroup: {
    gap: 10,
    marginTop: 12,
    marginBottom: 22,
  },
  reservationCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F0E3D4",
    backgroundColor: "#FFFFFF",
    padding: 14,
    shadowColor: "#B89573",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  reservationTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  reservationIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#5D9B68",
  },
  reservationTextBlock: {
    flex: 1,
    minWidth: 0,
  },
  reservationTitle: {
    color: "#332C27",
    fontSize: 14,
    fontWeight: "900",
  },
  reservationStore: {
    marginTop: 4,
    color: "#867165",
    fontSize: 12,
    fontWeight: "700",
  },
  statusPill: {
    borderRadius: 999,
    backgroundColor: "#EAF4EE",
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  statusText: {
    color: "#477D60",
    fontSize: 11,
    fontWeight: "900",
  },
  reservationMetaRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  reservationMeta: {
    color: "#9C806E",
    fontSize: 12,
    fontWeight: "800",
  },
  reservationTotal: {
    marginLeft: "auto",
    color: "#4E8B5B",
    fontSize: 13,
    fontWeight: "900",
  },
  reservationFeedback: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F0E3D4",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
  },
  reservationFeedbackText: {
    flex: 1,
    color: "#6F5E53",
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 19,
  },
  footer: {
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 6,
  },
  footerVersion: {
    color: "#7A6A61",
    fontSize: 11,
    fontWeight: "900",
  },
  footerTagline: {
    marginTop: 5,
    color: "#C19A8B",
    fontSize: 10,
    fontWeight: "800",
  },
});
