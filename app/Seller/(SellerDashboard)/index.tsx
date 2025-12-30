import React, { useMemo } from "react";
import {View, Text, ScrollView, StyleSheet, TouchableOpacity, FlatList} from "react-native";
import { AntDesign, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/contexts/ThemeContext";
const stats = [
  { label: "Total", value: 0, icon: "inventory-2", iconColor: "#FF9900" },
  { label: "Pending", value: 0, icon: "pending-actions", iconColor: "#F59E0B" },
  { label: "Orders", value: 0, icon: "shopping-bag", iconColor: "#10B981" },
  { label: "Active Orders", value: 0, icon: "local-shipping", iconColor: "#3B82F6" },
];

const activities = [
  {
    id: "1",
    title: "Welcome to ShopCheap!",
    description: "Your account has been successfully created.",
    time: "Just now",
    icon: "notifications",
    bg: "#DBEAFE",
    iconColor: "#2563EB",
  },
  {
    id: "2",
    title: "Email Verified",
    description: "You have verified your email address.",
    time: "2 hrs ago",
    icon: "done",
    bg: "#FEF3C7",
    iconColor: "#F59E0B",
  },
  {
    id: "3",
    title: "Store Setup",
    description: "Please complete your store profile.",
    time: "1 day ago",
    icon: "storefront",
    bg: "#F3E8FF",
    iconColor: "#A855F7",
  },
];

export default function SellerDashboard() {
  const {colors, theme} = useTheme();
  const styles = useMemo(() => appStyles(colors), [colors]);
  
  const Dashboard = () => {
    return(
      <View style={{padding:12}}>
        {/* Greeting */}
        <View style={styles.greeting}>
          <View style={styles.dashboardIcon}>
            <MaterialIcons name="dashboard" size={24} color="white" />
          </View>
          <View>
            <Text style={styles.greetingText}>
              Hello <Text style={styles.username}>jay72</Text>,
            </Text>
            <Text style={styles.subText}>Welcome to your dashboard</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          {stats.map((item) => (
            <View key={item.label} style={styles.statCard}>
              <View style={styles.statHeader}>
                <Text style={styles.statLabel}>{item.label}</Text>
                <MaterialIcons name={item.icon as any} size={22} color={item.iconColor} />
              </View>
              <Text style={styles.statNumber}>{item.value}</Text>
            </View>
          ))}
        </View>

        {/* Chart */}
        <View style={styles.chartCard}>
          <View>
            <Text style={styles.chartTitle}>Total Orders</Text>
            <Text style={styles.chartSub}>Last 3 months</Text>
          </View>
          <View style={styles.chartPlaceholder}>
            <FontAwesome name="bar-chart" size={48} color={colors.grayish} />
            <Text style={styles.chartText}>No data available for this period</Text>
          </View>
        </View>

        <View style={styles.activityHeader}>
            <Text style={styles.sectionTitle}>Top 5 Recent Activities</Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Recent Activities */}
          <FlatList
            data={activities}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={<Dashboard/>}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.activityItem} activeOpacity={0.9}>
                <View style={[styles.activityIcon, { backgroundColor: item.bg }]}>
                  <MaterialIcons name={item.icon as any} size={20} color={item.iconColor} />
                </View>
                <View style={styles.activityText}>
                  <Text style={styles.activityTitle}>{item.title}</Text>
                  <Text style={styles.activityDesc}>{item.description}</Text>
                </View>
                <Text style={styles.activityTime}>{item.time}</Text>
              </TouchableOpacity>
            )}
          />
      </View>
    </View>
  );
}

const appStyles = (colors: any) => StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.background 
  },
  greeting: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginBottom: 12, 
    color:colors.text
  },
  dashboardIcon: {
    width: 40,
    height: 40,
    backgroundColor: colors.primary,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  greetingText: { 
    fontSize: 18, 
    fontWeight: "600", 
    color: colors.text 
  },
  username: { 
    color: Colors.primary 
  },
  subText: { 
    fontSize: 13, 
    color: colors.grayish 
  },
  statsGrid: { 
    flexDirection: "row", 
    flexWrap: "wrap", 
    justifyContent: "space-between", 
    marginVertical: 12 
  
  },
  statCard: {
    width: "48%",
    backgroundColor:colors.card,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.lightgray,
    marginBottom: 10,
  },
  statHeader: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center" 
  },
  statLabel: { 
    fontSize: 12, 
    color: colors.text, 
    textTransform: "uppercase" 
  },
  statNumber: { 
    fontSize: 22, 
    fontWeight: "700", 
    marginTop: 6, 
    color: colors.text 
  },
  chartCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.lightgray,
    padding: 16,
    marginVertical: 10,
  },
  chartTitle: { 
    fontSize: 16, 
    fontWeight: "700", 
    color: colors.text 
  },
  chartSub: { 
    fontSize: 11, 
    color: colors.grayish 
  },
  chartPlaceholder: {
    height: 140,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.lightgray,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  chartText: { 
    fontSize: 12, 
    color: colors.grayish, 
    textAlign: "center", 
    marginTop: 6 
  },
  activityHeader: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    marginBottom: 8 
  },
  sectionTitle: { 
    fontSize: 16, 
    fontWeight: "700", 
    color: colors.text 
  },
  viewAll: { 
    fontSize: 12, 
    color: colors.grayish 
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor:colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.lightgray,
    marginBottom:10
  },
  activityIcon: {
    padding: 8,
    borderRadius: 8,
    marginRight: 10,
  },
  activityText: { 
    flex: 1 
  },
  activityTitle: { 
    fontSize: 14, 
    fontWeight: "600", 
    color: colors.text 
  },
  activityDesc: { 
    fontSize: 11, 
    color: colors.grayish 
  },
  activityTime: { 
    fontSize: 10, 
    color: colors.grayish 
  },
});
