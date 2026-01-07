import UpdatesModalController from '@/components/Updates';
import { Colors } from '@/constants/Colors';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { Platform, StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

function CartSync() {
  const { user } = useAuthStore();
  const { fetchCart, fetchBookmarks } = useCartStore();

  useEffect(() => {
    console.log(`[CartSync] User State Changed: ${user ? user.email + ' (' + user._id + ')' : 'Logged Out'}`);
    if (user) {
      fetchCart();
      fetchBookmarks();
    }
  }, [user]);

  return null;
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  };


  return (
    // <SafeAreaView style={{flex:1}}>
    <ThemeProvider>
      <GestureHandlerRootView>
        <BottomSheetModalProvider>
          <SafeAreaView style={{ flex: 1 }}>
            <Stack screenOptions={{
              headerShown: false
            }}
            >
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)" options={{ headerShown: false, presentation: 'modal' }} />
              <Stack.Screen name="(modals)" options={{ headerShown: false, presentation: 'modal' }} />
              <Stack.Screen name="screens" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </Stack>
            {/* )} */}
            <StatusBar barStyle={'default'} backgroundColor={Platform.OS === 'android' ? Colors.primary : 'white'} />
            <UpdatesModalController />
            <CartSync />
          </SafeAreaView>
          <StatusBar barStyle={'default'} backgroundColor={Platform.OS === 'android' ? Colors.primary : 'white'} />
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </ThemeProvider>
    // </SafeAreaView>
  )
}






































//for further use
// export default function RootLayout() {
//   return (
//     <ThemeProvider>
//       <RootLayoutContent /> {/* ✅ This is now inside the provider */}
//     </ThemeProvider>
//   );
// }

// function RootLayoutContent() {
//   const { colors } = useTheme(); // ✅ Now safe to use

//   return (
//     <GestureHandlerRootView>
//       <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
//         <Stack>
//           <Stack.Screen name="index" options={{ headerShown: false }} />
//           <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
//           <Stack.Screen name="(auth)" options={{ headerShown: false, presentation: 'modal' }} />
//           <Stack.Screen name="(modals)" options={{ headerShown: false, presentation: 'modal' }} />
//           <Stack.Screen name="+not-found" />
//         </Stack>
//         <StatusBar
//           barStyle={'default'}
//           backgroundColor={Platform.OS === 'android' ? colors.primary : 'white'}
//         />
//         <UpdatesModalController />
//       </SafeAreaView>
//     </GestureHandlerRootView>
//   );
// }
