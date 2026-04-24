import { Feather } from "@expo/vector-icons";
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";

export type SupermarketCardProps = {
  address: string;
  distanceKm: number;
  name: string;
  offersCount: number;
  rating: number;
  accentColor?: string;
  logoLabel?: string;
  logoTextStyle?: StyleProp<TextStyle>;
  style?: StyleProp<ViewStyle>;
};

export function SupermarketCard({
  address,
  distanceKm,
  name,
  offersCount,
  rating,
  accentColor = "#E95C24",
  logoLabel,
  logoTextStyle,
  style,
}: SupermarketCardProps) {
  return (
    <View style={[styles.card, style]}>
      <View style={[styles.logoContainer, { borderColor: `${accentColor}33` }]}>
        <View style={[styles.logoBadge, { backgroundColor: `${accentColor}14` }]}>
          <Text style={[styles.logoText, { color: accentColor }, logoTextStyle]}>
            {logoLabel ?? getStoreInitials(name)}
          </Text>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.headerRow}>
          <Text numberOfLines={1} style={styles.name}>
            {name}
          </Text>
          <InfoPill
            backgroundColor="#6C9F76"
            icon="navigation"
            label={`${distanceKm.toFixed(1)} km`}
          />
        </View>

        <Text numberOfLines={1} style={styles.address}>
          {address}
        </Text>

        <View style={styles.footerRow}>
          <InfoPill
            backgroundColor="#F1B16C"
            icon="star"
            label={rating.toFixed(1)}
          />
          <InfoPill
            backgroundColor="#9BC59C"
            icon="tag"
            label={`${offersCount} oferte`}
          />
        </View>
      </View>
    </View>
  );
}

type InfoPillProps = {
  backgroundColor: string;
  icon: keyof typeof Feather.glyphMap;
  label: string;
};

function InfoPill({ backgroundColor, icon, label }: InfoPillProps) {
  return (
    <View style={[styles.pill, { backgroundColor: `${backgroundColor}22` }]}>
      <Feather color={backgroundColor} name={icon} size={12} />
      <Text style={[styles.pillText, { color: backgroundColor }]}>{label}</Text>
    </View>
  );
}

function getStoreInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#F4D7AF",
    backgroundColor: "#FFFDF9",
    padding: 14,
    shadowColor: "#CCB18A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 14,
    elevation: 4,
  },
  logoContainer: {
    height: 66,
    width: 66,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: "#FFFFFF",
  },
  logoBadge: {
    height: 48,
    width: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
  },
  logoText: {
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: -0.6,
  },
  details: {
    flex: 1,
    gap: 6,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  name: {
    flex: 1,
    color: "#2F2924",
    fontSize: 17,
    fontWeight: "800",
  },
  address: {
    color: "#776B61",
    fontSize: 13,
    fontWeight: "500",
  },
  footerRow: {
    marginTop: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  pillText: {
    fontSize: 12,
    fontWeight: "800",
  },
});
