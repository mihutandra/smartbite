import { Feather } from "@expo/vector-icons";
import { Redirect, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomNavBar } from "../components/BottomNavBar";
import { useAuth } from "../context/auth-context";
import { formatShortDate } from "../utils/product_detail";

export default function PersonalInfoScreen() {
  const insets = useSafeAreaInsets();
  const { status, user } = useAuth();

  if (status === "loading") {
    return <View style={styles.loadingScreen} />;
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
          <View style={[styles.hero, { paddingTop: insets.top + 18 }]}>
            <View style={styles.heroCircleLarge} />
            <View style={styles.heroCircleSmall} />

            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Feather color="#FFFFFF" name="arrow-left" size={20} />
            </Pressable>

            <View style={styles.avatar}>
              <Feather color="#111111" name="user" size={42} />
            </View>
            <Text numberOfLines={1} style={styles.heroTitle}>
              {user.name}
            </Text>
            <Text numberOfLines={1} style={styles.heroSubtitle}>
              {user.email}
            </Text>
          </View>

          <View style={styles.body}>
            <View style={styles.sectionLabel}>
              <Text style={styles.sectionLabelText}>INFORMATII PERSONALE</Text>
            </View>

            <View style={styles.infoGroup}>
              <InfoRow icon="user" label="Nume" value={user.name} />
              <View style={styles.divider} />
              <InfoRow icon="mail" label="Email" value={user.email} />
              <View style={styles.divider} />
              <InfoRow icon="phone" label="Telefon" value={user.phone || "Necompletat"} />
              <View style={styles.divider} />
              <InfoRow icon="map-pin" label="Locatie" value={user.location || "Necompletata"} />
            </View>

            <View style={styles.sectionLabel}>
              <Text style={styles.sectionLabelText}>CONT</Text>
            </View>

            <View style={styles.infoGroup}>
              <InfoRow icon="shield" label="Rol" value={formatRole(user.role)} />
              <View style={styles.divider} />
              <InfoRow icon="calendar" label="Creat la" value={formatShortDate(user.created_at)} />
              <View style={styles.divider} />
              <InfoRow icon="refresh-ccw" label="Actualizat la" value={formatShortDate(user.updated_at)} />
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
              return;
            }

            router.replace("/profile" as never);
          }}
        />
      </View>
    </SafeAreaView>
  );
}

type InfoRowProps = {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string;
};

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Feather color="#4E8B5B" name={icon} size={18} />
      </View>
      <View style={styles.infoTextBlock}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text numberOfLines={2} style={styles.infoValue}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function formatRole(role: string) {
  const normalizedRole = role.toLowerCase();
  return normalizedRole.charAt(0).toUpperCase() + normalizedRole.slice(1);
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
    minHeight: 260,
    alignItems: "center",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    backgroundColor: "#4F9465",
    paddingHorizontal: 24,
    paddingBottom: 28,
    shadowColor: "#376747",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.24,
    shadowRadius: 22,
    elevation: 10,
  },
  heroCircleLarge: {
    position: "absolute",
    top: -36,
    right: -28,
    width: 126,
    height: 126,
    borderRadius: 63,
    backgroundColor: "rgba(236, 191, 120, 0.26)",
  },
  heroCircleSmall: {
    position: "absolute",
    bottom: -44,
    left: -34,
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
  },
  backButton: {
    alignSelf: "flex-start",
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    marginBottom: 10,
  },
  avatar: {
    width: 82,
    height: 82,
    borderRadius: 41,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "#FFFFFF",
    backgroundColor: "#FFFFFF",
  },
  heroTitle: {
    marginTop: 14,
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "900",
  },
  heroSubtitle: {
    marginTop: 6,
    color: "#FFF8EC",
    fontSize: 13,
    fontWeight: "800",
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
    marginTop: 4,
  },
  sectionLabelText: {
    color: "#9D5730",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  infoGroup: {
    overflow: "hidden",
    marginTop: 12,
    marginBottom: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#F0E3D4",
    backgroundColor: "#FFFFFF",
    shadowColor: "#B89573",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  infoRow: {
    minHeight: 74,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  infoIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(78, 139, 91, 0.1)",
    backgroundColor: "#EAF4EE",
  },
  infoTextBlock: {
    flex: 1,
    minWidth: 0,
  },
  infoLabel: {
    color: "#A98B73",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  infoValue: {
    marginTop: 5,
    color: "#342D28",
    fontSize: 15,
    fontWeight: "900",
    lineHeight: 21,
  },
  divider: {
    height: 2,
    backgroundColor: "#F0E3D4",
  },
});
