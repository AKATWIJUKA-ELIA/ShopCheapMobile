import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CHATS_API_URL } from '@/types/product';

const BACKGROUND_CHAT_TASK = 'background-chat-check';

// Task definition must be at the global scope
TaskManager.defineTask(BACKGROUND_CHAT_TASK, async () => {
  try {
    const authData = await AsyncStorage.getItem('shopcheap-auth-storage');
    if (!authData) return BackgroundFetch.BackgroundFetchResult.NoData;

    const parsedAuth = JSON.parse(authData);
    const userId = parsedAuth.state?.user?._id;
    if (!userId) return BackgroundFetch.BackgroundFetchResult.NoData;

    const res = await fetch(`${CHATS_API_URL}?userId=${userId}`);
    if (!res.ok) return BackgroundFetch.BackgroundFetchResult.Failed;

    const conversations: any[] = await res.json();
    let hasNew = false;

    // Get last seen IDs
    const lastSeenData = await AsyncStorage.getItem('last_seen_messages');
    const lastSeenIds: Record<string, string> = lastSeenData ? JSON.parse(lastSeenData) : {};

    for (const conv of conversations) {
      const sellerId = conv.recipientId;
      const messages = conv.messages || [];
      if (messages.length === 0) continue;

      const lastMsg = messages[messages.length - 1];
      const isFromOther = lastMsg.sender !== userId;

      if (isFromOther && lastSeenIds[sellerId] !== lastMsg._id) {
        hasNew = true;
        await Notifications.scheduleNotificationAsync({
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
        lastSeenIds[sellerId] = lastMsg._id;
      }
    }

    if (hasNew) {
      await AsyncStorage.setItem('last_seen_messages', JSON.stringify(lastSeenIds));
      return BackgroundFetch.BackgroundFetchResult.NewData;
    }

    return BackgroundFetch.BackgroundFetchResult.NoData;
  } catch (error) {
    console.error('[BackgroundFetch] Task failed:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export async function registerBackgroundChatTask() {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_CHAT_TASK);
    if (!isRegistered) {
      await BackgroundFetch.registerTaskAsync(BACKGROUND_CHAT_TASK, {
        minimumInterval: 15 * 60, // 15 minutes (minimum allowed by OS)
        stopOnTerminate: false, // Continue after app is closed
        startOnBoot: true, // Continue after device restart
      });
      console.log('[BackgroundFetch] Task registered');
    }
  } catch (err) {
    console.error('[BackgroundFetch] Registration failed:', err);
  }
}

export async function unregisterBackgroundChatTask() {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_CHAT_TASK);
    if (isRegistered) {
      await BackgroundFetch.unregisterTaskAsync(BACKGROUND_CHAT_TASK);
      console.log('[BackgroundFetch] Task unregistered');
    }
  } catch (err) {
    console.error('[BackgroundFetch] Unregistration failed:', err);
  }
}
