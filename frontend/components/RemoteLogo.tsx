import { useEffect, useState, type ReactNode } from "react";
import {
  Image,
  type ImageResizeMode,
  type ImageStyle,
  type StyleProp,
} from "react-native";
import { normalizeImageUrl } from "../utils/images";

type RemoteLogoProps = {
  fallback?: ReactNode;
  height: LogoDimension;
  onError?: () => void;
  resizeMode?: ImageResizeMode;
  style?: StyleProp<ImageStyle>;
  url?: string | null;
  urls?: string[];
  width: LogoDimension;
};

type LogoDimension = number | `${number}%`;

export function RemoteLogo({
  fallback = null,
  height,
  onError,
  resizeMode = "contain",
  style,
  url,
  urls,
  width,
}: RemoteLogoProps) {
  const imageUrls = urls?.length ? urls : [url ?? null];
  const normalizedUrls = imageUrls
    .map((candidateUrl) => normalizeImageUrl(candidateUrl))
    .filter((candidateUrl): candidateUrl is string => Boolean(candidateUrl));
  const normalizedUrlsKey = normalizedUrls.join("|");
  const [urlIndex, setUrlIndex] = useState(0);
  const imageUrl = normalizedUrls[urlIndex];

  useEffect(() => {
    setUrlIndex(0);
  }, [normalizedUrlsKey]);

  if (!imageUrl) {
    return <>{fallback}</>;
  }

  function handleError() {
    if (urlIndex < normalizedUrls.length - 1) {
      setUrlIndex((current) => current + 1);
      return;
    }

    onError?.();
    setUrlIndex(normalizedUrls.length);
  }

  return (
    <Image
      source={{ uri: imageUrl }}
      style={[style, { height, width }]}
      resizeMode={resizeMode}
      onError={handleError}
    />
  );
}
