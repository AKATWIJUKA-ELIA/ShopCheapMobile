import React, { useMemo } from "react";
import {View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Image} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { useRouter } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";

export default function AllProductsScreen() {
  const router = useRouter();
  const {colors, toggleTheme} = useTheme();
  const styles = useMemo(() => appStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Search */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <MaterialIcons name="search" size={18} color={colors.grayish} />
            <TextInput
              placeholder="Search products..."
              placeholderTextColor={colors.grayish}
              style={styles.searchInput}
            />
          </View>
          <TouchableOpacity style={styles.filterBtn}>
            <MaterialIcons name="filter-list" size={24} color={colors.light} />
          </TouchableOpacity>
        </View>

        {/* Products */}
        {products.map((p) => (
          <View key={p.id} style={styles.productCard}>
            {/* Left: Checkbox + Image */}
            <View style={styles.productLeft}>
              {/* <View style={styles.checkbox} /> */}
              {p.image ? (
                <Image source={{ uri: p.image }} style={styles.image} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <MaterialIcons name="image" size={22} color={colors.grayish}/>
                </View>
              )}
            </View>

            {/* Right: Product Info */}
            <View style={styles.productInfo}>
              {/* Top Row: Name, Category, Status */}
              <View style={styles.productTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.productName} numberOfLines={1}>
                    {p.name}
                  </Text>
                  <Text style={styles.category}>{p.category}</Text>
                </View>
                <View style={[styles.statusBadge, p.statusStyle]}>
                  <Text style={[styles.statusText, p.statusTextStyle]}>{p.status}</Text>
                </View>
              </View>

              {/* Middle Row: Condition + Date Created */}
              <View style={styles.middleRow}>
                <Text style={styles.conditionText}>Condition: {p.condition || "N/A"}</Text>
                <Text style={styles.dateText}>Created: {p.dateCreated || "N/A"}</Text>
              </View>

              {/* Bottom Row: Price + Actions */}
              <View style={styles.productBottom}>
                <Text style={styles.price}>{p.price}</Text>
                <View style={styles.actions}>
                  <TouchableOpacity style={styles.actionBtn}>
                    <MaterialIcons name="visibility" size={18} color={colors.text} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.editBtn}>
                    <MaterialIcons name="edit" size={18} color="#F97316" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        ))}
        <Text style={styles.footerText}>Showing 4 of 28 products</Text>
      </ScrollView>
    </View>
  );
}

/* ---------------- DATA ---------------- */

const products = [
  {
    id: "1",
    name: "Nike Air Max Red",
    category: "Sneakers",
    price: "$120.00",
    status: "Approved",
    statusStyle: { backgroundColor: "#DCFCE7" },
    statusTextStyle: { color: "#15803D" },
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBIUSHjFJmVZTV0d64vSxSaI5lbrTMd9tbY3g6nVLpFRldfNCDIgkOsE5runA92j9u1gmzzYG482RtwFwRjdaTTCXvGMTq2BS2pTEDzS6brzB0oVjHmIQeaZYH-C8dIDT6OqHONcRh2T3tMnsgq6aEJi-rVoQCtrqyfr7rGgP_niXrKOccy9-R0wLSVrjsCOq-77aYnl3_Pe9ulycSCn6IxuUOOLetsuwkgF-__HX2BC66fZYnHtLDjY7C9O_9HgnnFvDUVtq4Qhg",
  },
  {
    id: "2",
    name: "Minimalist Watch",
    category: "Accessories",
    price: "$85.50",
    status: "Pending",
    statusStyle: { backgroundColor: "#FEF3C7" },
    statusTextStyle: { color: "#B45309" },
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBwO1YgyMeyEn9whmurYmPEDzlmRbj3p0nO7a9iapKGkwi7vShm_ei5x_rNxkZtmqrhjA1KmNPei0Q9dAuuKQwZmg5h0g566hyU7E9NKD4wir2KmH5O1HTX168kvRV7UQMOza_1X-uxqeWUT7vbK64GqQvOCrL7t5JYpRmCxIG7jf5e1WQ9OJXXf-FCOD-P9ZKUCy91azCzbROkVuaU7qz_CAOSrJB1bSZ1c1WR8TQHpbkzTBIVOrmW-AYYF_bqEHdcU3yF0oUPAA",
  },
  {
    id: "3",
    name: "Sony Headphones",
    category: "Electronics",
    price: "$299.00",
    status: "Rejected",
    statusStyle: { backgroundColor: "#FEE2E2" },
    statusTextStyle: { color: "#B91C1C" },
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCvh5AhxMLvTGYZaXZ5uIn25INtKBlnZjwrSo-BkKyehP3i7gqLw05KBqdAZ1bzLw8g8Qi0Sm-LfBVfCnjGKRaMG1Yaop3ak_SIVMn6kYUZK2M8h8_goP2DMjMfQIeSWOtw21C1mT5xNOWqwm3hIpQcIqyzxT9tvJxPajI6zi_a5TAPXR0-IPLssXackJg2KeUCGdDnb9VAiFmcfgngNjr7-z2ga_9GNyov9_zPEXnUml9vImkfTtg6dGzH_ej6JxamKwgvd98UaQ",
  },
  {
    id: "4",
    name: "Vintage Denim Jacket",
    category: "Clothing",
    price: "$55.00",
    status: "Approved",
    statusStyle: { backgroundColor: "#DCFCE7" },
    statusTextStyle: { color: "#15803D" },
    image: null,
  },
];

/* ---------------- STYLES ---------------- */

const appStyles = (colors: any) => StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.background 
  },
  content: { 
    padding: 16, 
    backgroundColor: colors.background 
},
  searchRow: { 
    flexDirection: "row", 
    marginBottom: 12 
},
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginRight: 8,
    borderColor:colors.lightgray,
    borderWidth:1
  },
  searchInput: { 
    flex: 1, 
    fontSize: 14, 
    marginLeft: 6,
    color:colors.text 
},
  filterBtn: {
    backgroundColor: colors.primary,
    padding: 8,
    borderRadius: 12,
  },

  productCard: {
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.lightgray,
    marginBottom: 10,
    flexDirection: "row",
  },
  productLeft: { 
    alignItems: "center", 
    marginRight: 10 
},
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    marginBottom: 6,
  },

  image: { 
    width: 64, 
    height: 64, 
    borderRadius: 8 
},
  imagePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },

  productInfo: { 
    flex: 1 
},
  productTop: { 
    flexDirection: "row", 
    justifyContent: "space-between" 
},
  productName: { 
    fontSize: 14, 
    fontWeight: "600" ,
    color:colors.text
},
  category: { 
    fontSize: 12, 
    color: colors.grayish 
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: { 
    fontSize: 10, 
    fontWeight: "600" 
  },
  productBottom: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  priceLabel: { 
    fontSize: 11, 
    color: colors.grayish 
},
  price: { 
    fontSize: 16, 
    fontWeight: "700", 
    color: colors.text 
},
  actions: { 
    flexDirection: "row" 
  },
  actionBtn: {
    backgroundColor: colors.background,
    padding: 6,
    borderRadius: 6,
    marginRight: 6,
  },
  editBtn: {
    backgroundColor: "rgba(249,115,22,0.15)",
    padding: 6,
    borderRadius: 6,
  },

  footerText: {
    marginTop: 16,
    textAlign: "center",
    fontSize: 12,
    color: colors.grayish,
  },
  middleRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 6,
  marginBottom: 8,
},
conditionText: {
  fontSize: 11,
  color: colors.grayish,
},
dateText: {
  fontSize: 11,
  color: colors.grayish,
},
});
