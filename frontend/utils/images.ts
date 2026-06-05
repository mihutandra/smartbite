export function normalizeImageUrl(url: string | null | undefined) {
  if (!url) {
    return null;
  }

  const trimmedUrl = url.trim().replace(/^hhttps:\/\//i, "https://");

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
    return "https://www.google.com/s2/favicons?domain=kaufland.ro&sz=128";
  }

  if (normalizedName.includes("lidl")) {
    return "https://www.google.com/s2/favicons?domain=lidl.ro&sz=128";
  }

  if (normalizedName.includes("mega image")) {
    return "https://www.google.com/s2/favicons?domain=mega-image.ro&sz=128";
  }

  if (normalizedName.includes("penny")) {
    return "https://www.google.com/s2/favicons?domain=penny.ro&sz=128";
  }

  if (normalizedName.includes("carrefour")) {
    return "https://www.google.com/s2/favicons?domain=carrefour.ro&sz=128";
  }

  if (normalizedName.includes("auchan")) {
    return "https://www.google.com/s2/favicons?domain=auchan.ro&sz=128";
  }

  if (normalizedName.includes("profi")) {
    return "https://images.seeklogo.com/logo-png/22/2/profi-logo-png_seeklogo-225900.png";
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
