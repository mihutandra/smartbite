export function normalizeImageUrl(url: string | null | undefined) {
  if (!url) {
    return null;
  }

  const trimmedUrl = url
    .trim()
    .replace(/^hhttps:\/\//i, "https://")
    .replace(/^http:\/\//i, "https://");

  if (!trimmedUrl || !isHttpUrl(trimmedUrl)) {
    return null;
  }

  return trimmedUrl;
}

export function getSupermarketLogoUrls(
  name: string,
  logoUrl: string | null | undefined,
) {
  const normalizedLogoUrl = normalizeImageUrl(logoUrl);
  const safeLogoUrl =
    normalizedLogoUrl && !isSvgImageUrl(normalizedLogoUrl) ? normalizedLogoUrl : null;

  return uniqueUrls([safeLogoUrl, getBrandLogoUrl(name)]);
}

function getBrandLogoUrl(name: string) {
  const normalizedName = name.toLowerCase();

  if (normalizedName.includes("kaufland")) {
    return "https://www.kaufland.ro/favicon.ico";
  }

  if (normalizedName.includes("lidl")) {
    return "https://www.lidl.ro/favicon.ico";
  }

  if (normalizedName.includes("mega image")) {
    return "https://www.mega-image.ro/favicon.ico";
  }

  if (normalizedName.includes("penny")) {
    return "https://www.penny.ro/favicon.ico";
  }

  if (normalizedName.includes("carrefour")) {
    return "https://carrefour.ro/favicon.ico";
  }

  if (normalizedName.includes("auchan")) {
    return "https://www.auchan.ro/favicon.ico";
  }

  if (normalizedName.includes("profi")) {
    return "https://www.profi.ro/favicon.ico";
  }

  return null;
}

function uniqueUrls(urls: Array<string | null>) {
  return Array.from(new Set(urls.filter((url): url is string => Boolean(url))));
}

function isSvgImageUrl(url: string) {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.pathname.toLowerCase().endsWith(".svg");
  } catch {
    return url.toLowerCase().includes(".svg");
  }
}

function isHttpUrl(url: string) {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
  } catch {
    return false;
  }
}
