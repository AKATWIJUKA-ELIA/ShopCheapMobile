import React, { useEffect, useMemo, useRef, useState } from "react";
import {Modal, Pressable, StyleSheet, Animated, Dimensions, View, Platform, Easing} from "react-native";
import { BlurView } from "@react-native-community/blur";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/contexts/ThemeContext";

const { width, height } = Dimensions.get("window");

export default function CustomPopup({
  visible,
  onClose,
  widthPercent = 0.8,
  heightPercent = 0.7,
  blurType = "light",
  blurAmount = 10,
  children,
}:any) {
  const [internalVisible, setInternalVisible] = useState(visible);

  const blurOpacity = useRef(new Animated.Value(0)).current;
  const popupScale = useRef(new Animated.Value(0.8)).current;
  const popupOpacity = useRef(new Animated.Value(0)).current;

  const {colors, theme} = useTheme();
  const styles = useMemo(() => appStyles(colors), [colors]);

  useEffect(() => {
    if (visible) {
      setInternalVisible(true);

      // Reset values before animating
      blurOpacity.setValue(0);
      popupScale.setValue(0.85);
      popupOpacity.setValue(0);

      Animated.parallel([
        // Smooth blur fade-in
        Animated.timing(blurOpacity, {
          toValue: 1,
          duration: 700,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        // Popup scale + opacity (slightly delayed for better feel)
        Animated.spring(popupScale, {
          toValue: 1,
          damping: 10,
          stiffness: 120,
          mass: 0.7,
          useNativeDriver: true,
        }),
        Animated.timing(popupOpacity, {
          toValue: 1,
          duration: 350,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(blurOpacity, {
          toValue: 0,
          duration: 300,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(popupScale, {
          toValue: 0.85,
          duration: 300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(popupOpacity, {
          toValue: 0,
          duration: 300,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(() => setInternalVisible(false));
    }
  }, [visible]);

  if (!internalVisible) return null;

  return (
    <Modal transparent animationType="none" visible={internalVisible}>
      {/* Blur Overlay */}
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: blurOpacity }]}>
          {Platform.OS === "ios" || Platform.OS === "android" ? (
            <BlurView
              style={StyleSheet.absoluteFill}
              blurType={blurType}
              blurAmount={blurAmount}
              reducedTransparencyFallbackColor="rgba(0,0,0,0.3)"
            />
          ) : (
            <View style={styles.overlayFallback} />
          )}
        </Animated.View>
      </Pressable>

      {/* Popup */}
      <View style={styles.centerContainer}>
        <Animated.View
          style={[
            styles.popup,
            {
              width: width * widthPercent,
              height: height * heightPercent,
              opacity: popupOpacity,
              transform: [{ scale: popupScale }],
            },
          ]}
        >
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

const appStyles = (colors: any) => StyleSheet.create({
  overlayFallback: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  popup: {
    backgroundColor: colors.gray,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 8,
  },
});
