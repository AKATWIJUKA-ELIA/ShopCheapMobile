import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AddToCart, decrementCartItem, getCartQuantity, incrementCartItem, useCartStore } from './Operations';
import { useTheme } from '@/contexts/ThemeContext';

interface Product {
  id: number;
  name: string;
  image: string;
  price: number;
  description: string;
}

interface RenderItemProps {
  item: Product;
  index: number;
}

const RenderItem = ({ item: product }: RenderItemProps) => {
    const router = useRouter();
    const { items } = useCartStore()
    const qty = getCartQuantity(product.id);
    const {colors} = useTheme();
    const styles = useMemo(() => appStyles(colors), [colors]);

  return (
    <TouchableOpacity style={styles.container} onPress={() => router.push({ pathname: '/(modals)/product', params: { id: product.id } })} activeOpacity={0.8}>
      <Image 
        source={{ uri: product.image }} 
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.productInfo}>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.price}>${product.price}</Text>
        {/* <Text style={styles.description} numberOfLines={2}>
          {product.description}
        </Text> */}
        <View style={styles.buttonContainer}>
          {qty > 0 ? (
            <View style={{flexDirection:'row', alignItems:'center', gap:8, flex:1}}>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => decrementCartItem(product.id)}>
                <Text style={styles.qtyBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.qtyText}>{qty}</Text>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => incrementCartItem(product.id)}>
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.cartButton} onPress={() => AddToCart(product)}>
              <Ionicons name="cart-outline" size={16} color={colors.light} />
              <Text style={styles.buttonText}>Add to Cart</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const appStyles = (colors: any) => StyleSheet.create({
  container: {
    borderColor: colors.lightgray,
    borderWidth: 1,
    borderRadius: 5,
    height: 240,
    width: '48%',
    marginBottom: 20,
    backgroundColor: colors.background,
    padding: 7,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  name: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  price: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    color: colors.gray,
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  cartButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  wishlistButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderColor: colors.primary,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  qtyBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '800'
  },
  qtyText: {
    color: colors.text,
    fontSize: 14,
    minWidth: 20,
    textAlign: 'center',
  },
  buttonText: {
    color: colors.light,
    fontSize: 12,
    fontWeight: '600',
  },
  wishlistButtonText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
});

export default RenderItem;