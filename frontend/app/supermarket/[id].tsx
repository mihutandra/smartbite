import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { fetchSupermarket } from "../../services/supermarkets";
import { type Supermarket } from "../../types/supermarket";

export default function SupermarketPlaceholderScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [supermarket, setSupermarket] = useState<Supermarket | null>(null);
  const [isLoadingSupermarket, setIsLoadingSupermarket] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (typeof id !== "string") {
      return;
    }

    let isMounted = true;

    async function loadSupermarket() {
      setIsLoadingSupermarket(true);
      setLoadError("");

      try {
        const response = await fetchSupermarket(id);

        if (!isMounted) {
          return;
        }

        setSupermarket(response);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setLoadError(
          error instanceof Error ? error.message : "Nu am putut incarca supermarketul selectat.",
        );
      } finally {
        if (isMounted) {
          setIsLoadingSupermarket(false);
        }
      }
    }

    void loadSupermarket();

    return () => {
      isMounted = false;
    };
  }, [id]);

  return (
    <SafeAreaView style={styles.screen} edges={["left", "right", "bottom"]}>
      <StatusBar style="light" />
      <View style={[styles.hero, { paddingTop: insets.top + 18 }]}>
        <View style={styles.heroCircleLarge} />
        <View style={styles.heroCircleSmall} />
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather color="#8E5428" name="arrow-left" size={18} />
        </Pressable>
        <Text style={styles.heroTitle}>Detalii supermarket</Text>
        <Text style={styles.heroSubtitle}>Pagina este rezervata pentru implementarea colegului tau.</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.iconBadge}>
            <Feather color="#FFFFFF" name="shopping-bag" size={24} />
          </View>
          <Text style={styles.title}>
            {supermarket?.name ?? (isLoadingSupermarket ? "Se incarca..." : "Placeholder temporar")}
          </Text>
          {isLoadingSupermarket ? (
            <ActivityIndicator color="#5D9B68" style={styles.loader} />
          ) : (
            <Text style={styles.text}>
              Ai selectat supermarketul
              {supermarket?.name ? ` ${supermarket.name}` : typeof id === "string" ? ` cu id ${id}` : ""}.
              Fluxul de navigare functioneaza, dar pagina de detalii nu este implementata aici.
            </Text>
          )}
          {loadError ? <Text style={styles.errorText}>{loadError}</Text> : null}
          <Text style={styles.todo}>
            TODO: Inlocuieste acest placeholder dupa ce pagina de detalii este gata.
            Endpointul de baza exista deja, dar inca lipsesc integrarea UI completa si folosirea
            endpointului de details in ecranul final.
          </Text>

          <Pressable onPress={() => router.replace("/home")} style={styles.button}>
            <Text style={styles.buttonText}>Inapoi la lista</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  loader: {
    marginTop: 14,
  },
  errorText: {
    marginTop: 12,
    color: "#B05D3B",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  todo: {
    marginTop: 14,
    color: "#C4623B",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
  button: {
    marginTop: 24,
    minHeight: 48,
    minWidth: 180,
    paddingHorizontal: 24,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F68B2F",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
});
