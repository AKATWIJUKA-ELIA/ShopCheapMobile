import AddressScreen from '@/components/Account/DeliveryAddress';
import RefreshScrollView from '@/components/RefreshScrollView';
import AccountSettings, { openSettingsPopUp } from '@/components/ui/dark-mode';
import HelpCenter, { openHelpSideBar } from '@/components/ui/help';
import { showUpdatesModal } from '@/components/Updates';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { Feather, FontAwesome, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { BlurView } from '@react-native-community/blur';
import { Link, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Animated, Dimensions, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';

const { height } = Dimensions.get("window");

const Account = () => {
  const {colors, theme} = useTheme();
  const styles = useMemo(() => appStyles(colors), [colors]);


  //for the bottomsheet modal
  const translateY = useState(new Animated.Value(height))[0];
  const [visible, setVisible] = useState(false);
  const [slideAnim] = useState(new Animated.Value(height));

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
          // 5 = GestureHandlerState.END
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
  const router = useRouter();

  return (
    <RefreshScrollView style={styles.container}> 
      <View style={styles.header}>
        <View style={styles.avatar}>
          {/* <Ionicons name='person' size={28} color={'#000'} /> */}
          <Image source={{uri: 'https://avatars.githubusercontent.com/u/143481214?v=4'}}
            style={{
              width:70,
              height:70,
              borderRadius:99
            }}
          />
        </View>
        <View style={{ marginLeft: 12 }}>
          <Text style={styles.name}>Hello, Jay!</Text>
          {/* <Text style={styles.subtle}>Sign in to your account</Text> */}
          <Link href='/(auth)/login' asChild>
            <TouchableOpacity style={styles.SignInBtn}>
              <Text style={{color:colors.dark, fontWeight:'bold', fontSize:16, margin:5}}>Sign In</Text>
              <FontAwesome name='sign-in' size={20} color={colors.dark} style={{marginRight:5}} />
            </TouchableOpacity>
          </Link>

          {/* <TouchableOpacity style={styles.SignInBtn}>
            <Text style={{color:colors.dark, fontWeight:'bold'}}>Sign Out</Text>
            <FontAwesome name='sign-out' size={20} color={colors.dark} />
          </TouchableOpacity> */}
        </View>
      </View>


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

          <TouchableOpacity style={styles.item} activeOpacity={0.8} onPress={openBottomSheetModal}>
            <View style={styles.itemLeft}>
              <Ionicons name='location-outline' size={20} color={colors.text} />
              <Text style={styles.itemLabel}>Delivery Addresses</Text>
            </View>
            <Ionicons name='chevron-forward' size={18} color={colors.grayish} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.item} activeOpacity={0.8} onPress={() => router.push('/Screens/bookmarks')}> 
            <View style={styles.itemLeft}>
              <Feather name='bookmark' size={20} color={colors.text} />
              <Text style={styles.itemLabel}>Bookmarks</Text>
            </View>
            <Ionicons name='chevron-forward' size={18} color={colors.grayish} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.item} activeOpacity={0.8} onPress={() => router.push('/Screens/transactions')}> 
            <View style={styles.itemLeft}>
              <Feather name='credit-card' size={20} color={colors.text} />
              <Text style={styles.itemLabel}>Transactions</Text>
            </View>
            <Ionicons name='chevron-forward' size={18} color={colors.grayish} />
          </TouchableOpacity>
        </View>
      </View>


      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <View>
          {/* <TouchableOpacity style={styles.item} activeOpacity={0.8} onPress={() => router.push('/(modals)/notifications')}>
            <View style={styles.itemLeft}>
              <Ionicons name='notifications-outline' size={20} color={colors.text} />
              <Text style={styles.itemLabel}>Notifications</Text>
            </View>
            <Ionicons name='chevron-forward' size={18} color={colors.gray} />
          </TouchableOpacity> */}

          <TouchableOpacity style={styles.item} activeOpacity={0.8} onPress={openSettingsPopUp}>
            <View style={styles.itemLeft}>
              <Ionicons name='settings-outline' size={20} color={colors.text} />
              <Text style={styles.itemLabel}>Settings</Text>
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
      </View>

      {/* <View style={{justifyContent:'center', alignItems:'center'}}>
        <TouchableOpacity style={styles.UpdatesBtn} onPress={showUpdatesModal}>
          <Text>Check for Updates</Text>
          <MaterialIcons name='update' size={24} color={colors.dark}/>
        </TouchableOpacity>
      </View> */}



      {/* Bottom Sheet Modal for the Delivery addresses */}

      <Modal
        transparent
        visible={visible}
        animationType="fade"
        onRequestClose={closeBottomSheetModal}
      >
        {/* Bottom Sheet */}
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
                { transform: [{ 
                  translateY: translateY.interpolate({
                      inputRange: [0, height],
                      outputRange: [0, height],
                      extrapolate: "clamp",
                    }),
                }] },
              ]}
            >
              <View style={[styles.SheetHeader, { marginBottom: 16, borderBottomColor: colors.primary, borderBottomWidth:1 }]}>
                <MaterialCommunityIcons name="truck-delivery" size={30} color={colors.primary} />
                <Text style={[styles.headerTitle, {padding:10}]}>Select Delivery Address</Text>
                <View style={{ width: 24 }} /> 
              </View>

              <TouchableOpacity onPress={closeBottomSheetModal} style={{
                position: 'absolute',
                top: 12,
                right: 12
              }}>
                <Ionicons name="caret-down" size={24} color={colors.primary}/>
              </TouchableOpacity>

              <AddressScreen/>
            </Animated.View>
          </PanGestureHandler>
        </BlurView>
      </Modal>

      <AccountSettings />
      <HelpCenter/>
    </RefreshScrollView>
  )
}

export default Account

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
    // backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor:colors.primary,
    borderWidth:1
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
    backgroundColor:colors.card,
    padding:12,
    borderRadius:10,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  itemLabel: {
    color: colors.text,
    fontSize:16
  },
  SignInBtn:{
    backgroundColor:Colors.primary,
    justifyContent:'center',
    alignItems:'center',
    padding:4,
    borderRadius:24,
    marginTop:10,
    flexDirection:'row',
    gap:10,
    width:'auto',
  },
  UpdatesBtn:{
    backgroundColor:colors.primary,
    justifyContent:'center',
    alignItems:'center',
    borderRadius:24,
    width:'auto',
    padding:10,
    marginLeft:10,
    marginTop:10,
    flexDirection:'row',
    marginBottom:50,
    gap:5
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: height * 0.7, // adjust this to 0.25 (quarter), 0.5 (half), 0.75 (three-quarters)
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
    alignItems:'center'
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
})