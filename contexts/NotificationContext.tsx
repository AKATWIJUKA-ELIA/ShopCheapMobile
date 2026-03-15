import * as Notifications from 'expo-notifications';
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { registerBackgroundChatTask } from '@/utils/backgroundWatcher';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useNotificationStore } from '@/store/useNotificationStore';

Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const { notificationsEnabled } = useSettingsStore.getState();
    const isMessage = notification.request.content.data?.type === 'message' || 
                      notification.request.content.data?.type === 'chat';
    
    // If notifications are disabled, only show alerts for messages/chats
    // Or if the user strictly meant "disables the alerts [for everything]", then:
    // return { shouldShowAlert: false, ... }
    
    // Based on "toggle off just disables the alerts but the messages come through"
    // and "unsubscribes ... except for messages", let's suppress ALL alerts if disabled,
    // but ensure the store still gets the data (handled in the listener).
    
    return {
      shouldShowAlert: notificationsEnabled,
      shouldPlaySound: notificationsEnabled,
      shouldSetBadge: true, // Always allow badge for unread counts
      shouldShowBanner: notificationsEnabled,
      shouldShowList: true,
    };
  },
});

interface NotificationContextType {
  expoPushToken: string | undefined;
  notification: Notifications.Notification | undefined;
  requestPermissions: () => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>(undefined);
  const [notification, setNotification] = useState<Notifications.Notification | undefined>(undefined);
  const notificationListener = useRef<Notifications.Subscription>(undefined);
  const responseListener = useRef<Notifications.Subscription>(undefined);

  const registerForPushNotificationsAsync = async () => {
    let token;
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
      }
      
      try {
        const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
        if (!projectId) {
          throw new Error('Project ID not found');
        }
        token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        console.log('Expo Push Token:', token);
      } catch (e) {
        // This is expected if Firebase (FCM) is not configured in app.json/Firebase Console
        // Background polling for local notifications will still work!
        console.warn('Push token not acquired (requires FCM config):', e);
      }
    } else {
      console.log('Must use physical device for Push Notifications');
    }

    return token;
  };

  const requestPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  };

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token));
    registerBackgroundChatTask();

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
      
      const { notificationsEnabled } = useSettingsStore.getState();
      const isMessage = notification.request.content.data?.type === 'message' || 
                        notification.request.content.data?.type === 'chat';
      
      // Save to notification history only if enabled OR if it's a message/chat
      if (notificationsEnabled || isMessage) {
        const { addNotification } = useNotificationStore.getState();
        addNotification({
          title: notification.request.content.title || 'Notification',
          message: notification.request.content.body || '',
          type: (notification.request.content.data?.type as any) || 'system',
        });
      }
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification Response:', response);
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  return (
    <NotificationContext.Provider value={{ expoPushToken, notification, requestPermissions }}>
      {children}
    </NotificationContext.Provider>
  );
};
