export type MapCoordinate = {
  latitude: number;
  longitude: number;
};

export type MapRegion = {
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
