import { Feather } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const NAV_ITEMS = [
  { icon: "home", label: "ACASA", key: "home" },
  { icon: "map-pin", label: "MAGAZINE", key: "map" },
  { icon: "search", label: "CAUTA", key: "search" },
  { icon: "shopping-cart", label: "COS" },
  { icon: "user", label: "PROFIL" },
] as const;

type BottomNavBarProps = {
  activeTab?: "home" | "map" | "search";
  onTabPress?: (tab: "home" | "map" | "search") => void;
};

export function BottomNavBar({ activeTab = "home", onTabPress }: BottomNavBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.nav, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      {NAV_ITEMS.map((item) => {
        const isActive = item.key === activeTab;
        const isInteractive = item.key === "home" || item.key === "map" || item.key === "search";

        return (
          <Pressable
            key={item.label}
            disabled={!isInteractive}
            onPress={() => {
              if (isInteractive) {
                onTabPress?.(item.key);
              }
            }}
            style={styles.navItem}
          >
            <View style={[styles.iconWrap, isActive && styles.iconWrapActive]}>
              <Feather color={isActive ? "#4E8B5B" : "#D0AB90"} name={item.icon} size={18} />
            </View>
            <Text style={[styles.label, isActive && styles.labelActive]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    borderTopWidth: 2,
    borderColor: "#EDC07E",
    backgroundColor: "#FFFDFC",
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  navItem: {
    alignItems: "center",
    gap: 4,
    minWidth: 52,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapActive: {
    backgroundColor: "#EAF4EB",
  },
  label: {
    color: "#D0AB90",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.3,
  },
  labelActive: {
    color: "#4E8B5B",
  },
});
