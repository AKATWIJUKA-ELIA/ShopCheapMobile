import { useTheme } from '@/contexts/ThemeContext';
import { useAuthStore } from '@/store/useAuthStore';
import { CHATS_API_URL, ChatMessage } from '@/types/product';
import { uploadImages } from '@/utils/upload';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, AppState, Dimensions, Image, Keyboard, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { shopId, shopName, sellerId, shopImage, username, avatar } = params;
  const { colors } = useTheme();
  const styles = useMemo(() => appStyles(colors), [colors]);
  const { user } = useAuthStore();
  const currentUserId = user?._id;
  const flatListRef = useRef<Animated.FlatList<ChatMessage>>(null);

  // Identity state to handle fallbacks
  const [chatIdentity, setChatIdentity] = useState({
    name: shopName 
      ? (shopName as string).toLowerCase().replace(/\s+/g, '-') 
      : (username as string) || 'Chat',
    image: (shopImage as string) || (avatar as string) || 'https://picsum.photos/200'
  });

  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerImages, setViewerImages] = useState<string[]>([]);
  const [viewerIndex, setViewerIndex] = useState(0);

  const fetchMessages = async (isSilent = false) => {
    console.log(`[Chat] fetchMessages triggered. isSilent: ${isSilent}, currentUserId: ${currentUserId}, sellerId: ${sellerId}`);
    
    if (!currentUserId || !sellerId) {
      console.warn(`[Chat] Missing IDs. currentUserId: ${currentUserId}, sellerId: ${sellerId}`);
      if (!isSilent) setLoading(false);
      return;
    }

    if (!isSilent) setLoading(true);
    try {
      const url = `${CHATS_API_URL}?userId=${currentUserId}&sellerId=${sellerId}`;
      console.log(`[Chat] Fetching from ${url}`);
      const res = await fetch(url);
      if (res.ok) {
        const data: any[] = await res.json();
        console.log(`[Chat] Received ${data.length} conversations.`);
        
        // Find the conversation with this specific seller
        console.log(`[Chat] Searching for conversation with sellerId: ${sellerId}`);
        const conversationData = data.find(c => c.recipientId === sellerId);
        
        if (conversationData && conversationData.messages) {
          console.log(`[Chat] Found conversation! messages: ${conversationData.messages.length}`);
          
          // Update identity if API gives us more specific info
          const shopNameFromApi = conversationData.recipientShopName || conversationData.shopName || conversationData.shop_name;
          const apiName = shopNameFromApi || conversationData.recipientName;
          const apiImage = conversationData.recipientShopAvatar || conversationData.shop_image || conversationData.profile_image || conversationData.recipientAvatar || conversationData.recipientImage || conversationData.avatar;
          
          if (apiName || apiImage) {
            setChatIdentity(prev => ({
              name: (shopNameFromApi || (conversationData.recipientName && conversationData.recipientName.includes(' ')))
                ? (apiName as string).toLowerCase().replace(/\s+/g, '-') 
                : apiName || prev.name,
              image: apiImage || prev.image
            }));
          }
          
          const remoteMessages: ChatMessage[] = conversationData.messages.map((m: any) => ({
            ...m,
            status: 'sent' as const
          })).sort((a: any, b: any) => (a._creationTime || 0) - (b._creationTime || 0));

          setMessages(prev => {
            const pendingLocal = prev.filter(local => {
              if (local.status === 'sent') return false;
              
              const isAlreadyRemote = remoteMessages.some(remote => 
                remote.sender === local.sender &&
                remote.message === local.message &&
                Math.abs((remote._creationTime || 0) - (local._creationTime || 0)) < 15000
              );
              
              return !isAlreadyRemote;
            });

            const newTotalMessages = [...remoteMessages, ...pendingLocal];
            
            // Only update if something actually changed (count or last message time)
            const hasChanged = prev.length !== newTotalMessages.length || 
                               prev.some((msg, idx) => 
                                 msg._id !== newTotalMessages[idx]?._id || 
                                 msg.status !== newTotalMessages[idx]?.status
                               );

            return hasChanged ? newTotalMessages : prev;
          });
        } else {
          console.log(`[Chat] No conversation found for sellerId: ${sellerId}. Available recipientIds: ${data.map(c => c.recipientId).join(', ')}`);
          // If no remote messages, keep only pending local ones
          setMessages(prev => prev.filter(m => m.status !== 'sent'));
        }
      } else {
        const errorBody = await res.text();
        console.error(`[Chat] Fetch failed. Status: ${res.status}, Body: ${errorBody}`);
      }
    } catch (error) {
      console.error("[Chat] Error fetching messages:", error);
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    
    // Near-instant polling (3 seconds)
    const interval = setInterval(() => fetchMessages(true), 3000);

    // Keep scroll at bottom when keyboard shows
    const keyboardShowSub = Keyboard.addListener('keyboardDidShow', () => {
      flatListRef.current?.scrollToEnd({ animated: true });
    });

    // Refresh when app comes back to foreground
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        console.log('[Chat] App became active, refreshing...');
        fetchMessages(true);
      }
    });

    return () => {
      clearInterval(interval);
      subscription.remove();
      keyboardShowSub.remove();
    };
  }, [currentUserId, sellerId]);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit: 4 - attachedImages.length,
        quality: 0.5,
      });

      if (!result.canceled) {
        const newImages = result.assets.map(asset => asset.uri);
        setAttachedImages(prev => [...prev, ...newImages]);
      }
    } catch (error) {
      console.error("Error picking image:", error);
    }
  };

  const removeAttachedImage = (index: number) => {
    setAttachedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    const textToSend = messageText.trim();
    const imagesToUpload = [...attachedImages];

    if ((!textToSend && imagesToUpload.length === 0) || !currentUserId || !sellerId) {
      console.log(`[Chat] Send blocked. text: "${textToSend}", images: ${imagesToUpload.length}, currentUserId: ${currentUserId}, sellerId: ${sellerId}`);
      return;
    }

    console.log(`[Chat] Attempting to send message. Text: "${textToSend}", Images: ${imagesToUpload.length}`);
    
    // Create optimistic message
    const optimisticMessage: ChatMessage = {
      sender: currentUserId,
      receiver: sellerId as string,
      message: textToSend || undefined,
      status: 'sending',
      _creationTime: Date.now(),
      file: imagesToUpload.length > 0 ? { fileType: 'image', fileUrl: imagesToUpload } : undefined,
    };

    // Add to UI immediately
    setMessages(prev => [...prev, optimisticMessage]);
    setMessageText('');
    setAttachedImages([]);

    try {
      let fileData = undefined;
      if (imagesToUpload.length > 0) {
        console.log(`[Chat] Uploading ${imagesToUpload.length} images...`);
        const storageIds = await uploadImages(imagesToUpload);
        fileData = {
          fileType: 'image' as const,
          fileUrl: storageIds,
        };
      }

      const newMessage: ChatMessage = {
        sender: currentUserId,
        receiver: sellerId as string,
        message: textToSend || undefined,
        file: fileData,
      };

      console.log(`[Chat] Sending POST request with payload:`, JSON.stringify(newMessage, null, 2));

      const sendUrl = `${CHATS_API_URL}?userId=${currentUserId}&sellerId=${sellerId}`;
      console.log(`[Chat] POSTing to ${sendUrl}`);

      const res = await fetch(sendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMessage),
      });

      console.log(`[Chat] POST status: ${res.status}`);

      if (res.ok) {
        console.log(`[Chat] Message sent successfully`);
        fetchMessages(true);
      } else {
        const errText = await res.text();
        console.error(`[Chat] Send failed: ${errText}`);
        setMessages(prev => prev.map(m => m === optimisticMessage ? { ...m, status: 'error' } : m));
      }
    } catch (error) {
      console.error("[Chat] Error sending message:", error);
      setMessages(prev => prev.map(m => m === optimisticMessage ? { ...m, status: 'error' } : m));
    } finally {
      // Nothing to do here anymore
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

  const formatMessageBubbleDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    const diffDays = Math.round((today - messageDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  const formatHeaderDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    const diffDays = Math.round((today - messageDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'long' });
    }
    // For older messages, if it's the same year, omit it, else show it
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString([], { month: 'long', day: 'numeric' });
    }
    return date.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const processedMessages = useMemo(() => {
    const result: any[] = [];
    let lastDate = '';

    messages.forEach((msg, index) => {
      const dateStr = formatHeaderDate(msg._creationTime || Date.now());
      if (dateStr !== lastDate) {
        result.push({ _id: `date-${dateStr}`, type: 'date', date: dateStr });
        lastDate = dateStr;
      }
      result.push({ 
        ...msg, 
        type: 'message', 
        _id: msg._id || `msg-${msg._creationTime || Date.now()}-${index}`,
        // For visual testing, we'll mark messages as unread if they are from the seller and new
        // Ideally the API provides this, but we'll add the UI support now
        isUnread: msg.sender !== currentUserId && (msg as any).unread === true
      });
    });

    return result;
  }, [messages, currentUserId]);

  useEffect(() => {
    if (messages.length > 0) {
      // Small timeout to allow FlatList to update layout
      const timer = setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 500); 
      return () => clearTimeout(timer);
    }
  }, [messages.length === 0]); // Trigger only when messages first load

  // Move ImageGrid and SwipeableMessage outside or memoize them to prevent re-renders
  const ImageGrid = useMemo(() => {
    return ({ urls }: { urls: string[] }) => {
      const count = urls.length;
      if (count === 0) return null;

      const openViewer = (index: number) => {
        setViewerImages(urls);
        setViewerIndex(index);
        setViewerVisible(true);
      };

      if (count === 1) {
        return (
          <TouchableOpacity 
            style={styles.messageImagesContainer}
            onPress={() => openViewer(0)}
            activeOpacity={0.9}
          >
            <Image source={{ uri: urls[0] }} style={styles.singleImage} />
          </TouchableOpacity>
        );
      }

      const displayCount = Math.min(count, 4);
      const remainingCount = count - 4;

      return (
        <View style={styles.imageGrid}>
          {urls.slice(0, displayCount).map((url, i) => {
            let itemStyle: any = styles.gridItemHalf;
            if (count === 2) itemStyle = styles.gridItemHalf;
            if (count === 3 && i === 0) itemStyle = styles.gridItemFull;
            
            return (
              <TouchableOpacity 
                key={i} 
                style={[styles.gridItem, itemStyle]}
                onPress={() => openViewer(i)}
                activeOpacity={0.9}
              >
                <Image source={{ uri: url }} style={styles.gridImage} />
                {i === 3 && remainingCount > 0 && (
                  <View style={styles.imageOverlay}>
                    <Text style={styles.overlayText}>+{remainingCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      );
    };
  }, [styles]);

  const renderItem = React.useCallback(({ item, index }: { item: any; index: number }) => {
    if (item.type === 'date') {
      return (
        <View style={styles.dateHeader}>
          <View style={styles.dateLine} />
          <Text style={styles.dateText}>{item.date}</Text>
          <View style={styles.dateLine} />
        </View>
      );
    }

    const isMe = item.sender === currentUserId;

    return (
      <Animated.View
        entering={FadeInDown.delay(index * 10).springify().damping(15)}
        style={[
          styles.messageRow,
          isMe ? styles.messageRowRight : styles.messageRowLeft
        ]}
      >
        <View style={[
          styles.messageBubble,
          isMe ? styles.messageBubbleMe : styles.messageBubbleThem,
          !isMe && item.isUnread && styles.unreadBubble
        ]}>
          {item.file?.fileType === 'image' && item.file.fileUrl && (
            <View style={styles.imageGridWrapper}>
              <ImageGrid urls={item.file.fileUrl} />
            </View>
          )}
          {item.message && (
            <Text style={[styles.messageText, isMe ? styles.messageTextMe : null]}>{item.message}</Text>
          )}
          <View style={styles.messageFooter}>
            <View style={{ alignItems: 'flex-end' }}>
              {item._creationTime && (
                <>
                  <Text style={[styles.timestampText, isMe ? styles.timestampTextMe : null]}>
                    {new Date(item._creationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                  <Text style={[styles.timestampText, isMe ? styles.timestampTextMe : null, { fontSize: 8 }]}>
                    {formatMessageBubbleDate(item._creationTime)}
                  </Text>
                </>
              )}
            </View>
            {isMe && (
              <View style={styles.statusIndicator}>
                {item.status === 'sending' && <ActivityIndicator size={10} color="#fff" style={{ marginLeft: 4 }} />}
                {item.status === 'sent' && <Ionicons name="checkmark-done" size={14} color="#fff" style={{ marginLeft: 4 }} />}
                {item.status === 'error' && <Ionicons name="alert-circle" size={14} color="#f87171" style={{ marginLeft: 4 }} />}
              </View>
            )}
          </View>
        </View>
      </Animated.View>
    );
  }, [currentUserId, chatIdentity.name, styles, ImageGrid]);

  if (!currentUserId) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Ionicons name="lock-closed" size={64} color={colors.primary} />
        <Text style={[styles.headerTitle, { marginTop: 20, textAlign: 'center' }]}>Please Login to Chat</Text>
        <Text style={[styles.headerSubtitle, { textAlign: 'center', marginBottom: 20 }]}>You need to be logged in to send messages to sellers.</Text>
        <TouchableOpacity 
          style={[styles.loginBtn, { width: '100%', backgroundColor: colors.primary }]} 
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={{ color: '#fff', fontWeight: '700' }}>Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 28} 
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {chatIdentity.image ? (
              <Image
                source={{ uri: chatIdentity.image }}
                style={styles.headerAvatar}
              />
            ) : (
              <View style={[styles.headerAvatar, styles.initialsContainerSmall]}>
                <Text style={styles.initialsTextSmall}>{getInitials(chatIdentity.name)}</Text>
              </View>
            )}
            <View>
              <Text style={styles.headerTitle}>{chatIdentity.name}</Text>
              <Text style={styles.headerSubtitle}>Typically replies instantly</Text>
            </View>
          </View>
        </View>
      </View>

      {loading && messages.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <Animated.FlatList
          ref={flatListRef}
          data={processedMessages}
          keyExtractor={(item, index) => item._id || `temp-${index}`}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 }}>
              <Ionicons name="chatbubbles-outline" size={64} color={colors.lightgray} />
              <Text style={{ color: colors.grayish, marginTop: 10 }}>Start a conversation with {shopName}</Text>
            </View>
          }
        />
      )}

      <View style={styles.inputContainer}>
        <View style={styles.inputMainWrapper}>
          {attachedImages.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.attachmentScroll}>
              {attachedImages.map((uri, index) => (
                <View key={uri} style={styles.attachmentPreview}>
                  <Image source={{ uri }} style={styles.attachmentImage} />
                  <TouchableOpacity 
                    style={styles.removeAttachment} 
                    onPress={() => removeAttachedImage(index)}
                  >
                    <Ionicons name="close-circle" size={20} color={'#ef4444'} />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
          <View style={styles.inputRow}>
            <TouchableOpacity style={styles.attachButton} onPress={pickImage}>
              <Ionicons name="image" size={24} color={colors.primary} />
            </TouchableOpacity>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                placeholder="Type a message..."
                placeholderTextColor={colors.grayish}
                value={messageText}
                onChangeText={setMessageText}
                multiline
                maxLength={500}
                cursorColor={colors.primary}
                // autoFocus
              />
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.sendButton, (!messageText.trim() && attachedImages.length === 0) && { opacity: 0.5 }]}
          onPress={handleSend}
          disabled={(!messageText.trim() && attachedImages.length === 0)}
        >
          <Ionicons name="send" size={20} color={colors.light} />
        </TouchableOpacity>
      </View>

      {/* Image Viewer Modal */}
      <Modal
        visible={viewerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setViewerVisible(false)}
      >
        <View style={styles.viewerBackground}>
          <TouchableOpacity 
            style={styles.viewerCloseBtn}
            onPress={() => setViewerVisible(false)}
          >
            <Ionicons name="close" size={32} color="#fff" />
          </TouchableOpacity>
          
          <ScrollView 
            horizontal 
            pagingEnabled 
            showsHorizontalScrollIndicator={false}
            contentOffset={{ x: viewerIndex * SCREEN_WIDTH, y: 0 }}
            onMomentumScrollEnd={(e) => {
              const newIndex = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setViewerIndex(newIndex);
            }}
          >
            {viewerImages.map((uri, index) => (
              <View key={index} style={styles.viewerImageContainer}>
                <Image 
                  source={{ uri }} 
                  style={styles.viewerImage} 
                  resizeMode="contain"
                />
              </View>
            ))}
          </ScrollView>

          {viewerImages.length > 1 && (
            <View style={styles.viewerDots}>
              {viewerImages.map((_, i) => (
                <View 
                  key={i} 
                  style={[
                    styles.viewerDot, 
                    i === viewerIndex ? styles.viewerDotActive : null
                  ]} 
                />
              ))}
            </View>
          )}
        </View>
      </Modal>
    </KeyboardAvoidingView>
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
    backgroundColor: colors.background,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 2 },
  },
  backButton: {
    padding: 4,
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    backgroundColor: colors.card,
  },
  initialsContainerSmall: {
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary + '40',
  },
  initialsTextSmall: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.grayish,
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  messageRow: {
    width: '100%',
    marginVertical: 4,
    flexDirection: 'row',
  },
  messageRowLeft: {
    justifyContent: 'flex-start',
  },
  messageRowRight: {
    justifyContent: 'flex-end',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 18,
    minWidth: 80,
  },
  messageBubbleThem: {
    backgroundColor: colors.card,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.lightgray,
  },
  messageBubbleMe: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  unreadBubble: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
  imageGridWrapper: {
    marginBottom: 6,
    borderRadius: 12,
    overflow: 'hidden',
  },
  messageText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 20,
  },
  messageTextMe: {
    color: colors.light,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  timestampText: {
    fontSize: 10,
    color: colors.grayish,
    opacity: 0.8
  },
  timestampTextMe: {
    color: colors.light,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.lightgray,
    backgroundColor: colors.background,
  },
  inputMainWrapper: {
    flex: 1,
    marginRight: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  attachButton: {
    padding: 8,
    marginRight: 4,
    marginBottom: 4,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.lightgray,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 40,
    maxHeight: 120,
    justifyContent: 'center',
  },
  textInput: {
    color: colors.text,
    fontSize: 14,
    padding: 0,
    margin: 0,
  },
  sendButton: {
    backgroundColor: colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  loginBtn: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 12
  },
  attachmentScroll: {
    maxHeight: 100,
    marginBottom: 8,
  },
  attachmentPreview: {
    width: 80,
    height: 80,
    marginRight: 8,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.lightgray,
  },
  attachmentImage: {
    width: '100%',
    height: '100%',
  },
  removeAttachment: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 10,
  },
  messageImagesContainer: {
    marginBottom: 4,
  },
  singleImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    backgroundColor: colors.lightgray,
  },
  imageGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
    marginBottom: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  gridItem: {
    position: 'relative',
    overflow: 'hidden',
  },
  gridItemFull: {
    width: '100%',
    aspectRatio: 2,
  },
  gridItemHalf: {
    width: '49%',
    aspectRatio: 1,
  },
  gridImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.lightgray,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  viewerBackground: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewerCloseBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 20,
    zIndex: 10,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 24,
  },
  viewerImageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewerImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  viewerDots: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    alignSelf: 'center',
  },
  viewerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 4,
  },
  viewerDotActive: {
    backgroundColor: '#fff',
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  dateLine: {
    width: 30, // Shorter lines for a cleaner look
    height: 1,
    backgroundColor: colors.lightgray,
  },
  dateText: {
    fontSize: 11,
    color: colors.grayish,
    marginHorizontal: 12,
    fontWeight: '700',
    backgroundColor: colors.card,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.lightgray,
    textTransform: 'uppercase',
  },
});
