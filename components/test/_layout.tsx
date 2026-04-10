import UpdatesModalController from '@/components/Updates';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import React from 'react';
import { Platform, StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

function AppContent() {
  const { colors } = useTheme();

  return (
    <GestureHandlerRootView>
      <SafeAreaView style={{flex:1, backgroundColor: colors.background}}>
        <Stack>
          <Stack.Screen name="index" options={{headerShown:false}}/>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false, presentation:'modal' }} />
          <Stack.Screen name="(modals)" options={{ headerShown: false, presentation:'modal' }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar  barStyle={'default'} backgroundColor={Platform.OS === 'android' ? colors.primary : 'white'}/>
        <UpdatesModalController />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
