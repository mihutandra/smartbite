import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getStoreById } from "../../data/supermarkets";

export default function SupermarketDetailsScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const store = typeof id === "string" ? getStoreById(id) : undefined;

  if (!store) {
    return (
      <SafeAreaView style={styles.screen} edges={["top", "left", "right", "bottom"]}>
        <StatusBar style="dark" />
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Magazinul nu a fost gasit</Text>
          <Text style={styles.emptyText}>Intoarce-te si selecteaza un supermarket valid.</Text>
          <Text style={styles.backLink} onPress={() => router.back()}>
            Inapoi
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right", "bottom"]}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <Text style={styles.backButton} onPress={() => router.back()}>
            Inapoi
          </Text>
          <View style={[styles.distancePill, { backgroundColor: `${store.accentColor}18` }]}>
            <Feather color={store.accentColor} name="navigation" size={12} />
            <Text style={[styles.distanceText, { color: store.accentColor }]}>
              {`${store.distanceKm.toFixed(1)} km`}
            </Text>
          </View>
        </View>

        <View style={[styles.hero, { borderColor: `${store.accentColor}33` }]}>
          <Text style={styles.heroLabel}>MAGAZIN SELECTAT</Text>
          <Text style={styles.heroTitle}>{store.name}</Text>
          <Text style={styles.heroAddress}>{store.address}</Text>
          <Text style={styles.heroNote}>{store.heroNote}</Text>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryPill}>
            <Feather color="#F1B16C" name="star" size={12} />
            <Text style={styles.summaryText}>{store.rating.toFixed(1)}</Text>
          </View>
          <View style={styles.summaryPill}>
            <Feather color="#9BC59C" name="tag" size={12} />
            <Text style={styles.summaryText}>{`${store.offersCount} oferte`}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Produse</Text>
        <View style={styles.productsList}>
          {store.products.map((product) => (
            <View key={product.id} style={styles.productCard}>
              <View style={styles.productHeader}>
                <Text style={styles.productName}>{product.name}</Text>
                {product.badge ? <Text style={styles.productBadge}>{product.badge}</Text> : null}
              </View>
              <Text style={styles.productMeta}>{product.weight}</Text>
              <Text style={styles.productPrice}>{product.price}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8F5EE",
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 32,
    gap: 16,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    color: "#8E5428",
    fontSize: 14,
    fontWeight: "800",
  },
  distancePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: "800",
  },
  hero: {
    borderRadius: 22,
    borderWidth: 1,
    backgroundColor: "#FFFDF9",
    padding: 18,
    gap: 8,
  },
  heroLabel: {
    color: "#A3917D",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
  },
  heroTitle: {
    color: "#2F2924",
    fontSize: 24,
    fontWeight: "900",
  },
  heroAddress: {
    color: "#6F6458",
    fontSize: 14,
    fontWeight: "600",
  },
  heroNote: {
    color: "#7E7367",
    fontSize: 13,
    fontWeight: "500",
  },
  summaryRow: {
    flexDirection: "row",
    gap: 10,
  },
  summaryPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    backgroundColor: "#FFF0DE",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  summaryText: {
    color: "#6F6458",
    fontSize: 12,
    fontWeight: "800",
  },
  sectionTitle: {
    color: "#2F2924",
    fontSize: 20,
    fontWeight: "900",
  },
  productsList: {
    gap: 12,
  },
  productCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#F0D6B3",
    backgroundColor: "#FFFDF9",
    padding: 14,
    gap: 6,
  },
  productHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  productName: {
    flex: 1,
    color: "#2F2924",
    fontSize: 16,
    fontWeight: "800",
  },
  productBadge: {
    color: "#D46B34",
    fontSize: 11,
    fontWeight: "900",
    backgroundColor: "#FDE7D7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  productMeta: {
    color: "#8A7D72",
    fontSize: 13,
    fontWeight: "500",
  },
  productPrice: {
    color: "#3E6E4D",
    fontSize: 16,
    fontWeight: "900",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 10,
  },
  emptyTitle: {
    color: "#2F2924",
    fontSize: 22,
    fontWeight: "900",
  },
  emptyText: {
    color: "#6F6458",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  backLink: {
    color: "#8E5428",
    fontSize: 14,
    fontWeight: "800",
  },
});
