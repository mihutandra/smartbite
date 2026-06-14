import { Feather } from "@expo/vector-icons";
import { Redirect, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import { formatCurrency } from "../utils/product_detail";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { accessToken, deleteAccount, signOut, status, user } = useAuth();
  const [savings, setSavings] = useState("0.00");
  const [savingsCurrency, setSavingsCurrency] = useState("RON");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  useEffect(() => {
    if (status !== "authenticated" || !accessToken) {
      return;
    }

    const token = accessToken;
    let isMounted = true;

    async function loadProfileSavings() {
      try {
        const profileSavings = await fetchProfileSavings(token);

        if (!isMounted) {
          return;
        }

        setSavings(String(profileSavings.total_savings));
        setSavingsCurrency(profileSavings.currency);
      } catch {
        // Savings are supplemental profile data; keep the default value if unavailable.
      }
    }

    void loadProfileSavings();

    return () => {
      isMounted = false;
    };
  }, [accessToken, status]);

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

  function confirmDeleteAccount() {
    Alert.alert(
      "Sterge contul?",
      "Contul tau va fi sters si vei fi deconectat. Aceasta actiune nu poate fi anulata.",
      [
        { text: "Anuleaza", style: "cancel" },
        {
          text: "Sterge",
          style: "destructive",
          onPress: () => void handleDeleteAccount(),
        },
      ],
    );
  }

  async function handleDeleteAccount() {
    setIsDeletingAccount(true);

    try {
      await deleteAccount();
    } catch (error) {
      Alert.alert(
        "Nu am putut sterge contul",
        error instanceof Error ? error.message : "Incearca din nou.",
      );
      setIsDeletingAccount(false);
    }
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

            <SectionLabel label="REZERVARILE MELE" />
            <View style={styles.reservationPlaceholderCard}>
              <View style={styles.reservationPlaceholderIcon}>
                <Feather color="#FFFFFF" name="shopping-bag" size={18} />
              </View>
              <View style={styles.reservationPlaceholderTextBlock}>
                <Text style={styles.reservationPlaceholderTitle}>Rezervarile mele</Text>
                <Text style={styles.reservationPlaceholderText}>In curand</Text>
              </View>
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
                isLoading={isDeletingAccount}
                label={isDeletingAccount ? "Se sterge contul..." : "Sterge cont"}
                onPress={confirmDeleteAccount}
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
  isLoading?: boolean;
  label: string;
  onPress: () => void;
};

function ProfileAction({ icon, iconBackground, iconColor, isLoading = false, label, onPress }: ProfileActionProps) {
  return (
    <Pressable disabled={isLoading} onPress={onPress} style={styles.profileAction}>
      <View style={[styles.actionIcon, { backgroundColor: iconBackground }]}>
        {isLoading ? (
          <ActivityIndicator color={iconColor} size="small" />
        ) : (
          <Feather color={iconColor} name={icon} size={18} />
        )}
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
      <Feather color="#D8BDA5" name="chevron-right" size={20} />
    </Pressable>
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
  reservationPlaceholderCard: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginTop: 12,
    marginBottom: 22,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#F0E3D4",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: "#B89573",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 4,
  },
  reservationPlaceholderIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#5D9B68",
  },
  reservationPlaceholderTextBlock: {
    flex: 1,
    minWidth: 0,
  },
  reservationPlaceholderTitle: {
    color: "#36302B",
    fontSize: 15,
    fontWeight: "900",
  },
  reservationPlaceholderText: {
    marginTop: 4,
    color: "#A98B73",
    fontSize: 12,
    fontWeight: "800",
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
