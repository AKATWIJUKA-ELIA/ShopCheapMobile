import RefreshScrollView from '@/components/RefreshScrollView'
import { Colors } from '@/constants/Colors'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React from 'react'
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

const Wishlist = () => {
  const isEmpty = false;
  const router = useRouter();

  if (isEmpty) {
    return (
      <RefreshScrollView style={{flex:1, backgroundColor: Colors.background}} contentContainerStyle={{flexGrow:1}}> 
      <View style={styles.containerCenter}>
        <View style={styles.illustration}>
          <Ionicons name='heart-outline' size={56} color={Colors.gray} />
        </View>
        <Text style={styles.title}>Your Wishlist is empty</Text>
        <Text style={styles.subtitle}>Save items you like to find them later.</Text>
        <TouchableOpacity style={styles.button} activeOpacity={0.7} onPress={() => router.push('/(tabs)/home')}>
          <Text style={styles.buttonText}>Browse Products</Text>
        </TouchableOpacity>
      </View>
      </RefreshScrollView>
    )
  }

  return (
    <View style={styles.container}>
      <View style={{
          borderColor:Colors.lightgray, 
          borderWidth:1, 
          borderRadius:8, 
          flexDirection:'row',
          height:100,
          justifyContent:'space-between'
        }}
      >
        <View style={{padding:10}}>
          <Text style={{color:Colors.light}}>Product Name</Text>
          <Text style={{color:Colors.gray}}>Product Details</Text>
          <Text style={{color:Colors.gray}}>Product Price</Text>
        </View>

        <View style={{padding:5}}>
          <Image source={require('@/assets/images/phones.jpg')}
            style={{width:80, height:80, borderRadius:15}}
          />
        </View>
      </View>
    </View>
  )
}

export default Wishlist

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 16,
  },
  containerCenter: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16
  },
  illustration: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#0f0f0f',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  title: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '700'
  },
  subtitle: {
    color: Colors.gray,
    marginTop: 6,
    marginBottom: 16
  },
  button: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8
  },
  buttonText: {
    color: '#000',
    fontWeight: '700'
  }
})