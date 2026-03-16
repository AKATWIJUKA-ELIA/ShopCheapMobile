import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { FlatList, Platform, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useNotificationStore, NotificationItem } from '@/store/useNotificationStore';
import { useAuthStore } from '@/store/useAuthStore';
import { UPDATE_USER_API_URL } from '@/types/product';

export default function Notifications() {
  const { colors } = useTheme();
  const styles = useMemo(() => appStyles(colors), [colors]);
  const { notificationsEnabled, setNotificationsEnabled } = useSettingsStore();
  const { notifications, markAsRead, markAllAsRead, clearAll } = useNotificationStore();
  const { user } = useAuthStore();

  const handleToggle = async (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    
    // Sync with server if user is logged in
    if (user?._id) {
      try {
        await fetch(UPDATE_USER_API_URL, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user._id,
            notificationsEnabled: enabled,
          }),
        });
      } catch (error) {
        console.error('[Notifications] Error syncing preference:', error);
      }
    }
  };

  const formatRelativeTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const renderItem = ({ item }: { item: NotificationItem }) => (
    <TouchableOpacity 
      style={[styles.notificationCard, item.read && styles.readCard]} 
      onPress={() => markAsRead(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.unreadDot, item.read && { opacity: 0 }]} />
        <Text style={[styles.title, item.read && styles.readText]}>{item.title}</Text>
        <Text style={styles.timeText}>{formatRelativeTime(item.time)}</Text>
      </View>
      <Text style={[styles.message, item.read && styles.readText]}>{item.message}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {Platform.OS === 'android' && (
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
        )}
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {notifications.length > 0 && (
            <TouchableOpacity onPress={clearAll}>
              <Text style={styles.clearText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.toggleContainer}>
        <View style={styles.toggleTextContainer}>
          <Text style={styles.toggleTitle}>Push Notifications</Text>
          <Text style={styles.toggleSubtitle}>
            {notificationsEnabled 
              ? 'You are subscribed to app updates and offers' 
              : 'You are unsubscribed from all except messages'}
          </Text>
        </View>
        <Switch 
          value={notificationsEnabled} 
          onValueChange={handleToggle}
          thumbColor={Platform.OS === 'android' ? (notificationsEnabled ? colors.primary : '#f4f3f4') : undefined}
          trackColor={{ false: '#767577', true: colors.primary + '80' }}
        />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Notifications</Text>
        <View style={styles.sectionRight}>
          <Text style={styles.unreadCount}>{notifications.filter(n => !n.read).length} new</Text>
          {notifications.some(n => !n.read) && (
            <TouchableOpacity onPress={markAllAsRead} style={styles.markReadBtn}>
              <Text style={styles.markReadText}>Mark all as read</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={64} color={colors.grayish} />
            <Text style={styles.emptyText}>No notifications yet</Text>
            <Text style={{ color: colors.grayish, fontSize: 12,  }}>We'll notify you about orders and special offers</Text>
          </View>
        }
      />
    </View>
  );
}

const appStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightgray,
  },
  backButton: {
    marginRight: 15,
    padding: 6,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  headerTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clearText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLine,
  },
  toggleTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  toggleSubtitle: {
    fontSize: 12,
    color: colors.grayish,
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.grayish,
    textTransform: 'uppercase',
  },
  sectionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  markReadBtn: {
    paddingVertical: 4,
  },
  markReadText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  unreadCount: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  notificationCard: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  readCard: {
    borderLeftColor: 'transparent',
    opacity: 0.8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  timeText: {
    fontSize: 11,
    color: colors.grayish,
  },
  message: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  readText: {
    color: colors.grayish,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: colors.grayish,
    marginTop: 12,
  },
});
