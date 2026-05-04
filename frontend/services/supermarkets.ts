import { API_BASE_URL } from "../constants/api";

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
  is_active?: boolean;
  created_at?: string;
  updated_at?: string | null;
};

export type SupermarketProduct = {
  id: string;
  supermarket_id: string;
  product_id: string;
  product_name: string | null;
  supermarket_name: string | null;
  original_price: string;
  discount_price: string;
  currency: string;
  expiration_date: string;
  stock_quantity: number;
  store_product_code: string | null;
  is_available: boolean;
};

export class SupermarketServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SupermarketServiceError";
  }
}

function extractErrorMessage(data: unknown, fallbackMessage: string) {
  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (typeof data !== "object" || data === null) {
    return fallbackMessage;
  }

  const detail = "detail" in data ? data.detail : undefined;

  if (typeof detail === "string" && detail.trim()) {
    return detail;
  }

  return fallbackMessage;
}

async function parseApiResponse<T>(response: Response): Promise<T> {
  const rawText = await response.text();
  let data: unknown = null;

  if (rawText) {
    try {
      data = JSON.parse(rawText);
    } catch {
      data = rawText;
    }
  }

  if (!response.ok) {
    throw new SupermarketServiceError(
      extractErrorMessage(
        data ?? rawText,
        rawText.trim() || "Nu am reusit sa procesam cererea. Incearca din nou.",
      ),
    );
  }

  return data as T;
}

function createQueryString(params: Record<string, string | number | undefined>) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.set(key, String(value));
    }
  });

  const queryString = searchParams.toString();

  return queryString ? `?${queryString}` : "";
}

export async function fetchSupermarkets(page = 1, pageSize = 20): Promise<Supermarket[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/supermarkets/${createQueryString({ page, page_size: pageSize })}`,
    );

    const data = await parseApiResponse<Supermarket[]>(response);

    if (!Array.isArray(data)) {
      throw new SupermarketServiceError("Serverul a returnat un raspuns invalid.");
    }

    return data;
  } catch (error) {
    if (error instanceof SupermarketServiceError) {
      throw error;
    }

    throw new SupermarketServiceError(`Nu ne putem conecta la server la ${API_BASE_URL}.`);
  }
}

export async function fetchSupermarketDetails(supermarketId: string): Promise<Supermarket> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/supermarkets/${supermarketId}/details`);
    const data = await parseApiResponse<Supermarket>(response);

    if (typeof data?.id !== "string" && typeof supermarketId === "string") {
      return { ...data, id: supermarketId };
    }

    return data;
  } catch (error) {
    if (error instanceof SupermarketServiceError) {
      throw error;
    }

    throw new SupermarketServiceError(`Nu ne putem conecta la server la ${API_BASE_URL}.`);
  }
}

export async function fetchSupermarketProducts(
  supermarketId: string,
  page = 1,
  pageSize = 100,
): Promise<SupermarketProduct[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/supermarket-products/${supermarketId}/products${createQueryString({
        page,
        page_size: pageSize,
      })}`,
    );

    const data = await parseApiResponse<SupermarketProduct[]>(response);

    if (!Array.isArray(data)) {
      throw new SupermarketServiceError("Serverul a returnat un raspuns invalid.");
    }

    return data;
  } catch (error) {
    if (error instanceof SupermarketServiceError) {
      throw error;
    }

    throw new SupermarketServiceError(`Nu ne putem conecta la server la ${API_BASE_URL}.`);
  }
}
