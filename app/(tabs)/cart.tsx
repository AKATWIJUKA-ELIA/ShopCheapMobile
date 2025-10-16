import { clearCart, confirmClearCart, decrementCartItem, incrementCartItem, removeFromCart, useCartStore } from '@/components/Operations'
import RefreshScrollView from '@/components/RefreshScrollView'
import FloatingButton from '@/components/ui/FloatingBtn'
import { openHelpSideBar } from '@/components/ui/help'
import { Colors } from '@/constants/Colors'
import { useTheme } from '@/contexts/ThemeContext'
import { Ionicons, MaterialIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React, { useMemo } from 'react'
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

const Cart = () => {
  const { items, total } = useCartStore()
  const isEmpty = items.length === 0;
  const router = useRouter();

  const {colors} = useTheme();
  const styles = useMemo(() => appStyles(colors), [colors]);

  if (isEmpty) {
    return (
      <RefreshScrollView style={{flex:1, backgroundColor: colors.background}} contentContainerStyle={{flexGrow:1}}> 
        <View style={styles.containerCenter}>
          <View style={styles.illustration}>
            <MaterialIcons name='remove-shopping-cart' size={100} color={Colors.gray} />
            {/* <Image source={require('@/assets/images/icon.png')}
              style={{width:150, height:150}}
              resizeMode='cover'
            /> */}
          </View>
          <Text style={styles.title}>Your cart is empty</Text>
          <Text style={styles.subtitle}>Add items to continue.</Text>
          <TouchableOpacity style={styles.button} activeOpacity={0.7} onPress={() => router.push('/(tabs)/home')}>
            <Text style={styles.buttonText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      </RefreshScrollView>
    )
  }

  return (
    <View style={{flex:1}}>
          <RefreshScrollView style={styles.container}>
        {/* <Text style={styles.title}>Your Cart</Text> */}
        <View style={{ height: 12 }} />
        {items.map(ci => (
          <View key={ci.product.id} style={styles.itemRow}>
            <Image source={{ uri: ci.product.image }} style={styles.itemImage} />
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle} numberOfLines={2}>{ci.product.name}</Text>
              <Text style={styles.itemPrice}>${(ci.product.price * ci.quantity).toFixed(2)}</Text>
              <View style={styles.qtyRow}>
                <TouchableOpacity style={styles.qtyBtn} onPress={() => decrementCartItem(ci.product.id)}>
                  <Text style={styles.qtyBtnText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.qtyText}>{ci.quantity}</Text>
                <TouchableOpacity style={styles.qtyBtn} onPress={() => incrementCartItem(ci.product.id)}>
                  <Text style={styles.qtyBtnText}>+</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.removeBtn} onPress={() => removeFromCart(ci.product.id)}>
                  <Text style={styles.removeBtnText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
        </View>

        <TouchableOpacity onPress={() => router.navigate('/(tabs)/home')} style={{
          backgroundColor: colors.primary,
          padding: 12,
          borderRadius: 99,
          alignItems: 'center',
          flexDirection:'row',
          justifyContent:'center',
          gap:4,
          marginTop: -14,
          marginBottom:14
        }}>
          <Text style={{
            fontSize: 14,
            fontWeight: '700',
          }}>Continue Shopping</Text>
        </TouchableOpacity>

        <View style={{
            justifyContent:'space-between', 
            alignItems:'center', 
            marginBottom:50, 
            flexDirection:'row', 
            flex:1, 
            gap:10,
            display: isEmpty ? 'none' : 'flex'
          }}
        >
          <TouchableOpacity onPress={confirmClearCart}
            style={{
              // backgroundColor:colors.gray,
              padding: 12,
              borderRadius: 99,
              alignItems: 'center',
              flexDirection:'row',
              justifyContent:'center',
              gap:4,
          
            }}
          >
            <MaterialIcons name='delete-sweep' size={24} color={'red'}/>
            <Text style={{
              color: 'red',
              fontSize: 14,
              fontWeight: '700',
            }}>
              Clear Cart
            </Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/(modals)/checkout')}
            style={{
              backgroundColor: colors.primary,
              padding: 12,
              borderRadius: 99,
              alignItems: 'center',
              flexDirection:'row',
              justifyContent:'center',
              gap:4,
            }}
          >
            <MaterialIcons name='shopping-cart-checkout' size={24} color={colors.dark}/>
            <Text style={{
              color: colors.dark,
              fontSize: 14,
              fontWeight: '700',
            }}>
              Checkout
            </Text>
          </TouchableOpacity>

        </View>
      </RefreshScrollView>
      <FloatingButton onPress={openHelpSideBar}/>
    </View>
  )
}

export default Cart

const appStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16
  },
  containerCenter: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16
  },
  illustration: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700'
  },
  itemRow: {
    flexDirection: 'row',
    gap: 12,
    borderColor: colors.grayish,
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
  },
  itemImage: {
    width: 72,
    height: 72,
    borderRadius: 8,
  },
  itemTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600'
  },
  itemPrice: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 8,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 99,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  qtyBtnText: {
    color: colors.light,
    fontSize: 18,
    fontWeight: '700'
  },
  qtyText: {
    color: colors.text,
    fontSize: 14,
    minWidth: 20,
    textAlign: 'center',
  },
  removeBtn: {
    marginLeft: 'auto',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.primary
  },
  removeBtnText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600'
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#1f1f1f',
    marginBottom:30
  },
  totalLabel: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700'
  },
  totalValue: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: '800'
  },
  subtitle: {
    color: Colors.gray,
    marginTop: 6,
    marginBottom: 16
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8
  },
  buttonText: {
    color: '#000',
    fontWeight: '700'
  }
})