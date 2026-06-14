import { Feather } from "@expo/vector-icons";
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { RemoteLogo } from "./RemoteLogo";
import { type MapCoordinate, type MapMarker, type MapRegion } from "../types/map";
import { getSupermarketLogoUrls } from "../utils/images";

export type MapSupermarketCardProps = {
  title?: string;
  markers: MapMarker[];
  selectedMarkerId?: string;
  initialRegion?: MapRegion;
  onRegionChangeComplete?: (region: MapRegion) => void;
  onMarkerPress?: (markerId: string) => void;
  style?: StyleProp<ViewStyle>;
  fullScreen?: boolean;
  topInset?: number;
  userCoordinate?: MapCoordinate | null;
};

const DEFAULT_REGION: MapRegion = {
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
  onRegionChangeComplete,
  onMarkerPress,
  style,
  fullScreen = false,
  topInset = 0,
  userCoordinate,
}: MapSupermarketCardProps) {
  return (
    <View style={[styles.card, fullScreen && styles.cardFullScreen, style]}>
      <View style={[styles.header, { height: 58 + topInset, paddingTop: topInset }]}>
        <View style={styles.headerTitleWrap}>
          <Feather color="#F3F7F1" name="map-pin" size={18} />
          <Text style={styles.title}>{title}</Text>
        </View>
      </View>

      <View style={[styles.mapArea, fullScreen && styles.mapAreaFullScreen]}>
        <MapView
          initialRegion={initialRegion}
          loadingEnabled
          moveOnMarkerPress={false}
          onRegionChangeComplete={onRegionChangeComplete}
          pitchEnabled={false}
          rotateEnabled={false}
          scrollEnabled
          style={StyleSheet.absoluteFillObject}
          toolbarEnabled={false}
          zoomEnabled
          customMapStyle={MAP_STYLE}
        >
          {userCoordinate ? (
            <Marker
              coordinate={userCoordinate}
              anchor={{ x: 0.5, y: 0.5 }}
              title="Locatia ta"
              zIndex={1000}
            >
              <View style={styles.userMarkerOuter}>
                <View style={styles.userMarkerInner} />
                <View style={styles.userMarkerLabel}>
                  <Text style={styles.userMarkerLabelText}>Tu</Text>
                </View>
              </View>
            </Marker>
          ) : null}

          {markers.map((marker) => {
            const accentColor = marker.accentColor ?? "#DF7A3A";
            const isSelected = marker.id === selectedMarkerId;
            const logoUrls = getSupermarketLogoUrls(marker.name, marker.logoUrl);

            if (isSelected) {
              return (
                <Marker
                  key={marker.id}
                  coordinate={marker.coordinate}
                  anchor={{ x: 0.5, y: 1 }}
                  onPress={() => onMarkerPress?.(marker.id)}
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
                </Marker>
              );
            }

            return (
              <Marker
                key={marker.id}
                coordinate={marker.coordinate}
                anchor={{ x: 0.5, y: 0.5 }}
                onPress={() => onMarkerPress?.(marker.id)}
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
              </Marker>
            );
          })}
        </MapView>
      </View>
    </View>
  );
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

const MAP_STYLE = [
  {
    featureType: "poi",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "transit",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#f4e4d0" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#a58d7a" }],
  },
  {
    featureType: "landscape",
    elementType: "geometry",
    stylers: [{ color: "#f8eddc" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#d7ead3" }],
  },
  {
    featureType: "administrative",
    elementType: "geometry.stroke",
    stylers: [{ color: "#eadac1" }],
  },
];

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
    backgroundColor: "#F3E6CF",
  },
  mapAreaFullScreen: {
    flex: 1,
    height: undefined,
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
