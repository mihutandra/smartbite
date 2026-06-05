export type Supermarket = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone_number: string | null;
  email: string | null;
  website: string | null;
  logo_url: string | null;
  opening_hours: Record<string, unknown> | null;
  rating?: number | null;
  distance_km?: number | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string | null;
};

export type SupermarketMapMarker = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  logo_url: string | null;
  rating: number | null;
  offers_count: number;
  distance_km: number | null;
};

export type SupermarketProduct = {
  id: string;
  supermarket_id: string;
  product_id: string;
  product_name: string | null;
  product_description: string | null;
  product_image_url: string | null;
  product_proxy_image_url?: string | null;
  product_brand: string | null;
  category_name: string | null;
  supermarket_name: string | null;
  original_price: string;
  discount_price: string;
  currency: string;
  expiration_date: string;
  stock_quantity: number;
  store_product_code: string | null;
  is_available: boolean;
};
