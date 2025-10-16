import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Linking, StyleSheet, ScrollView, Image, Platform, Pressable } from 'react-native';
import { Feather, FontAwesome, Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { router } from 'expo-router';
import SidebarModal from '../Account/SideBarModal';
import { useTheme } from '@/contexts/ThemeContext';



//this is the global state of the Help SideBar
let _setIsSideBarOpen: ((open: boolean) => void) | null = null;

export const useHelpSideBarState = () => {
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);

  // store the setter globally so other files can trigger it
  _setIsSideBarOpen = setIsSideBarOpen;

  return { isSideBarOpen, setIsSideBarOpen };
};

//functions to control the modal from anywhere
export const openHelpSideBar = () => _setIsSideBarOpen?.(true);
export const closeHelpSideBar = () => _setIsSideBarOpen?.(false);

export default function HelpCenter() {
  const {isSideBarOpen} = useHelpSideBarState();
  const { theme, toggleTheme, colors } = useTheme();

  return (
    <View style={styles.container}>
      <SidebarModal visible={isSideBarOpen} 
        onClose={() => closeHelpSideBar()}
        widthPercent={0.32} // control width
        heightPercent={0.4} // control height
        top={200} // distance from top (remove if you want it auto-centered)
        side="right" // "left" or "right"
        blurType="dark"
        blurAmount={5}
      >
         <Pressable onPress={() => closeHelpSideBar()}/>
        <Text style={{ 
            fontSize: 14, 
            fontWeight: "bold", 
            marginBottom: 20,
            justifyContent:'center',
            alignItems:'center',
            textAlign:'center',
            color:Colors.primary
        }}>
          Reach Us
        </Text>

        <View style={{flexDirection:'row', justifyContent:'space-between', gap:5}}>
          <TouchableOpacity onPress={() => Linking.openURL('tel:+256772615135')}
              style={[styles.helpBtn, {backgroundColor:'black'}]}
          >
            <Feather name='phone' size={24} color='white'/>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL('mailto:jayoabs72@gmail.com')}
              style={[styles.helpBtn, {backgroundColor:'black'}]}
          >
            <Feather name='mail' size={24} color='white'/>
          </TouchableOpacity>
        </View>

        <View style={{flexDirection:'row', justifyContent:'space-between', marginTop:20, gap:5}}>
          <TouchableOpacity onPress={() => Linking.openURL('https://wa.me/256772615135')}
              style={[styles.helpBtn, {backgroundColor:'#25D366'}]}
          >
            <FontAwesome name='whatsapp' size={24} color='white'/>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL('https://facebook.com/jayoabs') }
              style={[styles.helpBtn, {backgroundColor:'#1877F2'}]}
          >
            <FontAwesome name='facebook' size={24} color='white'/>
          </TouchableOpacity>
        </View>

        <View style={{flexDirection:'row', justifyContent:'space-between', marginTop:20, gap:5}}>
          <TouchableOpacity onPress={() => Linking.openURL('https://instagram.com/aaronelegant') }
              style={[styles.helpBtn, {backgroundColor:'#DD2A7B'}]}
          >
            <FontAwesome name='instagram' size={24} color='white'/>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL('https://twitter.com/JayOabs')}
              style={[styles.helpBtn, {backgroundColor:'black'}]}
          >
            <FontAwesome name='twitter' size={24} color='white'/>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={toggleTheme}
          style={[styles.helpBtn,{
            padding: 8,
            backgroundColor: colors.background,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop:10,
            width:50,
            height:50,
            margin:'auto'
          }]}
        >
          <Ionicons
            name={theme === 'dark' ? 'moon' : 'sunny'}
            size={25}
            color={theme === 'dark' ? colors.primary : colors.text}
          />
        </TouchableOpacity>
        

      </SidebarModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray,
  },
  contactCard:{
    borderRadius:99,
    width:40,
    height:40,
    justifyContent:'center',
    alignItems:'center'
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  methodName: {
    fontSize: 16,
    color: Colors.dark,
    fontWeight: '600',
  },
  helpBtn:{
    width:40,
    height:40,
    justifyContent:'center',
    alignItems:'center',
    borderRadius:99,
    padding:8
  }
});
