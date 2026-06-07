export type ReservationItem = {
  id: string;
  supermarket_product_id: string;
  quantity: number;
  reserved_price: string;
  currency: string;
  product_id: string | null;
  product_name: string | null;
  product_image_url: string | null;
  supermarket_id: string | null;
  supermarket_name: string | null;
  expiration_date: string | null;
};

export type Reservation = {
  id: string;
  status: string;
  items: ReservationItem[];
  created_at: string;
  updated_at: string;
};
