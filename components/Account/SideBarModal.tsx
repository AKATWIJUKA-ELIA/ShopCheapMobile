import React, { useEffect, useRef, useState } from "react";
import {Modal, Pressable, StyleSheet, Animated, Dimensions, View, Platform} from "react-native";
import { BlurView } from "@react-native-community/blur";
import { Colors } from "@/constants/Colors";

const { width, height } = Dimensions.get("window");

export default function SidebarModal({
  visible,
  onClose,
  widthPercent = 0.7,
  heightPercent = 0.6,
  top = null,
  bottom = null,
  side = "left",
  blurType = "dark",
  blurAmount = 10,
  children,
}: any) {
  const [internalVisible, setInternalVisible] = useState(visible);

  const slideAnim = useRef(new Animated.Value(side === "left" ? -width : width)).current;
  const blurOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setInternalVisible(true);

      // Reset animations
      slideAnim.setValue(side === "left" ? -width : width);
      blurOpacity.setValue(0);

      // Run animations in parallel
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(blurOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: side === "left" ? -width : width,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(blurOpacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start(() => setInternalVisible(false));
    }
  }, [visible, side]);

  if (!internalVisible) return null;

  return (
    <Modal transparent animationType="none" visible={internalVisible}>
      {/* BLUR OVERLAY with animated opacity */}
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

      {/* SIDEBAR */}
      <Animated.View
        style={[
          styles.sidebar,
          {
            width: width * widthPercent,
            height: height * heightPercent,
            [side]: 0,
            top: top !== null ? top : undefined,
            bottom: bottom !== null ? bottom : undefined,
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        {children}
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlayFallback: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  sidebar: {
    position: "absolute",
    backgroundColor: Colors.gray,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 2, height: 2 },
    shadowRadius: 8,
    elevation: 5,
  },
});
