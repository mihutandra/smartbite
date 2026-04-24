import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { MapSupermarketCard, type MapMarker } from "../components/MapSupermarketCard";
import { SupermarketCard } from "../components/SupermarketCard";
import { INITIAL_REGION, STORES } from "../data/supermarkets";

const NAV_ITEMS = [
  { icon: "home", label: "ACASA" },
  { icon: "map-pin", label: "MAGAZINE", active: true },
  { icon: "shopping-cart", label: "COS" },
  { icon: "user", label: "PROFIL" },
] as const;

export default function SupermarketCardPreviewScreen() {
  const [selectedStoreId, setSelectedStoreId] = useState(STORES[0]?.id ?? "");

  const markers: MapMarker[] = STORES.map((store) => ({
    id: store.id,
    name: store.shortMapName,
    shortLabel: store.shortLabel,
    coordinate: store.coordinate,
    accentColor: store.accentColor,
    imageSource: store.imageSource,
  }));

  const sortedStores = [...STORES].sort((left, right) => {
    if (left.id === selectedStoreId) {
      return -1;
    }

    if (right.id === selectedStoreId) {
      return 1;
    }

    return left.distanceKm - right.distanceKm;
  });

  const selectedStore = STORES.find((store) => store.id === selectedStoreId) ?? STORES[0];

  function openStore(storeId: string) {
    setSelectedStoreId(storeId);
    router.push(`/supermarket/${storeId}`);
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right", "bottom"]}>
      <StatusBar style="dark" />
      <View style={styles.deviceShell}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <MapSupermarketCard
            markers={markers}
            selectedMarkerId={selectedStoreId}
            initialRegion={INITIAL_REGION}
            onMarkerPress={openStore}
            style={styles.mapCard}
          />

          <View style={styles.resultsRow}>
            <View style={styles.resultsPill}>
              <Text style={styles.resultsText}>{`${STORES.length} MAGAZINE`}</Text>
            </View>
            <Text style={styles.selectedStoreText} numberOfLines={1}>
              {selectedStore?.name}
            </Text>
          </View>

          <View style={styles.list}>
            {sortedStores.map((card, index) => (
              <SupermarketCard
                key={card.id}
                address={card.address}
                distanceKm={card.distanceKm}
                imageSource={card.imageSource}
                name={card.name}
                offersCount={card.offersCount}
                rating={card.rating}
                accentColor={card.accentColor}
                logoLabel={card.logoLabel}
                onPress={() => openStore(card.id)}
                style={index === 0 ? styles.selectedCard : undefined}
              />
            ))}
          </View>
        </ScrollView>

        <View style={styles.bottomNav}>
          {NAV_ITEMS.map((item) => {
            const color = item.active ? "#5C9768" : "#D1AA8B";

            return (
              <View key={item.label} style={styles.navItem}>
                <Feather color={color} name={item.icon} size={18} />
                <Text style={[styles.navLabel, item.active && styles.navLabelActive]}>
                  {item.label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#EDE3D2",
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  deviceShell: {
    flex: 1,
    backgroundColor: "#FCF8F1",
    borderRadius: 30,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E7D4BA",
    shadowColor: "#AE8A65",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 8,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 18,
  },
  mapCard: {
    borderRadius: 0,
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  resultsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 14,
    marginHorizontal: 16,
    marginBottom: 14,
  },
  resultsPill: {
    borderRadius: 999,
    backgroundColor: "#F1C790",
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  resultsText: {
    color: "#8E5428",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.6,
  },
  selectedStoreText: {
    flex: 1,
    color: "#6F6458",
    fontSize: 12,
    fontWeight: "700",
  },
  list: {
    gap: 12,
    paddingHorizontal: 14,
  },
  selectedCard: {
    borderColor: "#E8BF82",
    shadowColor: "#C59154",
    shadowOpacity: 0.18,
  },
  bottomNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "#EBCDA8",
    backgroundColor: "#FFF9F1",
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 12,
  },
  navItem: {
    alignItems: "center",
    gap: 4,
  },
  navLabel: {
    color: "#D1AA8B",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  navLabelActive: {
    color: "#5C9768",
  },
});
