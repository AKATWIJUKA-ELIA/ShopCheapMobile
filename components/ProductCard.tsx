import { Colors } from '@/constants/Colors'
import React from 'react'
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

type Props = {
  title: string
  price: string
  image: number
  oldPrice?: string
  discount?: string
}

export default function ProductCard({ title, price, image, oldPrice, discount }: Props) {
  return (
    <TouchableOpacity style={styles.container} activeOpacity={0.85}>
      <View style={{
          borderWidth:1,
          borderColor:Colors.lightgray,
          borderRadius:8,
          padding:8
        }}
        >
        <View style={styles.imageWrap}>
          <Image source={image} style={styles.image} resizeMode='contain' />
          {discount ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{discount}</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        {/* <View style={{ height: 6 }} /> */}
        <Text style={styles.price}>{price}</Text>
        {oldPrice ? <Text style={styles.oldPrice}>{oldPrice}</Text> : null}
      </View>

      <View></View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '50%',
    padding: 8,
  },
  imageWrap: {
    backgroundColor: '#0b0b0b',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    position: 'relative',
  },
  image: {
    width: '80%',
    height: '80%',
  },
  title: {
    color: Colors.text,
    fontSize: 12,
    marginTop: 8
  },
  price: {
    color: Colors.light,
    fontSize: 14,
    fontWeight: '700'
  },
  oldPrice: {
    color: 'red',
    fontSize: 12,
    textDecorationLine: 'line-through',
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  badgeText: {
    color: '#000',
    fontSize: 11,
    fontWeight: '700'
  }
})


