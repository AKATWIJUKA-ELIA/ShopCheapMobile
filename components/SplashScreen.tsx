import { View, Text, Animated, StyleSheet } from 'react-native'
import React from 'react'
import { Colors } from '@/constants/Colors';

const SplashScreen = () => {
    const imageScale = new Animated.Value(0.1);
    const imagePosition = new Animated.Value(-200);

    Animated.parallel([
        Animated.timing(imageScale, {
            toValue:1, //from 0.1 to 1 (scale)
            duration:1500,
            useNativeDriver:true,
        }),
        Animated.timing(imagePosition, {
            toValue:0, //Move from -200 (offscreen top) to 0 (centered)
            duration:1500,
            useNativeDriver:true,
        }),
    ]).start();

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require('@/assets/images/icon3.png')}
        style={[styles.image, {
            transform:[{scale:imageScale}, {translateY:imagePosition}]
        }]}
      />
    </View>
  )
}

export default SplashScreen;

const styles = StyleSheet.create({
    container:{
        flex:1,
        justifyContent:'center',
        alignItems:'center',
        backgroundColor:Colors.background
    },
    image:{
        width:200,
        height:200
    }
})