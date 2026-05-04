import type { ComponentType } from "react";
import type { ImageSourcePropType, StyleProp, ViewStyle } from "react-native";

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
  imageSource?: ImageSourcePropType;
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
};

export const MapSupermarketCard: ComponentType<MapSupermarketCardProps>;
