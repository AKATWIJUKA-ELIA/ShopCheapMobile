import { Colors } from "@/constants/Colors";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import React from "react";
import { Image, Platform, Text, TouchableOpacity, View } from "react-native";


export default function UserProfile() {
  const user = {
    name: "Jay Oabs",
    email: "jayoabs72@gmail.com",
    phone: "+256 772615135",
    address: "Bugema, Uganda",
    avatar: "https://avatars.githubusercontent.com/u/143481214?v=4",
  };

  const router = useNavigation();
  
  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={{flexDirection:'row'}}>
        {Platform.OS === 'android'? (
          <TouchableOpacity onPress={() => router.goBack()} style={{backgroundColor:Colors.background, padding:20}}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.primary}/>
          </TouchableOpacity>
        ): undefined}

        <Text style={{color:Colors.primary, fontSize:24, fontWeight:'bold', padding:20}}>Profile</Text>
      </View>

      <View style={{ alignItems: "center", padding: 20, backgroundColor: Colors.primary, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8 }}>
        <Image
          source={{ uri: user.avatar }}
          style={{ width: 140, height: 140, borderRadius: 99, borderWidth: 2, borderColor: "#e5e7eb" }}
        />
        <Text style={{ fontSize: 22, fontWeight: "bold", marginTop: 10 }}>{user.name}</Text>
        <Text style={{ color: Colors.dark, fontSize: 16 }}>{user.email}</Text>
      </View>

      <View style={{ padding: 20 }}>
        <View style={{ backgroundColor: Colors.dark, borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4 }}>
          <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 4, color:Colors.text }}>Phone Number</Text>
          <Text style={{ fontSize: 15, color: Colors.primary }}>{user.phone}</Text>
        </View>

        <View style={{ backgroundColor: Colors.dark, borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4 }}>
          <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 4, color:Colors.text }}>Address</Text>
          <Text style={{ fontSize: 15, color: Colors.primary }}>{user.address}</Text>
        </View>

        <TouchableOpacity style={{ marginTop: 20, paddingVertical: 12, backgroundColor: Colors.primary, borderRadius: 12, flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
          <Feather name="edit-3" size={18} color={Colors.dark} style={{ marginRight: 6 }} />
          <Text style={{ color: Colors.dark, fontWeight: "600" }}>Edit Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}