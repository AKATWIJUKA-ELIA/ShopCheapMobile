import AddressScreen from '@/components/Account/DeliveryAddress';
import RefreshScrollView from '@/components/RefreshScrollView';
import AccountSettings, { usePopUpState } from '@/components/ui/dark-mode';
import HelpCenter, { openHelpSideBar } from '@/components/ui/help';
import { UserAvatar } from '@/components/UserAvatar';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { Feather, FontAwesome, FontAwesome5, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { BlurView } from '@react-native-community/blur';
import { Link, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Animated, Dimensions, Modal, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';

const { height } = Dimensions.get("window");

const Account = () => {
  const { colors, theme, toggleTheme } = useTheme();
  const styles = useMemo(() => appStyles(colors), [colors]);
  const router = useRouter();

  const { user, isAuthenticated, logout } = useAuthStore();
  const { clearCart, wishlistIds, fetchBookmarks } = useCartStore();
  const { notifications } = useNotificationStore();

  const unreadCount = notifications.filter(n => !n.read).length;

  React.useEffect(() => {
    if (isAuthenticated) {
      fetchBookmarks();
    }
  }, [isAuthenticated]);

  // Bottom sheet state
  const translateY = useState(new Animated.Value(height))[0];
  const [visible, setVisible] = useState(false);

  const openBottomSheetModal = () => {
    setVisible(true);
    Animated.timing(translateY, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const closeBottomSheetModal = () => {
    Animated.timing(translateY, {
      toValue: height,
      duration: 500,
      useNativeDriver: true,
    }).start(() => setVisible(false));
  };

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: translateY } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = ({ nativeEvent }: any) => {
    if (nativeEvent.state === 5) {
      if (nativeEvent.translationY > 150) {
        closeBottomSheetModal();
      } else {
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  const handleLogout = () => {
    logout();
    clearCart();
    router.replace('/(tabs)/home');
  };


  //settins
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const darkThemeEnabled = theme === 'dark';
  const { isPopUpOpen } = usePopUpState();



  return (
    <RefreshScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <UserAvatar name={user?.username || 'Guest'} size={76} />
        </View>
        <View style={{ marginLeft: 12 }}>
          <Text style={styles.name}>{isAuthenticated ? `${user?.username}` : 'Guest'}</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {!isAuthenticated ? (
              <Link href='/(auth)/login' asChild>
                <TouchableOpacity style={styles.SignInBtn}>
                  <Text style={{ color: colors.light, fontWeight: 'bold', fontSize: 12, marginLeft: 5 }}>Sign In</Text>
                  <FontAwesome name='sign-in' size={14} color={colors.light} style={{ marginRight: 5 }} />
                </TouchableOpacity>
              </Link>
            ) : (
              <TouchableOpacity style={styles.SignInBtn} onPress={handleLogout}>
                <Text style={{ color: colors.light, fontWeight: 'bold', fontSize: 12, marginLeft: 5, marginRight: 5 }}>Sign Out</Text>
                <FontAwesome name='sign-out' size={14} color={colors.light} style={{ marginRight: 5 }} />
              </TouchableOpacity>
            )}

            {/* {isAuthenticated && user?.role === 'seller' ? (
              <Link href='/Seller/(SellerDashboard)' asChild>
                <TouchableOpacity style={styles.SignInBtn}>
                  <Text style={{ color: colors.light, fontWeight: 'bold', fontSize: 12, marginLeft: 5, marginRight: 5, padding: 4 }}>Seller Dashboard</Text>
                </TouchableOpacity>
              </Link>
            ) : isAuthenticated && (
              <Link href='/Seller/seller' asChild>
                <TouchableOpacity style={styles.SignInBtn}>
                  <Text style={{ color: colors.light, fontWeight: 'bold', fontSize: 12, marginLeft: 5, marginRight: 5, padding: 4 }}>Become a Seller</Text>
                </TouchableOpacity>
              </Link>
            )} */}
          </View>
        </View>
      </View>

      {isAuthenticated && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View>
            <TouchableOpacity style={styles.item} activeOpacity={0.8} onPress={() => router.push('/(modals)/profile')}>
              <View style={styles.itemLeft}>
                <Ionicons name='person-outline' size={20} color={colors.text} />
                <Text style={styles.itemLabel}>Profile</Text>
              </View>
              <Ionicons name='chevron-forward' size={18} color={colors.grayish} />
            </TouchableOpacity>

            {/* <TouchableOpacity style={styles.item} activeOpacity={0.8} onPress={openBottomSheetModal}>
              <View style={styles.itemLeft}>
                <Ionicons name='location-outline' size={20} color={colors.text} />
                <Text style={styles.itemLabel}>Delivery Addresses</Text>
              </View>
              <Ionicons name='chevron-forward' size={18} color={colors.grayish} />
            </TouchableOpacity> */}

            <TouchableOpacity style={styles.item} activeOpacity={0.8} onPress={() => router.push('/(modals)/orders')}>
              <View style={styles.itemLeft}>
                <Ionicons name='receipt-outline' size={20} color={colors.text} />
                <Text style={styles.itemLabel}>My Orders</Text>
              </View>
              <Ionicons name='chevron-forward' size={18} color={colors.grayish} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.item} activeOpacity={0.8} onPress={() => router.push('/Screens/bookmarks')}>
              <View style={styles.itemLeft}>
                <Feather name='heart' size={20} color={colors.text} />
                <Text style={styles.itemLabel}>Wishlist</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                {wishlistIds.length > 0 ? (
                  <View style={{
                    backgroundColor: colors.primary + '20',
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 12,
                    minWidth: 24,
                    alignItems: 'center'
                  }}>
                    <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700' }}>{wishlistIds.length}</Text>
                  </View>
                ) : null}
                <Ionicons name='chevron-forward' size={18} color={colors.grayish} />
              </View>
            </TouchableOpacity>

            {/* <TouchableOpacity style={styles.item} activeOpacity={0.8} onPress={() => router.push('/Screens/transactions')}>
              <View style={styles.itemLeft}>
                <Feather name='credit-card' size={20} color={colors.text} />
                <Text style={styles.itemLabel}>Transactions</Text>
              </View>
              <Ionicons name='chevron-forward' size={18} color={colors.grayish} />
            </TouchableOpacity> */}
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <View>
          <TouchableOpacity style={styles.item} activeOpacity={0.8} onPress={() => router.push('/(modals)/notifications')}>
            <View style={styles.itemLeft}>
              <Ionicons name='notifications-outline' size={20} color={colors.text} />
              <Text style={styles.itemLabel}>Notifications</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {unreadCount > 0 && (
                <View style={{
                  backgroundColor: 'red',
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 12,
                  minWidth: 24,
                  alignItems: 'center'
                }}>
                  <Text style={{ color: 'white', fontSize: 12, fontWeight: '700' }}>{unreadCount}</Text>
                </View>
              )}
              <Ionicons name='chevron-forward' size={18} color={colors.grayish} />
            </View>
          </TouchableOpacity>

          {/* <TouchableOpacity style={styles.item} activeOpacity={0.8} onPress={openSettingsPopUp}>
            <View style={styles.itemLeft}>
              <Ionicons name='settings-outline' size={20} color={colors.text} />
              <Text style={styles.itemLabel}>Settings</Text>
            </View>
            <Ionicons name='chevron-forward' size={18} color={colors.grayish} />
          </TouchableOpacity> */}

          <View style={[styles.item, darkThemeEnabled && styles.darkCard]}>
            <View style={styles.itemLeft}>
              <Ionicons name={darkThemeEnabled ? 'moon' : 'sunny'} size={24} color={colors.text} />
              <Text style={[styles.itemLabel,]}>{darkThemeEnabled ? 'Dark Mode' : 'Light Mode'}</Text>
            </View>
            <Switch value={darkThemeEnabled}
              onValueChange={toggleTheme}
              thumbColor={colors.text}
            // trackColor={{ false: Colors.gray, true: Colors.primary }} 
            />
          </View>


          <Link href='https://shopcheapug.com' asChild style={[styles.item,]}>
            <TouchableOpacity style={[styles.item, darkThemeEnabled && styles.darkCard]}>
              <View style={styles.itemLeft}>
                <MaterialIcons name='privacy-tip' size={24} color={colors.text} />
                <Text style={[styles.itemLabel,]}>Privacy Policy</Text>
              </View>
              <Feather name="chevron-right" size={24} color={colors.grayish} />
            </TouchableOpacity>
          </Link>


          <TouchableOpacity style={styles.item} activeOpacity={0.8} onPress={() => router.push('https://www.shopcheapug.com/about')}>
            <View style={styles.itemLeft}>
              <FontAwesome5 name='shopware' size={20} color={colors.text} />
              <Text style={styles.itemLabel}>About</Text>
            </View>
            <Ionicons name='chevron-forward' size={18} color={colors.grayish} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.item} activeOpacity={0.8} onPress={openHelpSideBar}>
            <View style={styles.itemLeft}>
              <Ionicons name='help-circle-outline' size={20} color={colors.text} />
              <Text style={styles.itemLabel}>Help Center</Text>
            </View>
            <Ionicons name='chevron-forward' size={18} color={colors.grayish} />
          </TouchableOpacity>
        </View>
        <Text style={{ marginTop: 16, textAlign: 'center', color: colors.grayish }}>Developed by Aurex Labs</Text>
      </View>

      <Modal
        transparent
        visible={visible}
        animationType="fade"
        onRequestClose={closeBottomSheetModal}
      >
        <BlurView style={styles.overlay}
          blurAmount={7}
          blurType={theme === 'dark' ? 'light' : 'dark'}
        >
          <PanGestureHandler
            onGestureEvent={onGestureEvent}
            onHandlerStateChange={onHandlerStateChange}
          >
            <Animated.View
              style={[
                styles.bottomSheet,
                {
                  transform: [{
                    translateY: translateY.interpolate({
                      inputRange: [0, height],
                      outputRange: [0, height],
                      extrapolate: "clamp",
                    }),
                  }]
                },
              ]}
            >
              <View style={[styles.SheetHeader, { marginBottom: 16, borderBottomColor: colors.primary, borderBottomWidth: 1 }]}>
                <MaterialCommunityIcons name="truck-delivery" size={30} color={colors.primary} />
                <Text style={[styles.headerTitle, { padding: 10 }]}>Select Delivery Address</Text>
                <View style={{ width: 24 }} />
              </View>

              <TouchableOpacity onPress={closeBottomSheetModal} style={{
                position: 'absolute',
                top: 12,
                right: 12
              }}>
                <Ionicons name="caret-down" size={24} color={colors.primary} />
              </TouchableOpacity>

              <AddressScreen />
            </Animated.View>
          </PanGestureHandler>
        </BlurView>
      </Modal>


      <AccountSettings />
      <HelpCenter />
    </RefreshScrollView>
  );
};

export default Account;

const appStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 99,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.primary,
    borderWidth: 1
  },
  name: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700'
  },
  subtle: {
    color: colors.gray
  },
  cardRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10
  },
  card: {
    flex: 1,
    backgroundColor: '#0f0f0f',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    gap: 6
  },
  cardText: {
    color: Colors.light,
    fontSize: 12
  },
  section: {
    marginTop: 20,
    backgroundColor: colors.background,
    borderRadius: 8,
    marginHorizontal: 16,
    paddingHorizontal: 12

  },
  sectionTitle: {
    color: Colors.grayish,
    fontSize: 12,
    marginVertical: 10
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderTopColor: colors.borderLine,
    borderTopWidth: 1,
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 10,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  itemLabel: {
    color: colors.text,
    fontSize: 16
  },
  SignInBtn: {
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
    borderRadius: 24,
    marginTop: 10,
    flexDirection: 'row',
    gap: 10,
    width: 'auto',
  },
  UpdatesBtn: {
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
    width: 'auto',
    padding: 10,
    marginLeft: 10,
    marginTop: 10,
    flexDirection: 'row',
    marginBottom: 50,
    gap: 5
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: height * 0.7,
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 8,
    elevation: 5,
  },
  SheetHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 6,
    alignItems: 'center'
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  settingCard: {
    backgroundColor: colors.gray,
    padding: 14,
    borderRadius: 99,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    borderColor: '#11111147',
    borderWidth: 1
  },
  darkCard: {
  },
  settingText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.light,
  },
});