import CategoryTile from '@/components/CategoryTile'
import { AddToCart, decrementCartItem, getCartQuantity, incrementCartItem } from '@/components/Operations'
import { triggerShare } from '@/components/Share'
import { Colors } from '@/constants/Colors'
import { categories, products } from '@/constants/data'
import { useTheme } from '@/contexts/ThemeContext'
import { Entypo, FontAwesome, Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useMemo } from 'react'
import { Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

export default function ProductModal() {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const productId = Number(id)
  const product = products.find(p => p.id === productId)
  const qty = getCartQuantity(productId);

  const {colors} = useTheme();
  const styles = useMemo(() => appStyles(colors), [colors]);

  if (!product) {
    return (
      <View style={styles.containerCenter}>
        <Text style={styles.title}>Product not found</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Close</Text>
        </TouchableOpacity>
      </View>
    )
  }


  return (
    <View style={styles.container}>

      <View style={{flexDirection:'row'}}>
        <TouchableOpacity onPress={() => router.back()} style={{
          backgroundColor:colors.background, 
          padding:20}}
        >
          {Platform.OS === 'android'? <Ionicons name="arrow-back" size={24} color={colors.primary}/>: undefined}
        </TouchableOpacity>

        <Text style={{color:colors.primary, fontSize:24, fontWeight:'bold', padding:20}}>
          {product.name}
        </Text>
      </View>

      <ScrollView style={{ padding: 16 }}>
        <Image source={{ uri: product.image }} style={styles.image} resizeMode='cover' />

          <Text style={styles.title}>{product.name}</Text>
          <Text style={styles.price}>${product.price}</Text>
          <View style={{ height: 8 }} />
          <Text style={styles.description}>{product.description}</Text>
          <View style={{ height: 16 }} />

          <View style={{flexDirection:'row', flex:1 }}>
            {qty > 0 ? (
              <View style={styles.qtyRow}>
                <TouchableOpacity style={styles.qtyBtn} onPress={() => decrementCartItem(product.id)}>
                  <Text style={styles.qtyBtnText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.qtyText}>{qty}</Text>
                <TouchableOpacity style={styles.qtyBtn} onPress={() => incrementCartItem(product.id)}>
                  <Text style={styles.qtyBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.addButton} onPress={() => AddToCart(product)}>
                <Text style={styles.addButtonText}>Add to Cart</Text>
              </TouchableOpacity>
            )}
          
            <View style={{flex:1, flexDirection:'row', justifyContent:'flex-end', alignItems:'center'}}>
              <TouchableOpacity style={{marginLeft:20}}>
                <FontAwesome name='thumbs-o-up' size={28} color={colors.primary}/>
              </TouchableOpacity>

              <TouchableOpacity style={{marginLeft:20}}
                onPress={() => triggerShare("Hello! This is a message.", 'https://www.shopcheapug.com/home')}
              >
                <Entypo name='share' size={28} color={colors.primary}/>
              </TouchableOpacity>
            </View>
          </View>

  {/* seller details */}
          <View style={{
            marginTop:24,
            padding:16,
            borderWidth:1,
            borderColor:colors.gray,
            borderRadius:8,
            marginBottom:50
              }}
            >
              <Text style={{
                color:colors.text, 
                fontSize:18, 
                fontWeight:'bold',
                marginBottom:12
                }}
              >
                Seller Details
              </Text>
              <View style={{flexDirection:'row', flex:1, justifyContent:'space-between'}} >
                <View>
                <Text style={styles.sellerDetails}>Name:</Text>
                <Text style={styles.sellerDetails}>Username:</Text>
                <Text style={styles.sellerDetails}>Email:</Text>
                <Text style={styles.sellerDetails}>Contact:</Text>
              </View>

              <View>
                <Text style={styles.sellerDetails}>Name:</Text>
                <Text style={styles.sellerDetails}>Username:</Text>
                <Text style={styles.sellerDetails}>Email:</Text>
                <Text style={styles.sellerDetails}>Contact:</Text>
              </View>
            </View>
          </View>

  {/*  More products from the same seller        */}
          <View style={{marginTop:-10, marginBottom:100}}>
            <Text style={styles.sellerDetails}>More Products from the Seller</Text>
            <View style={{}}>
              <ScrollView horizontal style={[styles.categoriesWrap, {marginTop:12}]}
                showsHorizontalScrollIndicator={false}
              >
                {categories.slice(0, 8).map((c, idx) => (
                  <CategoryTile key={idx} title={c.title} image={c.image}/>
                ))}
              </ScrollView>
            </View>
          </View>


  {/*  Related Products     */}
          <View style={{marginTop:-50, marginBottom:100}}>
            <Text style={styles.sellerDetails}>Related Products</Text>
            <View style={{}}>
              <ScrollView horizontal style={[styles.categoriesWrap, {marginTop:12}]}
                showsHorizontalScrollIndicator={false}
              >
                {categories.slice(0, 8).map((c, idx) => (
                  <CategoryTile key={idx} title={c.title} image={c.image}/>
                ))}
              </ScrollView>
            </View>
          </View>
      </ScrollView>
    </View>
  )
}

const appStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  containerCenter: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16
  },
  image: {
    width: '100%',
    height: 320,
    backgroundColor: '#111'
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700'
  },
  price: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 4
  },
  description: {
    color: colors.grayish,
    fontSize: 14,
    lineHeight: 20
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    width: '60%'
  },
  addButtonText: {
    color: '#000',
    fontWeight: '800',
    fontSize: 16
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  qtyBtn: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  qtyBtnText: {
    color: '#000',
    fontSize: 20,
    fontWeight: '900'
  },
  qtyText: {
    color: colors.text,
    fontSize: 16,
    minWidth: 24,
    textAlign: 'center'
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 12
  },
  buttonText: {
    color: '#000',
    fontWeight: '700'
  },
  sellerDetails:{
    color:colors.text, 
    fontSize:16, 
    marginTop:4
  },
    categoriesWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap'
  },
})



