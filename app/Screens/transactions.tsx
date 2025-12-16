import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const mockTransactions = [
  {
    id: '1',
    title: 'Order #1023',
    date: '12 Dec 2025',
    amount: 'UGX 250,000',
    status: 'PAID',
  },
  {
    id: '2',
    title: 'Order #1024',
    date: '10 Dec 2025',
    amount: 'UGX 90,000',
    status: 'PENDING',
  },
];

export default function TransactionsPage() {
  const { colors } = useTheme();
  const styles = useMemo(() => appStyles(colors), [colors]);
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return '#22c55e';
      case 'PENDING':
        return '#facc15';
      default:
        return '#ef4444';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transactions</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={mockTransactions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={styles.transactionCard}>
            <View>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.date}>{item.date}</Text>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.amount}>{item.amount}</Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(item.status) },
                ]}
              >
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const appStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
    },
    headerTitle: {
      flex: 1,
      textAlign: 'center',
      fontSize: 18,
      fontWeight: '700',
      color: colors.primary,
    },
    transactionCard: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: colors.card,
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.borderLine,
    },
    title: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '600',
    },
    date: {
      color: colors.grayish,
      fontSize: 13,
      marginTop: 4,
    },
    amount: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: '700',
    },
    statusBadge: {
      marginTop: 6,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 20,
    },
    statusText: {
      color: '#000',
      fontSize: 11,
      fontWeight: '700',
    },
  });
