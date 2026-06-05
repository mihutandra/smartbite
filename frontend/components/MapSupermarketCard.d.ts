import type { ComponentType } from "react";
import type { StyleProp, ViewStyle } from "react-native";

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

export const MapSupermarketCard: ComponentType<MapSupermarketCardProps>;
