import ErrorView from "@/components/ui/ErrorView";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuthStore } from "@/store/useAuthStore";
import { GET_ORDERS_BY_SELLER_API_URL, GET_PRODUCTS_BY_SELLER_API_URL } from "@/types/product";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
const stats = [
  { label: "Total", value: 0, icon: "inventory-2", iconColor: "#FF9900" },
  { label: "Pending", value: 0, icon: "pending-actions", iconColor: "#F59E0B" },
  { label: "Orders", value: 0, icon: "shopping-bag", iconColor: "#10B981" },
  { label: "Active Orders", value: 0, icon: "local-shipping", iconColor: "#3B82F6" },
];


const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending': return { icon: 'pending-actions', color: '#F59E0B', bg: '#FEF3C7' };
    case 'confirmed': return { icon: 'check-circle', color: '#10B981', bg: '#DCFCE7' };
    case 'out-for-delivery': return { icon: 'local-shipping', color: '#3B82F6', bg: '#DBEAFE' };
    case 'delivered': return { icon: 'done-all', color: '#047857', bg: '#D1FAE5' };
    case 'cancelled': return { icon: 'cancel', color: '#EF4444', bg: '#FEE2E2' };
    default: return { icon: 'notifications', color: '#2563EB', bg: '#DBEAFE' };
  }
};

export default function SellerDashboard() {
  const { colors, theme } = useTheme();
  const styles = useMemo(() => appStyles(colors), [colors]);
  const { user } = useAuthStore();

  const [productsCount, setProductsCount] = useState(0);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [stats, setStats] = useState([
    { label: "Total Prods", value: 0, icon: "inventory-2", iconColor: "#FF9900" },
    { label: "Pending", value: 0, icon: "pending-actions", iconColor: "#F59E0B" },
    { label: "Orders", value: 0, icon: "shopping-bag", iconColor: "#10B981" },
    { label: "Active", value: 0, icon: "local-shipping", iconColor: "#3B82F6" },
  ]);

  const fetchData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);

      // Fetch Products
      const prodRes = await fetch(`${GET_PRODUCTS_BY_SELLER_API_URL}?sellerId=${user._id}`);
      if (!prodRes.ok) throw new Error("Failed to fetch products");
      const prodData = await prodRes.json();
      const pCount = Array.isArray(prodData) ? prodData.length : 0;
      setProductsCount(pCount);

      // Fetch Orders
      const orderRes = await fetch(`${GET_ORDERS_BY_SELLER_API_URL}?sellerId=${user._id}`);
      if (!orderRes.ok) throw new Error("Failed to fetch orders");
      const orderData = await orderRes.json();
      const ordersList = Array.isArray(orderData) ? orderData : [];
      setOrders(ordersList);

      // Update Stats
      setStats([
        { label: "Total Prods", value: pCount, icon: "inventory-2", iconColor: "#FF9900" },
        { label: "Pending", value: ordersList.filter(o => o.order_status === 'pending').length, icon: "pending-actions", iconColor: "#F59E0B" },
        { label: "Orders", value: ordersList.length, icon: "shopping-bag", iconColor: "#10B981" },
        { label: "Active", value: ordersList.filter(o => ['confirmed', 'out-for-delivery'].includes(o.order_status)).length, icon: "local-shipping", iconColor: "#3B82F6" },
      ]);

      // Derive Activities from Recent Orders
      const derivedActivities = ordersList.slice(0, 5).map((o: any) => {
        const { icon, color, bg } = getStatusIcon(o.order_status);
        return {
          id: o._id,
          title: `Order #${o._id.slice(-6).toUpperCase()}`,
          description: `Status changed to ${o.order_status}`,
          time: new Date(o._creationTime).toLocaleDateString(),
          icon,
          bg,
          iconColor: color
        }
      });
      setActivities(derivedActivities);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      setError("Unable to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);


  const Dashboard = () => {
    return (
      <View style={{ padding: 12 }}>
        {/* Greeting */}
        <View style={styles.greeting}>
          <View style={styles.dashboardIcon}>
            <MaterialIcons name="dashboard" size={24} color="white" />
          </View>
          <View>
            <Text style={styles.greetingText}>
              Hello <Text style={styles.username}>{user?.username || 'Seller'}</Text>,
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
          <Text style={styles.sectionTitle}>Recent Activities</Text>
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
        {loading ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : error ? (
          <ErrorView message={error} onRetry={fetchData} />
        ) : (
          <FlatList
            data={activities}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={<Dashboard />}
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
        )}
      </View>
    </View>
  );
}

const appStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    flex: 1
  },
  greeting: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    color: colors.text
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
    color: colors.primary
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
    backgroundColor: colors.card,
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
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.lightgray,
    marginBottom: 10
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
