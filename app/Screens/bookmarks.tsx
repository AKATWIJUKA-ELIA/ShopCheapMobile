import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const mockBookmarks = [
  {
    id: '1',
    title: 'Apple iPhone 13 Pro',
    subtitle: 'Electronics',
  },
  {
    id: '2',
    title: 'Samsung Galaxy S22',
    subtitle: 'Mobile Phones',
  },
];

export default function BookmarksPage() {
  const { colors } = useTheme();
  const styles = useMemo(() => appStyles(colors), [colors]);
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bookmarks</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Content */}
      {mockBookmarks.length === 0 ? (
        <View style={styles.emptyState}>
          <Feather name="bookmark" size={40} color={colors.grayish} />
          <Text style={styles.emptyText}>No bookmarks yet</Text>
        </View>
      ) : (
        <FlatList
          data={mockBookmarks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} activeOpacity={0.8}>
              <View>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.subtitle}>{item.subtitle}</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.grayish}
              />
            </TouchableOpacity>
          )}
        />
      )}
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
    card: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.borderLine,
    },
    title: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
    },
    subtitle: {
      color: colors.grayish,
      marginTop: 4,
      fontSize: 13,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyText: {
      color: colors.grayish,
      marginTop: 10,
    },
  });
