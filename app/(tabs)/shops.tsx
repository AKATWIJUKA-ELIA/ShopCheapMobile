import React, { useMemo } from 'react';
import {View, Text, StyleSheet, FlatList, Image, TouchableOpacity, TextInput, ScrollView} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import DynamicSearchBar from '@/components/DynamicSearchBar';
import HelpCenter, { openHelpSideBar } from '@/components/ui/help';
import FloatingButton from '@/components/ui/FloatingBtn';

const SHOPS = [
  {
    id: '1',
    name: 'tech-machines',
    tagline: '"Deliver the best"',
    description:
      'We offer good machines laptops, desktops, phones both used and new machines at affordable price.',
    products: 1,
    owner: 'Snow Virus',
    cover: 'https://picsum.photos/600/300?1',
    logo: 'https://picsum.photos/200?1',
    open: true,
  },
  {
    id: '2',
    name: 'light-electronics',
    tagline: '"light-electronics"',
    description:
      'Premium electronics and gadgets store specializing in cutting-edge technology.',
    products: 10,
    owner: 'Light',
    cover: 'https://picsum.photos/600/300?2',
    logo: 'https://picsum.photos/200?2',
    open: true,
  },
  {
    id: '3',
    name: 'smart-zone',
    tagline: '"Smart living"',
    description:
      'Smart home devices, accessories, and automation tools for modern homes.',
    products: 24,
    owner: 'Aaron',
    cover: 'https://picsum.photos/600/300?3',
    logo: 'https://picsum.photos/200?3',
    open: false,
  },
  {
    id: '4',
    name: 'gadget-hub',
    tagline: '"Future tech"',
    description:
      'Latest gadgets, wearables, and mobile accessories at competitive prices.',
    products: 18,
    owner: 'John',
    cover: 'https://picsum.photos/600/300?4',
    logo: 'https://picsum.photos/200?4',
    open: true,
  },
  {
    id: '5',
    name: 'elite-electronics',
    tagline: '"Quality first"',
    description:
      'High-end electronics store focusing on durability and premium brands.',
    products: 32,
    owner: 'Elite Group',
    cover: 'https://picsum.photos/600/300?5',
    logo: 'https://picsum.photos/200?5',
    open: true,
  },
  {
    id: '6',
    name: 'budget-tech',
    tagline: '"Affordable tech"',
    description:
      'Affordable phones, accessories, and refurbished electronics.',
    products: 12,
    owner: 'Budget Tech',
    cover: 'https://picsum.photos/600/300?6',
    logo: 'https://picsum.photos/200?6',
    open: false,
  },
];


export default function ShopsScreen() {
    const router = useRouter();
    const {colors, toggleTheme} = useTheme();
    const styles = useMemo(() => appStyles(colors), [colors]);

    const HeroSection = () => {
      return (
        <View style={styles.hero}>
           {/* <DynamicSearchBar/> */}
          <View style={{flexDirection:'row', justifyContent:'space-between', gap:10, alignItems:'center'}}>
              <TouchableOpacity style={styles.heroIcon} onPress={() => router.push('/Seller/(SellerDashboard)/shop')}>
                  <MaterialIcons name="storefront" size={26} color={colors.light} />
              </TouchableOpacity>
              <Text style={styles.heroTitle}>Explore Shops</Text>
              
          </View>
          <Text style={styles.heroSubtitle}>
            Discover amazing sellers on ShopCheap
          </Text>

          <View style={styles.searchBox}>   
            <Ionicons name="search" size={18} color={colors.grayish} />
            <TextInput
              placeholder="Search shops by name, products or owner..."
              placeholderTextColor={colors.grayish}
              style={styles.searchInput}
              cursorColor={colors.primary}
            />
          </View>
        </View>
      )
    }

  return (
    <View style={styles.container}>
      {/* Shops Grid */}
      <FlatList
        data={SHOPS}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={{ padding: 10, paddingBottom: 10 }}
        ListHeaderComponent={<HeroSection/>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cover}>
              <Image source={{ uri: item.cover }} style={styles.coverImage} />
              <View
                style={[
                  styles.status,
                  { backgroundColor: item.open ? '#22C55E' : '#6B7280' },
                ]}
              >
                <MaterialIcons
                  name="schedule"
                  size={10}
                  color={colors.light}
                />
                <Text style={styles.statusText}>
                  {item.open ? 'Open' : 'Closed'}
                </Text>
              </View>

              <View style={styles.logoWrap}>
                <Image source={{ uri: item.logo }} style={styles.logoImg} />
              </View>
            </View>

            <View style={styles.cardBody}>
              <Text style={styles.shopName}>{item.name}</Text>
              <Text style={styles.tagline}>{item.tagline}</Text>
              <Text numberOfLines={2} style={styles.desc}>
                {item.description}
              </Text>

              <View style={styles.meta}>
                <View style={styles.metaRow}>
                  <MaterialIcons
                    name="inventory-2"
                    size={14}
                    color={colors.grayish}
                  />
                  <Text style={styles.metaText}>
                    {item.products} products
                  </Text>
                </View>
                <Text style={styles.metaText}>by {item.owner}</Text>
              </View>

              <TouchableOpacity style={styles.visitBtn} onPress={() => router.push(`/Screens/${item.id}`)}>
                <Text style={styles.visitText}>Visit Shop</Text>
                <MaterialIcons
                  name="arrow-forward"
                  size={16}
                  color={colors.light}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <HelpCenter/>
      <FloatingButton 
        onPress={openHelpSideBar}
        icon='message-alert'
        color={Colors.primary}
        onLongPress={toggleTheme}
      />
    </View>
  );
}

const appStyles = (colors: any) => StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.background,
  },
  hero: {
    backgroundColor: colors.background,
    padding: 16,
    alignItems: 'center',
    width:'100%'
  },
  heroIcon: {
    backgroundColor:colors.primary,
    padding: 8,
    borderRadius: 12,
    marginBottom: 8,
  },
  heroTitle: { 
    fontSize: 22, 
    fontWeight: '700', 
    color: colors.text 
  },
  heroSubtitle: { 
    fontSize: 12, 
    color: colors.grayish, 
    marginBottom: 12 
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    width: '100%',
    borderColor:colors.primary,
    borderWidth:1
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingLeft: 8,
    color: colors.text,
    fontSize: 14,
  },
  card: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.lightgray,
    marginBottom: 12
  },
  cover: { 
    height: 120, 
    backgroundColor: '#D1D5DB' 
  },
  coverImage: { 
    width: '100%', 
    height: '100%' 
  },
  status: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: { 
    fontSize: 10, 
    color: colors.light, 
    fontWeight: '600' 
  },
  logoWrap: {
    position: 'absolute',
    bottom: -18,
    left: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.light,
    overflow: 'hidden',
  },
  logoImg: { 
    width: '100%', 
    height: '100%' 
  },

  cardBody: { 
    padding: 12, 
    paddingTop: 24 
  },
  shopName: { 
    fontSize: 14, 
    fontWeight: '700', 
    color: colors.primary 
  },
  tagline: { 
    fontSize: 10, 
    color: colors.grayish, 
    fontStyle: 'italic' 
  },
  desc: { 
    fontSize: 12, 
    color: colors.grayish, 
    marginVertical: 6 
  },

  meta: {
    borderTopWidth: 1,
    borderColor: colors.lightgray,
    paddingTop: 8,
    marginTop: 4,
  },
  metaRow: { 
    flexDirection: 'row', 
    gap: 4, 
    alignItems: 'center' 
  },
  metaText: { 
    fontSize: 10, 
    color: colors.lightgray 
  },
  visitBtn: {
    marginTop: 8,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    alignItems: 'center',
  },
  visitText: { 
    color: colors.light, 
    fontSize: 12, 
    fontWeight: '600' 
  },
});
