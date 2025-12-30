import { Colors } from '@/constants/Colors';
import { Feather, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import CustomPopup from '../Account/PopUp';
import { useTheme } from '@/contexts/ThemeContext';


//this is the global state of the Settings Popup
let _setIsPopUpOpen: ((open: boolean) => void) | null = null;

export const usePopUpState = () => {
  const [isPopUpOpen, setIsPopUpOpen] = useState(false);

  // store the setter globally so other files can trigger it
  _setIsPopUpOpen = setIsPopUpOpen;
  return { isPopUpOpen, setIsPopUpOpen };
};

//functions to control the modal from anywhere
export const openSettingsPopUp = () => _setIsPopUpOpen?.(true);
export const closeSettingsPopUp = () => _setIsPopUpOpen?.(false);


export default function AccountSettings() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const { theme, toggleTheme, colors } = useTheme();
  const darkThemeEnabled = theme === 'dark';
  const {isPopUpOpen} = usePopUpState();

  const styles = useMemo(() => appStyles(colors), [colors]);

  const router = useRouter();

  const handleChangePassword = () => {
    Alert.alert('Change Password', 'Navigate to change password screen');
  };

  const handlePrivacyPolicy = () => {
    Alert.alert('Privacy Policy', 'Open Privacy Policy');
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => {closeSettingsPopUp(), router.push('/(auth)/login')} },
    ]);
  };

  return (
    <View style={[styles.container, darkThemeEnabled && styles.darkContainer]}>
      <CustomPopup visible={isPopUpOpen} onClose={closeSettingsPopUp}
        blurType={'light'}  
        blurAmount={5}
        heightPercent={0.7}
        widthPercent={0.8}
      >
        <TouchableOpacity onPress={closeSettingsPopUp} style={[styles.backBtn, {top:0, left:0}]}>
            <Ionicons name="close" size={24} color={colors.primary}/>
        </TouchableOpacity>

        <View style={{marginTop:-20}}>
            <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
              <Ionicons name={darkThemeEnabled ? 'moon' : 'sunny'} size={24} color={colors.primary}/>

              <Text style={{color:colors.primary, fontSize:24, fontWeight:'bold', padding:20}}>
                {`${darkThemeEnabled ? 'Dark' : 'Light'} Mode`}
              </Text>
            </View>
          
          <Text style={[styles.title, darkThemeEnabled && { color: colors.text }]}>Account Settings</Text>

          <View style={[styles.settingCard, darkThemeEnabled && styles.darkCard]}>
            <Ionicons name='notifications' size={24} color={colors.light}/>
            <Text style={[styles.settingText, darkThemeEnabled && { color: colors.text }]}>Notifications</Text>
            <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} thumbColor={notificationsEnabled ? colors.primary : colors.grayish} />
          </View>

          <View style={[styles.settingCard, darkThemeEnabled && styles.darkCard]}>
            <Ionicons name={darkThemeEnabled ? 'moon' : 'sunny'} size={24} color={colors.primary}/>
            <Text style={[styles.settingText, darkThemeEnabled && { color: colors.text }]}>Theme Switch</Text>
            <Switch value={darkThemeEnabled} 
              onValueChange={toggleTheme} 
              thumbColor={darkThemeEnabled ? colors.primary : colors.grayish}
              // trackColor={{ false: Colors.gray, true: Colors.primary }} 
            />
          </View>

          <TouchableOpacity style={[styles.settingCard, darkThemeEnabled && styles.darkCard]} onPress={handleChangePassword} activeOpacity={0.7}>
            <MaterialIcons name='password' size={24} color={colors.light}/>
            <Text style={[styles.settingText, darkThemeEnabled && { color: colors.text }]}>Change Password</Text>
            <Feather name="chevron-right" size={24} color={darkThemeEnabled ? colors.light : colors.grayish} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.settingCard, darkThemeEnabled && styles.darkCard]} onPress={() => router.push('https://shopcheapug.com')} activeOpacity={0.7}>
            <MaterialIcons name='privacy-tip' size={24} color={colors.light}/>
            <Text style={[styles.settingText, darkThemeEnabled && { color: colors.text }]}>Privacy Policy</Text>
            <Feather name="chevron-right" size={24} color={darkThemeEnabled ? colors.text : colors.grayish} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.logoutButton]} onPress={handleLogout} activeOpacity={0.7}>
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Logout</Text>
          </TouchableOpacity>
        </View>
      </CustomPopup>
    </View>

  );
}

const appStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
  },
  darkContainer: {
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
    color:colors.light,
    textAlign:'center'
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
    backgroundColor: colors.gray,
  },
  settingText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.light,
  },
  logoutButton: {
    backgroundColor: 'red',
    padding: 12,
    borderRadius: 99,
    alignItems: 'center',
    marginTop: 8,
    marginBottom:10
  },
  backBtn:{
    
  },
  // backBtnDark:{
  //   backgroundColor:Colors.light, 
  //   padding:20,
  //   borderRadius:99,
  // }
});