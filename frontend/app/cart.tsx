import { Feather } from "@expo/vector-icons";
import { Redirect, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomNavBar } from "../components/BottomNavBar";
import { useAuth } from "../context/auth-context";

export default function CartPlaceholderScreen() {
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
      <View style={[styles.hero, { paddingTop: insets.top + 18 }]}>
        <View style={styles.heroCircleLarge} />
        <View style={styles.heroCircleSmall} />
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather color="#8E5428" name="arrow-left" size={18} />
        </Pressable>
        <Text style={styles.heroTitle}>Cos</Text>
        <Text style={styles.heroSubtitle}>Ecranul complet pentru cos va fi implementat separat.</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.iconBadge}>
            <Feather color="#FFFFFF" name="shopping-cart" size={24} />
          </View>
          <Text style={styles.title}>Placeholder temporar</Text>
          <Text style={styles.text}>
            Navigarea catre `Cos` functioneaza. Aici poti continua cu fluxul complet de rezervare si checkout.
          </Text>
          <Text style={styles.todo}>
            TODO: Adauga lista produselor rezervate, totalul si actiunile finale pentru comanda.
          </Text>
        </View>
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
          }
        }}
      />
    </SafeAreaView>
  );
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
  hero: {
    position: "relative",
    overflow: "hidden",
    paddingHorizontal: 24,
    paddingBottom: 28,
    alignItems: "center",
    backgroundColor: "#F28B31",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: "#B86E2B",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 6,
  },
  heroCircleLarge: {
    position: "absolute",
    top: -32,
    right: -16,
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: "rgba(230, 186, 113, 0.45)",
  },
  heroCircleSmall: {
    position: "absolute",
    bottom: -28,
    left: -24,
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(255, 214, 153, 0.28)",
  },
  backButton: {
    alignSelf: "flex-start",
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF4E5",
    marginBottom: 14,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
  },
  heroSubtitle: {
    marginTop: 8,
    color: "#FFE5C4",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  card: {
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    padding: 28,
    alignItems: "center",
    shadowColor: "#4A413B",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 6,
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#5D9B68",
    marginBottom: 18,
  },
  title: {
    color: "#423B35",
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
  },
  text: {
    marginTop: 12,
    color: "#72665C",
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  todo: {
    marginTop: 14,
    color: "#C4623B",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
});
