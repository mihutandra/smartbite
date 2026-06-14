export type ShoppingCartItem = {
  id: string;
  quantity: number;
  supermarket_product_id: string;
  product_id: string | null;
  product_name: string | null;
  product_image_url: string | null;
  supermarket_id: string | null;
  supermarket_name: string | null;
  original_price: string | null;
  discount_price: string | null;
  savings_per_unit: string | null;
  savings_total: string | null;
  currency: string | null;
  expiration_date: string | null;
  stock_quantity: number | null;
  created_at: string;
  updated_at: string;
};

export type ShoppingCartAddResponse = {
  message: string;
  cart_replaced: boolean;
};

export type ShoppingCartSavings = {
  total_savings: string;
  currency: string;
};

export type ShoppingCartReservation = {
  id: string;
  status: string;
  created_at: string;
  updated_at: string | null;
  items: {
    id: string;
    supermarket_product_id: string;
    quantity: number;
    reserved_price: string;
    currency: string;
  }[];
};
