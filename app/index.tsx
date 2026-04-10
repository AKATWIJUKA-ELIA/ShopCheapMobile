// app/splash.tsx
import React, { useEffect, useRef, useState } from "react";
import { View, Animated, StyleSheet, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";

const { width, height } = Dimensions.get("window");

export default function SplashScreen() {
  const [showFirst, setShowFirst] = useState(true);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const router = useRouter();

  useEffect(() => {
    // Step 1: Show first image for 1s, then crossfade to second image
    const timer = setTimeout(() => {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowFirst(false);

        // Add subtle scale animation for 2nd image
        Animated.spring(scaleAnim, {
          toValue: 1.1,
          useNativeDriver: true,
          friction: 4,
        }).start();
      });
    }, 1000);

    // Step 2: After 2s, navigate to home
    const redirect = setTimeout(() => {
      router.replace("/home"); // 👈 Change to your destination
    }, 2000);

    return () => {
      clearTimeout(timer);
      clearTimeout(redirect);
    };
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={
          showFirst
            ? require("@/assets/images/splashScreen1.png")
            : require("@/assets/images/splashScreen2.png")
        }
        style={[
          styles.image,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background, // match your brand color
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 500,
    height: 500,
    justifyContent:'center',
    alignItems:'center'
  },
});
