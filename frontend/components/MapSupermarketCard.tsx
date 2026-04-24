import { Feather } from "@expo/vector-icons";
import {
  Image,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import MapView, { Marker, type Region } from "react-native-maps";

type MapCoordinate = {
  latitude: number;
  longitude: number;
};

export type MapMarker = {
  id: string;
  name: string;
  shortLabel?: string;
  coordinate: MapCoordinate;
  accentColor?: string;
  imageSource?: ImageSourcePropType;
};

export type MapSupermarketCardProps = {
  title?: string;
  markers: MapMarker[];
  selectedMarkerId?: string;
  initialRegion?: Region;
  onMarkerPress?: (markerId: string) => void;
  style?: StyleProp<ViewStyle>;
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
}: MapSupermarketCardProps) {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.locationButton}>
          <Feather color="#F3F7F1" name="map-pin" size={14} />
        </View>
      </View>

      <View style={styles.mapArea}>
        <MapView
          initialRegion={initialRegion}
          loadingEnabled
          moveOnMarkerPress={false}
          pitchEnabled={false}
          rotateEnabled={false}
          scrollEnabled
          style={StyleSheet.absoluteFillObject}
          toolbarEnabled={false}
          zoomEnabled
          customMapStyle={MAP_STYLE}
        >
          {markers.map((marker) => {
            const accentColor = marker.accentColor ?? "#DF7A3A";
            const isSelected = marker.id === selectedMarkerId;

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
                        {marker.imageSource ? (
                          <Image
                            source={marker.imageSource}
                            style={styles.selectedLogoImage}
                            resizeMode="contain"
                          />
                        ) : (
                          <Text style={[styles.selectedLogoText, { color: accentColor }]}>
                            {getShortLabel(marker.name, marker.shortLabel)}
                          </Text>
                        )}
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
                  {marker.imageSource ? (
                    <Image source={marker.imageSource} style={styles.markerImage} resizeMode="contain" />
                  ) : (
                    <Text style={styles.markerLabel}>{getShortLabel(marker.name, marker.shortLabel)}</Text>
                  )}
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
  header: {
    height: 58,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#4E8B5B",
  },
  title: {
    color: "#F7F4EA",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  locationButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.22)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  mapArea: {
    height: 184,
    backgroundColor: "#F3E6CF",
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
});
