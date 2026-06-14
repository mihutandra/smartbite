import { API_BASE_URL } from "../constants/api";
import {
  type ShoppingCartAddResponse,
  type ShoppingCartItem,
  type ShoppingCartReservation,
  type ShoppingCartSavings,
} from "../types/shopping-cart";

export class ShoppingCartServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ShoppingCartServiceError";
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

  if (Array.isArray(detail) && detail.length > 0) {
    const firstError = detail[0];

    if (typeof firstError === "string" && firstError.trim()) {
      return firstError;
    }

    if (typeof firstError === "object" && firstError !== null) {
      const message = "msg" in firstError && typeof firstError.msg === "string" ? firstError.msg : undefined;

      if (message?.trim()) {
        return message;
      }
    }
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
    throw new ShoppingCartServiceError(
      extractErrorMessage(
        data ?? rawText,
        rawText.trim() || "Nu am reusit sa procesam cosul. Incearca din nou.",
      ),
    );
  }

  return data as T;
}

function createJsonHeaders(accessToken: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  };
}

export async function fetchShoppingCart(accessToken: string): Promise<ShoppingCartItem[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/shopping-cart/`, {
      method: "GET",
      headers: createJsonHeaders(accessToken),
    });
    const data = await parseApiResponse<ShoppingCartItem[]>(response);

    if (!Array.isArray(data)) {
      throw new ShoppingCartServiceError("Serverul a returnat un raspuns invalid.");
    }

    return data;
  } catch (error) {
    if (error instanceof ShoppingCartServiceError) {
      throw error;
    }

    throw new ShoppingCartServiceError(`Nu ne putem conecta la server la ${API_BASE_URL}.`);
  }
}

export async function addShoppingCartItem(
  accessToken: string,
  supermarketProductId: string,
  quantity: number,
  confirmReplace = false,
): Promise<ShoppingCartAddResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/shopping-cart/`, {
      method: "POST",
      headers: createJsonHeaders(accessToken),
      body: JSON.stringify({
        supermarket_product_id: supermarketProductId,
        quantity,
        confirm_replace: confirmReplace,
      }),
    });

    return await parseApiResponse<ShoppingCartAddResponse>(response);
  } catch (error) {
    if (error instanceof ShoppingCartServiceError) {
      throw error;
    }

    throw new ShoppingCartServiceError(`Nu ne putem conecta la server la ${API_BASE_URL}.`);
  }
}

export async function fetchShoppingCartSavings(accessToken: string): Promise<ShoppingCartSavings> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/shopping-cart/savings`, {
      method: "GET",
      headers: createJsonHeaders(accessToken),
    });
    const data = await parseApiResponse<ShoppingCartSavings>(response);

    if (typeof data?.total_savings !== "string" && typeof data?.total_savings !== "number") {
      throw new ShoppingCartServiceError("Serverul a returnat un raspuns invalid.");
    }

    return {
      total_savings: String(data.total_savings),
      currency: data.currency || "RON",
    };
  } catch (error) {
    if (error instanceof ShoppingCartServiceError) {
      throw error;
    }

    throw new ShoppingCartServiceError(`Nu ne putem conecta la server la ${API_BASE_URL}.`);
  }
}

export async function removeShoppingCartItem(
  accessToken: string,
  cartItemId: string,
): Promise<ShoppingCartAddResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/shopping-cart/${cartItemId}`, {
      method: "DELETE",
      headers: createJsonHeaders(accessToken),
    });

    return await parseApiResponse<ShoppingCartAddResponse>(response);
  } catch (error) {
    if (error instanceof ShoppingCartServiceError) {
      throw error;
    }

    throw new ShoppingCartServiceError(`Nu ne putem conecta la server la ${API_BASE_URL}.`);
  }
}

export async function confirmShoppingCart(
  accessToken: string,
  items: { cart_item_id: string; quantity: number }[],
): Promise<ShoppingCartReservation> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/shopping-cart/confirm`, {
      method: "POST",
      headers: createJsonHeaders(accessToken),
      body: JSON.stringify({ items }),
    });

    return await parseApiResponse<ShoppingCartReservation>(response);
  } catch (error) {
    if (error instanceof ShoppingCartServiceError) {
      throw error;
    }

    throw new ShoppingCartServiceError(`Nu ne putem conecta la server la ${API_BASE_URL}.`);
  }
}
