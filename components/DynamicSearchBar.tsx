import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useMemo, useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/contexts/ThemeContext';
import SearchBar from './SearchBar';

const DynamicSearchBar = () => {
    const {colors} = useTheme();
    const styles = useMemo(() => appStyles(colors), [colors]);

    const [showSearch, setShowSearch] = useState(false);
    const [slideAnim] = useState(new Animated.Value(0)); // for smooth animation
    

    const toggleSearch = () => {
        setShowSearch(!showSearch);
        Animated.timing(slideAnim, {
            toValue: showSearch ? 0 : 1,
            duration: 250,
            useNativeDriver: false,
        }).start();
    };

    const slideDown = slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-60, 0], // Slide from hidden (-60) to visible (0)
    });

  return (
    <View>
      <TouchableOpacity style={[styles.iconButton, { marginRight: -24 }]} onPress={toggleSearch}>
          <Ionicons name="search" size={24} color={colors.primary} />
    </TouchableOpacity>

        {/* Animated SearchBar */}
        {showSearch && (
        <Animated.View style={[styles.searchWrapper, { transform: [{ translateY: slideDown }] }]}>
            <SearchBar placeholder="Search products, brands and categories" />
        </Animated.View>
        )}
    </View>
  )
}

export default DynamicSearchBar

const appStyles = (colors: any) => StyleSheet.create({
iconButton: {
    padding: 6,
    borderRadius: 50,
    backgroundColor: colors.background,
    marginHorizontal: 2,
  },
searchWrapper: {
     position: 'absolute',   // 🔑 important
      top: 48,                // below the icon / header
      left: 0,
      right: 0,
      width: 300,
      paddingHorizontal: 16,
      zIndex: 10,
  },
})