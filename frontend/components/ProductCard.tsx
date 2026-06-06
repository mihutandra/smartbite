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
  const stockQuantity = Number(product.stock_quantity);
  const isOutOfStock =
    product.is_available === false || (Number.isFinite(stockQuantity) && stockQuantity <= 0);

  return (
    <Pressable onPress={onPress} style={[styles.card, isOutOfStock && styles.cardOutOfStock]}>
      <View style={[styles.imageWrap, isOutOfStock && styles.imageWrapOutOfStock]}>
        {product.product_image_url && !imageFailed ? (
          <Image
            source={{ uri: product.product_image_url }}
            style={[styles.image, isOutOfStock && styles.imageOutOfStock]}
            resizeMode="cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <View style={[styles.imageFallback, isOutOfStock && styles.imageFallbackOutOfStock]}>
            <Text style={[styles.imageFallbackText, isOutOfStock && styles.imageFallbackTextOutOfStock]}>
              {(product.product_name ?? "Produs").slice(0, 1).toUpperCase()}
            </Text>
          </View>
        )}

        {isOutOfStock ? (
          <>
            <View style={styles.outOfStockOverlay} />
            <View style={styles.outOfStockBadge}>
              <Text style={styles.outOfStockText}>Stoc epuizat</Text>
            </View>
          </>
        ) : discountPercentage > 0 ? (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{`-${discountPercentage}%`}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.content}>
        <Text numberOfLines={2} style={[styles.title, isOutOfStock && styles.titleOutOfStock]}>
          {product.product_name ?? "Produs"}
        </Text>
        <Text style={[styles.price, isOutOfStock && styles.priceOutOfStock]}>
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
  cardOutOfStock: {
    backgroundColor: "#F0EEE9",
    borderColor: "#D8D1C8",
    shadowOpacity: 0.04,
    elevation: 1,
  },
  imageWrap: {
    position: "relative",
    height: 148,
    backgroundColor: "#FAE2C8",
  },
  imageWrapOutOfStock: {
    backgroundColor: "#DCD8D2",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageOutOfStock: {
    opacity: 0.42,
  },
  imageFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5C58F",
  },
  imageFallbackOutOfStock: {
    backgroundColor: "#D7D3CD",
  },
  imageFallbackText: {
    color: "#A85928",
    fontSize: 36,
    fontWeight: "900",
  },
  imageFallbackTextOutOfStock: {
    color: "#8E877F",
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
  outOfStockBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    alignItems: "center",
    borderRadius: 999,
    backgroundColor: "#8E877F",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  outOfStockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(112, 107, 101, 0.24)",
  },
  outOfStockText: {
    color: "#FFFDF9",
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
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
  titleOutOfStock: {
    color: "#7D756D",
  },
  price: {
    color: "#347949",
    fontSize: 16,
    fontWeight: "900",
    textAlign: "center",
  },
  priceOutOfStock: {
    color: "#8E877F",
    textDecorationLine: "line-through",
  },
});
