import React from "react";
import { View, Image, ScrollView, TouchableOpacity, Text } from "react-native";
import { MaterialIcons, FontAwesome, Entypo, Feather } from "@expo/vector-icons";

export default function UserProfile() {
  const user = {
    name: "Aaron",
    email: "aaron@example.com",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  };

  const menuItems = [
    { title: "My Orders", icon: <MaterialIcons name="shopping-bag" size={22} color="#374151" /> },
    { title: "Wishlist", icon: <FontAwesome name="heart" size={22} color="#374151" /> },
    { title: "Shipping Address", icon: <Entypo name="location-pin" size={22} color="#374151" /> },
    { title: "Payment Methods", icon: <MaterialIcons name="credit-card" size={22} color="#374151" /> },
    { title: "Account Settings", icon: <Feather name="settings" size={22} color="#374151" /> },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <View style={{ alignItems: "center", padding: 16, backgroundColor: "white", shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }}>
        <Image
          source={{ uri: user.avatar }}
          style={{ width: 96, height: 96, borderRadius: 48, borderWidth: 4, borderColor: "#e5e7eb" }}
        />
        <Text style={{ fontSize: 20, fontWeight: "bold", marginTop: 8 }}>{user.name}</Text>
        <Text style={{ color: "#6b7280" }}>{user.email}</Text>

        <TouchableOpacity style={{ marginTop: 12, paddingVertical: 8, paddingHorizontal: 20, backgroundColor: "#f3f4f6", borderRadius: 12, flexDirection: "row", alignItems: "center" }}>
          <Feather name="edit-3" size={16} color="#374151" style={{ marginRight: 6 }} />
          <Text style={{ color: "#374151", fontWeight: "600" }}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={{ padding: 16 }}>
        {menuItems.map((item, index) => (
          <TouchableOpacity key={index} style={{ marginBottom: 12, backgroundColor: "white", borderRadius: 16, padding: 16, flexDirection: "row", alignItems: "center", shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4 }}>
            {item.icon}
            <Text style={{ fontSize: 16, marginLeft: 12, flex: 1 }}>{item.title}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={{ marginTop: 24, backgroundColor: "#fef2f2", borderColor: "#fecaca", borderWidth: 1, borderRadius: 16, padding: 16, flexDirection: "row", alignItems: "center" }}>
          <MaterialIcons name="logout" size={22} color="#dc2626" style={{ marginRight: 12 }} />
          <Text style={{ fontSize: 16, fontWeight: "bold", color: "#dc2626" }}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}