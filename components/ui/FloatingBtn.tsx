import React, { useMemo } from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';

type FloatingButtonProps = {
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
  size?: number;
  color?: string;
};

export default function FloatingButton({
  onPress,
  icon = 'chatbubble',
  style,
  size = 28,
  color = Colors.primary,
}: FloatingButtonProps) {
      const router = useRouter();
      const {colors} = useTheme();
      const styles = useMemo(() => appStyles(colors), [colors]);
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container, style]}
      activeOpacity={0.7}
    >
      <Ionicons name={icon} size={size} color={color} />
    </TouchableOpacity>
  );
}

const appStyles = (colors: any) => StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    right: 10,
    backgroundColor: colors.text,
    borderRadius: 99,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5, // for Android shadow
  },
});
