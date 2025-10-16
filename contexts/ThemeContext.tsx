import { Colors, lightColors } from '@/constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import * as Haptics from 'expo-haptics';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: 'light' | 'dark';
  themeMode: ThemeMode;
  colors: typeof Colors;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@theme_mode';

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [systemTheme, setSystemTheme] = useState<ColorSchemeName>(Appearance.getColorScheme());
  const [isLoading, setIsLoading] = useState(true);

  // Determine the actual theme based on mode and system preference
  const theme: 'light' | 'dark' = themeMode === 'system' 
    ? (systemTheme === 'light' ? 'light' : 'dark')
    : themeMode;

  // Get colors based on current theme
  const colors = theme === 'light' ? lightColors : Colors;

  // Load saved theme mode on app start
  useEffect(() => {
    const loadThemeMode = async () => {
      try {
        const savedThemeMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedThemeMode && ['light', 'dark', 'system'].includes(savedThemeMode)) {
          setThemeModeState(savedThemeMode as ThemeMode);
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading theme mode:', error);
        setIsLoading(false);
      }
    };

    loadThemeMode();
  }, []);

  // Listen to system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemTheme(colorScheme);
    });

    return () => subscription?.remove();
  }, []);

  // Save theme mode to storage
  const setThemeMode = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      setThemeModeState(mode);
    } catch (error) {
      console.error('Error saving theme mode:', error);
    }
  };

  // Toggle between light and dark (ignoring system mode)
  const toggleTheme = () => {
    const newMode = theme === 'light' ? 'dark' : 'light';
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
    setThemeMode(newMode);
  };

  // Don't render children until theme is loaded
  if (isLoading) {
    return null;
  }

  const value: ThemeContextType = {
    theme,
    themeMode,
    colors,
    setThemeMode,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
