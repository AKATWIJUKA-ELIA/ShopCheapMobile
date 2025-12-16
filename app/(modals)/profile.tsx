import { Colors } from "@/constants/Colors";
import { useTheme } from "@/contexts/ThemeContext";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import React, { useMemo } from "react";
import { Image, Platform, Text, TouchableOpacity, View, StyleSheet } from "react-native";


export default function UserProfile() {
  const user = {
    name: "Jay Oabs",
    email: "jayoabs72@gmail.com",
    phone: "+256 772615135",
    address: "Bugema, Uganda",
    avatar: "https://avatars.githubusercontent.com/u/143481214?v=4",
  };

  const router = useNavigation();

    const {colors, theme} = useTheme();
    const styles = useMemo(() => appStyles(colors), [colors]);
  
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{flexDirection:'row', alignItems:'center', padding:16}}>
        {Platform.OS === 'android'? (
          <TouchableOpacity onPress={() => router.goBack()} style={{backgroundColor:colors.background}}
          >
            <Ionicons name="arrow-back" size={24} color={colors.primary}/>
          </TouchableOpacity>
        ): undefined}

        <Text style={{color:colors.primary, flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700',}}>Profile</Text>
      </View>

      <View style={{ alignItems: "center", padding: 20, backgroundColor: colors.primary, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8 }}>
        <Image
          source={{ uri: user.avatar }}
          style={{ width: 140, height: 140, borderRadius: 99, borderWidth: 2, borderColor: "#e5e7eb" }}
        />
        <Text style={{ fontSize: 22, fontWeight: "bold", marginTop: 10 }}>{user.name}</Text>
        <Text style={{ color: colors.dark, fontSize: 16 }}>{user.email}</Text>
      </View>

      <View style={{ padding: 20 }}>
        <View style={{ backgroundColor: colors.card, borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4 }}>
          <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 4, color:colors.text }}>Phone Number</Text>
          <Text style={{ fontSize: 15, color: colors.primary }}>{user.phone}</Text>
        </View>

        <View style={{ backgroundColor: colors.card, borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4 }}>
          <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 4, color:colors.text }}>Address</Text>
          <Text style={{ fontSize: 15, color: colors.primary }}>{user.address}</Text>
        </View>

        <TouchableOpacity style={{ marginTop: 20, paddingVertical: 12, backgroundColor: colors.primary, borderRadius: 12, flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
          <Feather name="edit-3" size={18} color={colors.dark} style={{ marginRight: 6 }} />
          <Text style={{ color: colors.dark, fontWeight: "600" }}>Edit Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const appStyles = (colors: any) => StyleSheet.create({});