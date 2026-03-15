import { useTheme } from '@/contexts/ThemeContext';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { CHATS_API_URL, ChatMessage } from '@/types/product';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Image, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Conversation {
  recipientId: string;
  recipientName: string;
  recipientImage: string;
  lastMessage: string;
  lastMessageTime: number;
  unreadCount: number;
}

export default function ChatsScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => appStyles(colors), [colors]);
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);


  //cart
  const { items } = useCartStore();
  const distinctCount = items.length;
  

  const fetchConversations = async (isRefreshing = false) => {
    if (!user?._id) return;
    
    if (!isRefreshing) setLoading(true);
    try {
      const response = await fetch(`${CHATS_API_URL}?userId=${user._id}`);
      if (response.ok) {
        const data = await response.json();
        // The API returns an array of conversations
        // Each entry has: recipientId, messages[], etc.
        // We need to map this to our Conversation interface
        
        const mapped: Conversation[] = data.map((conv: any) => {
          const lastMsg = conv.messages && conv.messages.length > 0 
            ? conv.messages[conv.messages.length - 1] 
            : null;
          
          // Prioritize shop-specific fields from API
          const shopNameFromApi = conv.recipientShopName || conv.shopName || conv.shop_name;
          const rawName = shopNameFromApi || conv.recipientName || 'Shop';
          
          // If we found a shop name or if it looks like a shop name (has spaces/capitals), slugify it
          const formattedName = (shopNameFromApi || (conv.recipientName && conv.recipientName.includes(' ')))
            ? rawName.toLowerCase().replace(/\s+/g, '-') 
            : rawName;

          return {
            recipientId: conv.recipientId,
            recipientName: formattedName,
            recipientImage: conv.recipientShopAvatar || conv.shop_image || conv.profile_image || conv.recipientAvatar || conv.recipientImage || conv.avatar || null,
            lastMessage: lastMsg?.message || (lastMsg?.file ? 'Attachment' : 'No messages'),
            lastMessageTime: lastMsg?._creationTime || conv._creationTime || Date.now(),
            unreadCount: conv.unreadCount || 0,
          };
        }).sort((a: Conversation, b: Conversation) => b.lastMessageTime - a.lastMessageTime);
        
        setConversations(mapped);
      }
    } catch (error) {
      console.error('[Chats] Error fetching conversations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  const getInitials = (name: string) => {
    if (!name) return '??';
    const cleanName = name.replace(/-/g, ' ');
    const parts = cleanName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0].toUpperCase() + parts[1][0].toUpperCase());
    }
    return parts[0][0].toUpperCase();
  };

  const formatConversationDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    const diffDays = Math.round((today - messageDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations();
      const interval = setInterval(() => fetchConversations(true), 10000); // Poll every 10s
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user?._id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchConversations(true);
  };

  const renderItem = ({ item }: { item: Conversation }) => (
    <TouchableOpacity 
      style={styles.convItem} 
      onPress={() => router.push({
        pathname: '/Screens/chat',
        params: {
          sellerId: item.recipientId,
          shopName: item.recipientName,
          shopImage: item.recipientImage
        }
      })}
    >
      {item.recipientImage ? (
        <Image source={{ uri: item.recipientImage }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.initialsContainer]}>
          <Text style={styles.initialsText}>{getInitials(item.recipientName)}</Text>
        </View>
      )}
      <View style={styles.convInfo}>
        <View style={styles.convHeader}>
          <Text style={styles.recipientName} numberOfLines={1}>{item.recipientName}</Text>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.timestamp}>
              {new Date(item.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            <Text style={[styles.timestamp, { fontSize: 10, marginTop: 2 }]}>
              {formatConversationDate(item.lastMessageTime)}
            </Text>
          </View>
        </View>
        <View style={styles.convFooter}>
          <Text style={styles.lastMessage} numberOfLines={1}>{item.lastMessage}</Text>
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (!isAuthenticated) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="chatbubbles-outline" size={80} color={colors.primary} />
        <Text style={styles.title}>Your Messages</Text>
        <Text style={styles.subtitle}>Log in to chat with sellers and view your conversations.</Text>
        <TouchableOpacity 
          style={styles.loginBtn}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.loginBtnText}>Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        {/* Cart with badge (distinct products count) */}
                  <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/Screens/cart')} activeOpacity={0.85}>
                    <View>
                      <Ionicons name="cart-outline" size={24} color={colors.primary} />
                      {distinctCount > 0 ? (
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>{distinctCount > 99 ? '99+' : distinctCount}</Text>
                        </View>
                      ) : null}
                    </View>
                  </TouchableOpacity>
      </View>
      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderItem}
          keyExtractor={item => item.recipientId}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubble-ellipses-outline" size={64} color={colors.grayish} />
              <Text style={styles.emptyText}>No conversations yet</Text>
              <Text style={styles.emptySubtext}>When you message a seller, your chat will appear here.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const appStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    // borderBottomColor: colors.primary,
    backgroundColor: colors.background,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  listContent: {
    paddingBottom: 20,
  },
  convItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightgray + '50',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
  },
  initialsContainer: {
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary + '40',
  },
  initialsText: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  convInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  convHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  recipientName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    marginRight: 10,
  },
  timestamp: {
    fontSize: 12,
    color: colors.grayish,
  },
  convFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    color: colors.grayish,
    flex: 1,
    marginRight: 10,
  },
  unreadBadge: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#000',
    fontSize: 10,
    fontWeight: '800',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: colors.grayish,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  loginBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
  },
  loginBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 15,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.grayish,
    textAlign: 'center',
    marginTop: 8,
  },
   iconButton: {
    padding: 6,
    borderRadius: 50,
    backgroundColor: colors.background,
    marginHorizontal: 2,
  },
  badge: {
    position: 'absolute',
    right: -8,
    top: -6,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1
  },
  badgeText: {
    color: '#000',
    fontSize: 10,
    fontWeight: '800'
  },
});
