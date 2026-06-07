import { Feather } from "@expo/vector-icons";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { RemoteLogo } from "./RemoteLogo";
import { getSupermarketLogoUrls } from "../utils/images";

type MapCoordinate = {
  latitude: number;
  longitude: number;
};

type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

export type MapMarker = {
  id: string;
  name: string;
  shortLabel?: string;
  coordinate: MapCoordinate;
  accentColor?: string;
  logoUrl?: string | null;
};

export type MapSupermarketCardProps = {
  title?: string;
  markers: MapMarker[];
  selectedMarkerId?: string;
  initialRegion?: Region;
  onMarkerPress?: (markerId: string) => void;
  style?: StyleProp<ViewStyle>;
  fullScreen?: boolean;
  topInset?: number;
  userCoordinate?: MapCoordinate | null;
};

const DEFAULT_REGION: Region = {
  latitude: 46.7712,
  longitude: 23.6236,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export function MapSupermarketCard({
  title = "Magazine",
  markers,
  selectedMarkerId,
  initialRegion = DEFAULT_REGION,
  onMarkerPress,
  style,
  fullScreen = false,
  topInset = 0,
  userCoordinate,
}: MapSupermarketCardProps) {
  const userPosition = userCoordinate ? projectMarker(userCoordinate, initialRegion) : null;

  return (
    <View style={[styles.card, fullScreen && styles.cardFullScreen, style]}>
      <View style={[styles.header, { height: 58 + topInset, paddingTop: topInset }]}>
        <View style={styles.headerTitleWrap}>
          <Feather color="#F3F7F1" name="map-pin" size={18} />
          <Text style={styles.title}>{title}</Text>
        </View>
      </View>

      <View style={[styles.mapArea, fullScreen && styles.mapAreaFullScreen]}>
        <View style={styles.fakeMapBackground}>
          <View style={[styles.mapPatch, styles.mapPatchTop]} />
          <View style={[styles.mapPatch, styles.mapPatchBottom]} />
          <View style={[styles.road, styles.roadPrimary]} />
          <View style={[styles.road, styles.roadSecondary]} />
          <View style={[styles.road, styles.roadDiagonal]} />
          <View style={[styles.roadThin, styles.roadThinOne]} />
          <View style={[styles.roadThin, styles.roadThinTwo]} />
        </View>

        {userPosition ? (
          <View
            style={[
              styles.userMarkerPressable,
              { left: `${userPosition.x}%`, top: `${userPosition.y}%` },
            ]}
          >
            <View style={styles.userMarkerOuter}>
              <View style={styles.userMarkerInner} />
              <View style={styles.userMarkerLabel}>
                <Text style={styles.userMarkerLabelText}>Tu</Text>
              </View>
            </View>
          </View>
        ) : null}

        {markers.map((marker) => {
          const accentColor = marker.accentColor ?? "#DF7A3A";
          const isSelected = marker.id === selectedMarkerId;
          const position = projectMarker(marker.coordinate, initialRegion);
          const logoUrls = getSupermarketLogoUrls(marker.name, marker.logoUrl);

          if (isSelected) {
            return (
              <Pressable
                key={marker.id}
                onPress={() => onMarkerPress?.(marker.id)}
                style={[styles.markerPressable, { left: `${position.x}%`, top: `${position.y}%` }]}
              >
                <View style={styles.selectedMarkerWrap}>
                  <View style={styles.selectedMarker}>
                    <View
                      style={[
                        styles.selectedLogo,
                        { backgroundColor: `${accentColor}18`, borderColor: `${accentColor}30` },
                      ]}
                    >
                      <RemoteLogo
                        fallback={
                          <Text style={[styles.selectedLogoText, { color: accentColor }]}>
                            {getShortLabel(marker.name, marker.shortLabel)}
                          </Text>
                        }
                        height={14}
                        urls={logoUrls}
                        width={14}
                        style={styles.selectedLogoImage}
                      />
                    </View>
                    <Text numberOfLines={1} style={styles.selectedLabel}>
                      {marker.name}
                    </Text>
                  </View>
                  <View style={[styles.pointer, { backgroundColor: accentColor }]} />
                </View>
              </Pressable>
            );
          }

          return (
            <Pressable
              key={marker.id}
              onPress={() => onMarkerPress?.(marker.id)}
              style={[styles.markerPressable, { left: `${position.x}%`, top: `${position.y}%` }]}
            >
              <View style={[styles.marker, { backgroundColor: accentColor }]}>
                <RemoteLogo
                  fallback={
                    <Text style={styles.markerLabel}>{getShortLabel(marker.name, marker.shortLabel)}</Text>
                  }
                  height={16}
                  urls={logoUrls}
                  width={16}
                  style={styles.markerImage}
                />
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function projectMarker(coordinate: MapCoordinate, region: Region) {
  const x =
    ((coordinate.longitude - (region.longitude - region.longitudeDelta / 2)) / region.longitudeDelta) *
    100;
  const y =
    ((region.latitude + region.latitudeDelta / 2 - coordinate.latitude) / region.latitudeDelta) * 100;

  return {
    x: Math.min(92, Math.max(8, x)),
    y: Math.min(88, Math.max(12, y)),
  };
}

function getShortLabel(name: string, shortLabel?: string) {
  if (shortLabel) {
    return shortLabel;
  }

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

const styles = StyleSheet.create({
  card: {
    overflow: "hidden",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E2C9A8",
    backgroundColor: "#FFF9F1",
    shadowColor: "#B79063",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 7,
  },
  cardFullScreen: {
    flex: 1,
    borderRadius: 0,
    borderWidth: 0,
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  header: {
    height: 58,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#4E8B5B",
  },
  headerTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    color: "#F7F4EA",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  mapArea: {
    height: 184,
    backgroundColor: "#E8E0CF",
    overflow: "hidden",
  },
  mapAreaFullScreen: {
    flex: 1,
    height: undefined,
  },
  fakeMapBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#F3EAD7",
  },
  mapPatch: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: "#D8ECC5",
    opacity: 0.8,
  },
  mapPatchTop: {
    top: -30,
    right: -20,
    width: 220,
    height: 180,
  },
  mapPatchBottom: {
    bottom: -20,
    left: -30,
    width: 190,
    height: 140,
  },
  road: {
    position: "absolute",
    backgroundColor: "#D9C5A2",
    borderRadius: 999,
  },
  roadPrimary: {
    left: "-10%",
    right: "-10%",
    top: "58%",
    height: 14,
    transform: [{ rotate: "-4deg" }],
  },
  roadSecondary: {
    left: "12%",
    right: "18%",
    top: "34%",
    height: 10,
    transform: [{ rotate: "22deg" }],
  },
  roadDiagonal: {
    left: "38%",
    right: "-8%",
    top: "72%",
    height: 10,
    transform: [{ rotate: "-28deg" }],
  },
  roadThin: {
    position: "absolute",
    backgroundColor: "#C9D9E6",
    borderRadius: 999,
  },
  roadThinOne: {
    left: "10%",
    right: "50%",
    top: "48%",
    height: 4,
    transform: [{ rotate: "-18deg" }],
  },
  roadThinTwo: {
    left: "55%",
    right: "8%",
    top: "28%",
    height: 4,
    transform: [{ rotate: "14deg" }],
  },
  markerPressable: {
    position: "absolute",
    transform: [{ translateX: -17 }, { translateY: -17 }],
  },
  marker: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.92)",
    shadowColor: "#80572D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  markerLabel: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  markerImage: {
    width: 16,
    height: 16,
  },
  selectedMarkerWrap: {
    alignItems: "center",
  },
  selectedMarker: {
    maxWidth: 152,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 10,
    backgroundColor: "#FFFFFF",
    shadowColor: "#80572D",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
    elevation: 5,
  },
  selectedLogo: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF7F0",
    overflow: "hidden",
  },
  selectedLogoImage: {
    width: 14,
    height: 14,
  },
  selectedLogoText: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  selectedLabel: {
    flexShrink: 1,
    color: "#2F2924",
    fontSize: 13,
    fontWeight: "800",
  },
  pointer: {
    width: 14,
    height: 14,
    marginTop: -4,
    borderRadius: 7,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.9)",
  },
  userMarkerPressable: {
    position: "absolute",
    transform: [{ translateX: -17 }, { translateY: -17 }],
    zIndex: 20,
  },
  userMarkerOuter: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(78,139,91,0.24)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.95)",
    shadowColor: "#245C35",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 8,
  },
  userMarkerInner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#4E8B5B",
  },
  userMarkerLabel: {
    position: "absolute",
    top: 24,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  userMarkerLabelText: {
    color: "#3E7C4E",
    fontSize: 10,
    fontWeight: "900",
  },
});
