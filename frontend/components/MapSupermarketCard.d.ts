import type { ComponentType } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { type MapCoordinate, type MapMarker, type MapRegion } from "../types/map";

export { type MapCoordinate, type MapMarker, type MapRegion };

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

export const MapSupermarketCard: ComponentType<MapSupermarketCardProps>;
