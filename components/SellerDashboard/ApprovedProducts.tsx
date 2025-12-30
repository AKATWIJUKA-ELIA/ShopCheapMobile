import React, { useMemo } from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image, FlatList, SafeAreaView} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';

const PRODUCTS = [
  {
    id: '1',
    name: 'Nike Air Max Red',
    category: 'Shoes & Sneakers',
    price: '$129.00',
    time: '2h ago',
    condition: 'New Condition',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAxv86kLfqr1zrk33Ymo7s8GvjS_1JjHL88EA9MaV9N_oDuitIzHUQn0UAey_vVkY1gjYCrwh1L-RhFFLFuMUO-9RIXuR-BdsRZqbZaPP1vUId7CClTc-DNV-YoaljZJ1J-uYyA7r8pgyvRexMM9gW3mxeoXDLK1FQSpMs4ZGprQm375VkAzehJutoG0EHSXR8cHRVIXecBFn6jivwRZxqPHBPBCgByj7aRSq5T5eKTC2ftPpil_gQpe6ZJG1Eyz-9tIL14WbFwkg',
  },
  {
    id: '2',
    name: 'Minimalist Wrist Watch',
    category: 'Accessories',
    price: '$45.50',
    time: '1d ago',
    condition: 'Used - Good',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDsknA6pxX48FyKS-4C5sy_Ii1yCJTdIvhFd4Yn2uP6PyjcUBDQ57nXUpnW2JOOmLCZa3p4R-Csrk5RG1mPkC0M2jgKV-hbickvSuCNdYnGKfmzhnxPsPvbDrejWVgBd94Pa99dwel82eWklD1hD2iAF8ykeXy3-TLwlkaXm9RXCPY6DNre9xvsSLq_RJpgQV89bhJMkLVN2SGAxF-uZDPvarpY93zl8vgH0mjtxItyXyLEX_PFSoX4tg93YuHy2ucQkZMIypZxGg',
  },
];

export default function ApprovedProductsScreen() {
  const router = useRouter();
  const {colors, toggleTheme} = useTheme();
  const styles = useMemo(() => appStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.container}>
      {/* CONTENT */}
      <FlatList
        contentContainerStyle={styles.content}
        data={PRODUCTS}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            {/* <Text style={styles.title}>Approved Products</Text> */}

            {/* ACTION BUTTONS */}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.boostBtn}>
                <MaterialIcons name="rocket-launch" size={18} color="#047857" />
                <Text style={styles.boostText}>Boost Selected</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.deleteBtn}>
                <MaterialIcons name="delete" size={18} color="#B91C1C" />
                <Text style={styles.deleteText}>Delete Selected</Text>
              </TouchableOpacity>
            </View>
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.image} />

            <View style={styles.cardContent}>
              <View style={styles.cardTop}>
                <Text style={styles.productName} numberOfLines={1}>
                  {item.name}
                </Text>
                {/* <MaterialIcons name="more-vert" size={20} color="#9CA3AF" /> */}
              </View>

              <Text style={styles.category}>{item.category}</Text>

              <View style={styles.badges}>
                <Text style={styles.approvedBadge}>Approved</Text>
                <Text style={styles.conditionBadge}>{item.condition}</Text>
              </View>

              <View style={styles.cardBottom}>
                <Text style={styles.price}>{item.price}</Text>
                <View style={styles.time}>
                  <MaterialIcons name="schedule" size={12} color="#9CA3AF" />
                  <Text style={styles.timeText}>{item.time}</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const appStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 120,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  boostBtn: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    backgroundColor: '#DCFCE7',
    padding: 12,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boostText: {
    color: '#047857',
    fontWeight: '600',
    fontSize: 13,
  },
  deleteBtn: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteText: {
    color: '#B91C1C',
    fontWeight: '600',
    fontSize: 13,
  },
  card: {
    flexDirection: 'row',
    backgroundColor:colors.card,
    borderRadius: 14,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.lightgray,
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 10,
    marginRight: 10,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: 6,
    color: colors.text,
  },
  category: {
    fontSize: 12,
    color:colors.grayish,
  },
  badges: {
    flexDirection: 'row',
    gap: 6,
    marginVertical: 4,
  },
  approvedBadge: {
    fontSize: 10,
    backgroundColor: '#DCFCE7',
    color: '#047857',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  conditionBadge: {
    fontSize: 10,
    backgroundColor: '#E5E7EB',
    color: '#4B5563',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    color: '#F97316',
    fontWeight: '700',
    fontSize: 16,
  },
  time: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 10,
    color: colors.grayish,
  },
});
