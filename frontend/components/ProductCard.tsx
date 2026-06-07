import { useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { type SupermarketProduct } from "../types/supermarket";
import { calculateDiscountPercentage, formatCurrency } from "../utils/product_detail";

type ProductCardProps = {
  product: SupermarketProduct;
  onPress?: () => void;
};

export function ProductCard({ product, onPress }: ProductCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const discountPercentage = calculateDiscountPercentage(product);

  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.imageWrap}>
        {product.product_image_url && !imageFailed ? (
          <Image
            source={{ uri: product.product_image_url }}
            style={styles.image}
            resizeMode="cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <View style={styles.imageFallback}>
            <Text style={styles.imageFallbackText}>
              {(product.product_name ?? "Produs").slice(0, 1).toUpperCase()}
            </Text>
          </View>
        )}

        {discountPercentage > 0 ? (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{`-${discountPercentage}%`}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.content}>
        <Text numberOfLines={2} style={styles.title}>
          {product.product_name ?? "Produs"}
        </Text>
        <Text style={styles.price}>
          {formatCurrency(product.discount_price, product.currency)}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 0,
    overflow: "hidden",
    borderRadius: 24,
    backgroundColor: "#FFFDF9",
    borderWidth: 1,
    borderColor: "#EFE1CC",
    shadowColor: "#CBA26F",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 4,
  },
  imageWrap: {
    position: "relative",
    height: 148,
    backgroundColor: "#FAE2C8",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5C58F",
  },
  imageFallbackText: {
    color: "#A85928",
    fontSize: 36,
    fontWeight: "900",
  },
  discountBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    borderRadius: 999,
    backgroundColor: "#D66C2D",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  discountText: {
    color: "#FFF9F0",
    fontSize: 11,
    fontWeight: "900",
  },
  content: {
    gap: 10,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
  },
  title: {
    minHeight: 48,
    color: "#362E29",
    fontSize: 15,
    fontWeight: "900",
    textAlign: "center",
    lineHeight: 22,
  },
  price: {
    color: "#347949",
    fontSize: 16,
    fontWeight: "900",
    textAlign: "center",
  },
});
