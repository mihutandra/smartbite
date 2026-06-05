export function getRenderableImageUrl(url: string | null | undefined) {
  if (!url) {
    return null;
  }

  const trimmedUrl = url.trim();

  if (!trimmedUrl || !isHttpUrl(trimmedUrl) || isSvgUrl(trimmedUrl)) {
    return null;
  }

  return trimmedUrl;
}

function isHttpUrl(url: string) {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
  } catch {
    return false;
  }
}

function isSvgUrl(url: string) {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.pathname.toLowerCase().endsWith(".svg");
  } catch {
    return url.toLowerCase().includes(".svg");
  }
}
