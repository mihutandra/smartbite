import { API_BASE_URL } from "../constants/api";
import { type Supermarket, type SupermarketProduct } from "../types/supermarket";

export class SupermarketServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SupermarketServiceError";
  }
}

const PRODUCT_COUNT_PAGE_SIZE = 100;
const PRODUCT_COUNT_MAX_PAGES = 10;
const SUPERMARKET_PAGE_SIZE = 100;
const SUPERMARKET_MAX_PAGES = 10;
const SUPERMARKET_PRODUCTS_PAGE_SIZE = 100;
const SUPERMARKET_PRODUCTS_MAX_PAGES = 10;

function withProductProxyImageUrl(product: SupermarketProduct): SupermarketProduct {
  return {
    ...product,
    product_proxy_image_url: `${API_BASE_URL}/api/products/${product.product_id}/image`,
  };
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
    const queryString = createQueryString({ page, page_size: pageSize });
    const response = await fetch(
      `${API_BASE_URL}/api/supermarkets${queryString}`,
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

export async function fetchSupermarket(supermarketId: string): Promise<Supermarket> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/supermarkets/${supermarketId}`);
    const data = await parseApiResponse<Supermarket>(response);

    if (typeof data?.id !== "string") {
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

    if (Array.isArray(data)) {
      throw new SupermarketServiceError("Serverul a returnat un raspuns invalid.");
    }

    if (typeof data === "object" && data !== null && typeof data.id !== "string") {
      return { ...data, id: supermarketId };
    }

    if (typeof data !== "object" || data === null || typeof data.id !== "string") {
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

    return data.map(withProductProxyImageUrl);
  } catch (error) {
    if (error instanceof SupermarketServiceError) {
      throw error;
    }

    throw new SupermarketServiceError(`Nu ne putem conecta la server la ${API_BASE_URL}.`);
  }
}

export async function fetchAllSupermarkets(
  pageSize = SUPERMARKET_PAGE_SIZE,
): Promise<Supermarket[]> {
  try {
    const supermarkets: Supermarket[] = [];
    let page = 1;

    while (page <= SUPERMARKET_MAX_PAGES) {
      const currentPage = await fetchSupermarkets(page, pageSize);
      supermarkets.push(...currentPage);

      if (currentPage.length < pageSize) {
        break;
      }

      page += 1;
    }

    return supermarkets;
  } catch (error) {
    if (error instanceof SupermarketServiceError) {
      throw error;
    }

    throw new SupermarketServiceError(`Nu ne putem conecta la server la ${API_BASE_URL}.`);
  }
}

export async function fetchAllSupermarketProducts(
  supermarketId: string,
  pageSize = SUPERMARKET_PRODUCTS_PAGE_SIZE,
): Promise<SupermarketProduct[]> {
  try {
    const products: SupermarketProduct[] = [];
    let page = 1;

    while (page <= SUPERMARKET_PRODUCTS_MAX_PAGES) {
      const currentPage = await fetchSupermarketProducts(supermarketId, page, pageSize);
      products.push(...currentPage);

      if (currentPage.length < pageSize) {
        break;
      }

      page += 1;
    }

    return products;
  } catch (error) {
    if (error instanceof SupermarketServiceError) {
      throw error;
    }

    throw new SupermarketServiceError(`Nu ne putem conecta la server la ${API_BASE_URL}.`);
  }
}

export async function fetchSupermarketProduct(
  supermarketProductId: string,
): Promise<SupermarketProduct> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/supermarket-products/${supermarketProductId}`);
    const data = await parseApiResponse<SupermarketProduct>(response);

    if (typeof data?.id !== "string") {
      throw new SupermarketServiceError("Serverul a returnat un raspuns invalid.");
    }

    return withProductProxyImageUrl(data);
  } catch (error) {
    if (error instanceof SupermarketServiceError) {
      throw error;
    }

    throw new SupermarketServiceError(`Nu ne putem conecta la server la ${API_BASE_URL}.`);
  }
}

export async function fetchAllSupermarketCatalogProducts(
  pageSize = SUPERMARKET_PRODUCTS_PAGE_SIZE,
): Promise<SupermarketProduct[]> {
  try {
    const products: SupermarketProduct[] = [];
    let page = 1;

    while (page <= SUPERMARKET_PRODUCTS_MAX_PAGES) {
      const response = await fetch(
        `${API_BASE_URL}/api/supermarket-products${createQueryString({
          page,
          page_size: pageSize,
        })}`,
      );

      const data = await parseApiResponse<SupermarketProduct[]>(response);

      if (!Array.isArray(data)) {
        throw new SupermarketServiceError("Serverul a returnat un raspuns invalid.");
      }

      products.push(...data);

      if (data.length < pageSize) {
        break;
      }

      if (page === SUPERMARKET_PRODUCTS_MAX_PAGES) {
        throw new SupermarketServiceError(
          "Catalogul de produse este prea mare pentru limita curenta de paginare. Rezultatele ar fi incomplete.",
        );
      }

      page += 1;
    }

    return products;
  } catch (error) {
    if (error instanceof SupermarketServiceError) {
      throw error;
    }

    throw new SupermarketServiceError(`Nu ne putem conecta la server la ${API_BASE_URL}.`);
  }
}

export async function fetchSupermarketProductCounts(
  pageSize = PRODUCT_COUNT_PAGE_SIZE,
): Promise<Record<string, number>> {
  try {
    const counts: Record<string, number> = {};
    let page = 1;

    // TODO: Replace this client-side pagination sweep once the backend exposes
    // a dedicated supermarket offer-count endpoint or includes counts on the
    // supermarket list response.
    while (page <= PRODUCT_COUNT_MAX_PAGES) {
      const queryString = createQueryString({ page, page_size: pageSize });
      const response = await fetch(`${API_BASE_URL}/api/supermarket-products${queryString}`);
      const data = await parseApiResponse<SupermarketProduct[]>(response);

      if (!Array.isArray(data)) {
        throw new SupermarketServiceError("Serverul a returnat un raspuns invalid.");
      }

      data.forEach((product) => {
        counts[product.supermarket_id] = (counts[product.supermarket_id] ?? 0) + 1;
      });

      if (data.length < pageSize) {
        break;
      }

      page += 1;
    }

    // TODO: If we ever hit this cap in practice, stop extending the client sweep
    // and switch to a backend count endpoint instead of pulling more pages here.

    return counts;
  } catch (error) {
    if (error instanceof SupermarketServiceError) {
      throw error;
    }

    throw new SupermarketServiceError(`Nu ne putem conecta la server la ${API_BASE_URL}.`);
  }
}

export async function searchSupermarketProducts(
  item: string,
  page = 1,
  pageSize = 100,
): Promise<SupermarketProduct[]> {
  try {
    const queryString = createQueryString({ item, page, page_size: pageSize });
    const response = await fetch(`${API_BASE_URL}/api/supermarket-products/search${queryString}`);

    const data = await parseApiResponse<SupermarketProduct[]>(response);

    if (!Array.isArray(data)) {
      throw new SupermarketServiceError("Serverul a returnat un raspuns invalid.");
    }

    return data.map(withProductProxyImageUrl);
  } catch (error) {
    if (error instanceof SupermarketServiceError) {
      throw error;
    }

    throw new SupermarketServiceError(`Nu ne putem conecta la server la ${API_BASE_URL}.`);
  }
}
