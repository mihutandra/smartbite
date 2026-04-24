import type { ImageSourcePropType } from "react-native";

export type ProductItem = {
  id: string;
  name: string;
  price: string;
  weight: string;
  badge?: string;
};

export type SupermarketStore = {
  id: string;
  name: string;
  shortMapName: string;
  address: string;
  distanceKm: number;
  rating: number;
  offersCount: number;
  accentColor: string;
  logoLabel?: string;
  shortLabel: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  imageSource?: ImageSourcePropType;
  heroNote: string;
  products: ProductItem[];
};

export const STORES: SupermarketStore[] = [
  {
    id: "auchan",
    name: "Auchan Hypermarket",
    shortMapName: "Auchan",
    address: "Strada Alexandru Vaida Voevod Nr. 53B",
    distanceKm: 0.8,
    rating: 4.8,
    offersCount: 3,
    accentColor: "#E06F34",
    logoLabel: "A",
    shortLabel: "A",
    coordinate: {
      latitude: 46.77035,
      longitude: 23.6394,
    },
    heroNote: "Produse recomandate din magazinul selectat",
    products: [
      { id: "a-1", name: "Rosii cherry", price: "9.99 lei", weight: "500 g", badge: "-15%" },
      { id: "a-2", name: "Piept de pui", price: "24.50 lei", weight: "1 kg" },
      { id: "a-3", name: "Iaurt grecesc", price: "6.40 lei", weight: "400 g", badge: "2+1" },
      { id: "a-4", name: "Paine cu maia", price: "7.20 lei", weight: "650 g" },
    ],
  },
  {
    id: "kaufland",
    name: "Kaufland Supermarket",
    shortMapName: "Kaufland",
    address: "Strada Aurel Vlaicu 182",
    distanceKm: 1.2,
    rating: 4.5,
    offersCount: 2,
    imageSource: require("../assets/images/kaufland.png"),
    accentColor: "#E04935",
    shortLabel: "K",
    coordinate: {
      latitude: 46.77225,
      longitude: 23.6287,
    },
    heroNote: "Promotii active si produse populare in acest magazin",
    products: [
      { id: "k-1", name: "Banane", price: "6.99 lei", weight: "1 kg", badge: "Oferta" },
      { id: "k-2", name: "Lapte 1.5%", price: "5.89 lei", weight: "1 l" },
      { id: "k-3", name: "Cascaval felii", price: "11.50 lei", weight: "300 g" },
      { id: "k-4", name: "Apa minerala", price: "3.20 lei", weight: "2 l" },
    ],
  },
  {
    id: "carrefour",
    name: "Carrefour Market",
    shortMapName: "Carrefour",
    address: "Strada Calea Floresti 162",
    distanceKm: 3.5,
    rating: 4.2,
    offersCount: 1,
    accentColor: "#4D8E6A",
    logoLabel: "C",
    shortLabel: "C",
    coordinate: {
      latitude: 46.7739,
      longitude: 23.6468,
    },
    heroNote: "Selectie rapida de produse pentru cosul tau",
    products: [
      { id: "c-1", name: "Somon file", price: "32.90 lei", weight: "500 g", badge: "Fresh" },
      { id: "c-2", name: "Mix salata", price: "8.30 lei", weight: "250 g" },
      { id: "c-3", name: "Cafea boabe", price: "28.50 lei", weight: "500 g" },
      { id: "c-4", name: "Ciocolata neagra", price: "7.10 lei", weight: "100 g" },
    ],
  },
];

export const INITIAL_REGION = {
  latitude: 46.7719,
  longitude: 23.6372,
  latitudeDelta: 0.018,
  longitudeDelta: 0.02,
};

export function getStoreById(storeId: string) {
  return STORES.find((store) => store.id === storeId);
}
