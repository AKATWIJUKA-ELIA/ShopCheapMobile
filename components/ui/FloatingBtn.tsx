import React, { useMemo } from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';

type FloatingButtonProps = {
  onPress: () => void;
  onLongPress: () => void;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  style?: ViewStyle;
  size?: number;
  color?: string;
};

export default function FloatingButton({
  onPress,
  icon = 'message-alert',
  style,
  size = 28,
  color = Colors.primary,
  onLongPress,
}: FloatingButtonProps) {
      const router = useRouter();
      const {colors} = useTheme();
      const styles = useMemo(() => appStyles(colors), [colors]);

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      style={[styles.container, style]}
      activeOpacity={0.9}
    >
      <MaterialCommunityIcons name={icon} size={size} color={color} />
    </TouchableOpacity>
  );
}

const appStyles = (colors: any) => StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    right: 10,
    backgroundColor: colors.background,
    borderRadius: 99,
    padding: 10,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.75,
    shadowRadius: 7.5,
    elevation: 5, // for Android shadow
  },
});
