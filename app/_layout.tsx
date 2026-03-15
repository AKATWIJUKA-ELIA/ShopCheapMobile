import UpdatesModalController from '@/components/Updates';
import { Colors } from '@/constants/Colors';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import OrdersBottomSheet, { OrdersBottomSheetRef } from '@/components/OrdersBottomSheet';
import { useBottomSheetStore } from '@/store/useBottomSheetStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CHATS_API_URL } from '@/types/product';
import * as Notifications from 'expo-notifications';
import { usePathname, useGlobalSearchParams, router as expoRouter } from 'expo-router';

function CartSync() {
  const { user, refreshUser } = useAuthStore();
  const { fetchCart, fetchBookmarks } = useCartStore();

  useEffect(() => {
    console.log(`[CartSync] User State Changed: ${user ? user.email + ' (' + user._id + ')' : 'Logged Out'}`);

    // Initial fetch
    if (user) {
      fetchCart();
      fetchBookmarks();
      refreshUser();
    }

    // Set up periodic polling (every 10 seconds)
    let intervalId: any;

    if (user) {
      console.log(`[CartSync] Starting periodic polling for user: ${user._id}`);
      intervalId = setInterval(() => {
        console.log(`[CartSync] Polling for updates...`);
        fetchCart();
        fetchBookmarks();
        refreshUser();
      }, 10000); // 10 seconds
    }

    return () => {
      if (intervalId) {
        console.log(`[CartSync] Clearing poll interval`);
        clearInterval(intervalId);
      }
    };
  }, [user]);

  return null;
}

function ChatNotificationWatcher() {
  const { user } = useAuthStore();
  const lastMessageIds = useRef<Record<string, string>>({});
  const pathname = usePathname();
  const params = useGlobalSearchParams();

  useEffect(() => {
    if (!user?._id) return;

    const checkNewMessages = async () => {
      try {
        const res = await fetch(`${CHATS_API_URL}?userId=${user._id}`);
        if (!res.ok) return;
        
        const conversations: any[] = await res.json();
        
        conversations.forEach(conv => {
          const sellerId = conv.recipientId;
          const messages = conv.messages || [];
          if (messages.length === 0) return;
          
          const lastMsg = messages[messages.length - 1];
          const isFromOther = lastMsg.sender !== user._id;
          
          // If we haven't seen this message yet
          if (isFromOther && lastMessageIds.current[sellerId] && lastMessageIds.current[sellerId] !== lastMsg._id) {
            
            // Check if we are currently in the chat with this seller
            const isInThisChat = pathname.includes('/chat') && params.sellerId === sellerId;
            
            if (!isInThisChat) {
              Notifications.scheduleNotificationAsync({
                content: {
                  title: conv.shopName || 'New Message',
                  body: lastMsg.message || 'Sent an image',
                  data: { 
                    sellerId, 
                    shopName: conv.shopName,
                    url: `/Screens/chat?sellerId=${sellerId}&shopName=${conv.shopName || 'Seller'}`
                  },
                },
                trigger: null,
              });
            }
          }
          
          // Update last seen ID
          if (lastMessageIds.current[sellerId] !== lastMsg._id) {
            lastMessageIds.current[sellerId] = lastMsg._id;
            AsyncStorage.setItem('last_seen_messages', JSON.stringify(lastMessageIds.current));
          }
        });
      } catch (e) {
        console.error('[ChatWatcher] Error:', e);
      }
    };

    // Initial load of IDs (don't notify for old messages)
    const initIds = async () => {
      try {
        // First try to load from persistent storage
        const saved = await AsyncStorage.getItem('last_seen_messages');
        if (saved) {
          lastMessageIds.current = JSON.parse(saved);
        }

        const res = await fetch(`${CHATS_API_URL}?userId=${user._id}`);
        if (res.ok) {
          const conversations: any[] = await res.json();
          conversations.forEach(conv => {
            const messages = conv.messages || [];
            if (messages.length > 0) {
              const lastId = messages[messages.length - 1]._id;
              if (!lastMessageIds.current[conv.recipientId]) {
                lastMessageIds.current[conv.recipientId] = lastId;
              }
            }
          });
          AsyncStorage.setItem('last_seen_messages', JSON.stringify(lastMessageIds.current));
        }
      } catch (e) {}
    };

    initIds();
    const interval = setInterval(checkNewMessages, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [user?._id, pathname, params.sellerId]);

  return null;
}

function useNotificationObserver() {
  useEffect(() => {
    function redirect(notification: Notifications.Notification) {
      const url = notification.request.content.data?.url;
      if (typeof url === 'string') {
        setTimeout(() => {
          expoRouter.push(url as any);
        }, 500); 
      }
    }

    Notifications.getLastNotificationResponseAsync().then(response => {
      if (response?.notification) {
        redirect(response.notification);
      }
    });

    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      redirect(response.notification);
    });

    return () => {
      subscription.remove();
    };
  }, []);
}

export default function RootLayout() {
  useNotificationObserver();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  /* 
  const ordersSheetRef = useRef<OrdersBottomSheetRef>(null);
  const isOrdersOpen = useBottomSheetStore(state => state.isOrdersBottomSheetOpen);
  const ordersOpenTrigger = useBottomSheetStore(state => state.ordersOpenTrigger);

  useEffect(() => {
    if (ordersOpenTrigger > 0) {
      console.log(`[RootLayout] Orders trigger count: ${ordersOpenTrigger}`);
      if (ordersSheetRef.current) {
        ordersSheetRef.current.open();
      } else {
        console.warn("[RootLayout] ordersSheetRef.current is null on open!");
      }
    }
  }, [ordersOpenTrigger]);

  useEffect(() => {
    if (!isOrdersOpen) {
      console.log(`[RootLayout] Orders store closed, calling ref close`);
      ordersSheetRef.current?.close();
    }
  }, [isOrdersOpen]);
  */

  /*
  useEffect(() => {
    if (!isOrdersOpen) {
      console.log(`[RootLayout] Orders store closed, calling ref close`);
      ordersSheetRef.current?.close();
    }
  }, [isOrdersOpen]);
  */

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  };


  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.primary }}>
        <ThemeProvider>
          <NotificationProvider>
            <BottomSheetModalProvider>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)" options={{ headerShown: false, presentation: 'modal' }} />
                <Stack.Screen name="(modals)" options={{ headerShown: false, presentation: 'modal' }} />
                <Stack.Screen 
                  name="(modals)/orders" 
                  options={{ 
                    headerShown: false, 
                    presentation: 'formSheet',
                    sheetAllowedDetents: [0.7, 0.9],
                    sheetGrabberVisible: true,
                    sheetCornerRadius: 24,
                  }} 
                />
                <Stack.Screen name="Screens" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" />
              </Stack>
              <UpdatesModalController />
              <CartSync />
              <ChatNotificationWatcher />
              <Toast />
              {/* <OrdersBottomSheet ref={ordersSheetRef} /> */}
            </BottomSheetModalProvider>
          </NotificationProvider>
        </ThemeProvider>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
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
