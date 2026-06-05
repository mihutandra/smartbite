import { Feather } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { RemoteLogo } from "./RemoteLogo";
import { getSupermarketLogoUrls } from "../utils/images";

export type SupermarketCardProps = {
  address: string;
  distanceKm: number;
  name: string;
  offersCount?: number;
  rating?: number;
  accentColor?: string;
  logoUrl?: string | null;
  logoLabel?: string;
  logoTextStyle?: StyleProp<TextStyle>;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function SupermarketCard({
  address,
  distanceKm,
  name,
  offersCount,
  rating,
  accentColor = "#E95C24",
  logoUrl,
  logoLabel,
  logoTextStyle,
  onPress,
  style,
}: SupermarketCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const logoUrls = getSupermarketLogoUrls(name, logoUrl);
  const logoUrlsKey = logoUrls.join("|");
  const showImage = logoUrls.length > 0 && !imageFailed;

  useEffect(() => {
    setImageFailed(false);
  }, [logoUrlsKey]);

  return (
    <Pressable onPress={onPress} style={[styles.card, style]}>
      <View style={[styles.logoContainer, { borderColor: `${accentColor}33` }] }>
        {showImage ? (
          <RemoteLogo
            height={52}
            onError={() => setImageFailed(true)}
            style={styles.logoImage}
            urls={logoUrls}
            width={52}
          />
        ) : (
          <View style={[styles.logoBadge, { backgroundColor: `${accentColor}14` }] }>
            <Text style={[styles.logoText, { color: accentColor }, logoTextStyle]}>
              {logoLabel ?? getStoreInitials(name)}
            </Text>
          </View>
        )}
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

        {typeof rating === "number" || typeof offersCount === "number" ? (
          <View style={styles.footerRow}>
            {typeof rating === "number" ? (
              <InfoPill backgroundColor="#F1B16C" icon="star" label={rating.toFixed(1)} />
            ) : null}
            {typeof offersCount === "number" ? (
              <InfoPill backgroundColor="#9BC59C" icon="tag" label={`${offersCount} oferte`} />
            ) : null}
          </View>
        ) : null}
      </View>
    </Pressable>
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
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#F0D8B7",
    backgroundColor: "#FFFDF9",
    padding: 14,
    shadowColor: "#D9B687",
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 4,
  },
  logoContainer: {
    height: 72,
    width: 72,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    borderWidth: 2,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  logoBadge: {
    height: 54,
    width: 54,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
  },
  logoImage: {
    height: 52,
    width: 52,
  },
  logoText: {
    fontSize: 22,
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
    fontSize: 18,
    fontWeight: "900",
  },
  address: {
    color: "#776B61",
    fontSize: 13,
    fontWeight: "600",
  },
  footerRow: {
    marginTop: 4,
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
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  pillText: {
    fontSize: 12,
    fontWeight: "800",
  },
});
