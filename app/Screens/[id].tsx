import { View, Text, StyleSheet, ScrollView, Image, FlatList, TextInput, Pressable, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import product from '../(modals)/product';

const PRODUCTS = [
  {
    id: '1',
    name: 'Ram DDR4',
    desc: 'This is a DDR4 Ram for Laptops',
    price: 'Ugx: 55,000',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD6LTTZeGChJV3C_AsjiPP4xMWgcFd62QZoMKAluymAbeJtrEjz61wQgLSDyaUhwWAHUS1Bu-cWMrCxGm2fWgEvc4cA0bAih0WVVOz56UvlgGViCVeUB4GUaCFv6qrKX6VVLpUDom025mHu_0A-kUCYyYonhW4I9QjFkB___0Om2EMuzlngogbmO4P2sBsnuN-CzYsmTDcQKnjmNxxZ7aAwdJA_HnRXDwCq1uHSGgplPPE_kyj5itn6GzxQ5_u4dSyWuImVc-e62A',
    badge: 'Used',
  },
  {
    id: '2',
    name: 'Nike Sneakers',
    desc: 'Comfortable running shoes',
    price: 'Ugx: 120,000',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD6u3i7gM0T7-A0l0gJherzlWTsiNRvju1BfUoB4UaNsvawwFGq2xQ8xs5tsp5bueDj5yF2nzhzNYeSh8ptHflfJCNuzDEYh0aBkW-YHrO3l4DoOvRZiyms0rCS528RqoDgcMP0UlR7buy_4IvEzILHBZzluvybg4S40ZBOMMPhWFW7Aw7Xbt36pkXIv60ShLv1D3o4v0ptwamRGLYUdnIkRQCW0R0m8NYCrEfs_nomwb-JMJaIfpV2URUh-tROo7dcmVpRSPoL7w',
    badge: 'New',
  },
  {
    id: '3',
    name: 'Nike Sneakers',
    desc: 'Comfortable running shoes',
    price: 'Ugx: 120,000',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD6u3i7gM0T7-A0l0gJherzlWTsiNRvju1BfUoB4UaNsvawwFGq2xQ8xs5tsp5bueDj5yF2nzhzNYeSh8ptHflfJCNuzDEYh0aBkW-YHrO3l4DoOvRZiyms0rCS528RqoDgcMP0UlR7buy_4IvEzILHBZzluvybg4S40ZBOMMPhWFW7Aw7Xbt36pkXIv60ShLv1D3o4v0ptwamRGLYUdnIkRQCW0R0m8NYCrEfs_nomwb-JMJaIfpV2URUh-tROo7dcmVpRSPoL7w',
    badge: 'New',
  },
  {
    id: '4',
    name: 'Nike Sneakers',
    desc: 'Comfortable running shoes',
    price: 'Ugx: 120,000',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD6u3i7gM0T7-A0l0gJherzlWTsiNRvju1BfUoB4UaNsvawwFGq2xQ8xs5tsp5bueDj5yF2nzhzNYeSh8ptHflfJCNuzDEYh0aBkW-YHrO3l4DoOvRZiyms0rCS528RqoDgcMP0UlR7buy_4IvEzILHBZzluvybg4S40ZBOMMPhWFW7Aw7Xbt36pkXIv60ShLv1D3o4v0ptwamRGLYUdnIkRQCW0R0m8NYCrEfs_nomwb-JMJaIfpV2URUh-tROo7dcmVpRSPoL7w',
    badge: 'New',
  },
];

export default function ShopDetailsScreen() {
  const { shopId } = useLocalSearchParams();
  const router = useRouter();

  const {colors} = useTheme();
  const styles = useMemo(() => appStyles(colors), [colors]);

  const Header = () => {
    return(
      <View>
        <Image
          source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCT4b2CjPTo0vAD8RKRJWjO5VegPIS19u3aXtT88QGUFkoGLSoZgdSai8Uc-uwnPEP0Szb_NCbIqqcGV1rrnW_trDE9pI94PDmXXo3b9i9zW4_PBJF_ri-M2cg_RK-b7m8Qs2JjZYX4we1IQP_VlRtpI94REwBZvUWCsBF0xib_Y-D5hX1z7l_sgFUlti_gD-0sAj9A8p2cRbMGlc_9ydLjMHW0T8L4uPPWsQMDl1ReGMao8AgJRcQL7h3ITJbT7XN54jy5jChbAg' }}
          style={styles.banner}
        />

        <View style={styles.profile}>
          <Image
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAxedEdyqoGn2P0t_10Ym5bFfAK4Iq2ptA2QjKY4FJmj6l_Cjf6ce4YccE04XPn6JX6Mzrbjn0w-QHoX5p29_WKl1lVaLG02m6Xqf7UoroeKZW8kdjjEuQW4U_-C5rTY9GvLQhUk8XKu45pPPuPq4FWXLqOUBB90VEIZLjGrAslJzeUU2Wr66_bRjhP-A9SyHQ34AjXe_gfUgsH3temnlCYda2uLkTEQFYjuHcignBJM7Ehtpb62OPoIm6mnOY4wPIrTd7JU4zhXA' }}
            style={styles.avatar}
          />

          <Text style={styles.shopName}>light-electronics</Text>
          <Text style={styles.username}>@light-electronics</Text>

          <View style={styles.badges}>
            <Text style={styles.openBadge}>Open</Text>
            <Text style={styles.verifiedBadge}>Verified Seller</Text>
            {/* Rating */}
            <View style={styles.rating}>
              <Ionicons name="star" size={14} color="#f59e0b" />
              <Text style={styles.ratingText}>4.6</Text>
            </View>
          </View>

          

          <Text style={styles.description}>
            Premium electronics and gadgets store specializing in cutting-edge technology.
          </Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Search */}
      {/* <View style={styles.searchBox}>
        <MaterialIcons name="search" size={20} color="#9ca3af" />
        <TextInput placeholder="Search products..." style={styles.searchInput} />
      </View> */}

      {/* Products */}
      <FlatList
        data={PRODUCTS}
        numColumns={2}
        keyExtractor={(item) => item.id}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={{ gap: 12, paddingBottom: 10 }}
        ListHeaderComponent={<Header/>}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.productCard} onPress={() => router.push({ pathname: '/(modals)/product', params: { id: product.id } })} activeOpacity={0.8}>
            <View style={styles.productImageWrapper}>
              <Text style={styles.productBadge}>{item.badge}</Text>
              <Image source={{ uri: item.image }} style={styles.productImage} />
            </View>

            <View style={styles.productInfo}>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productDesc}>{item.desc}</Text>
              <Text style={styles.productPrice}>{item.price}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
        <View style={styles.fixedContacts}>
          <TouchableOpacity style={styles.contactBtn}>
            <Ionicons name="call" size={18} color={colors.light} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactBtn}>
            <Ionicons name="mail" size={18} color={colors.light} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => router.back()} style={[styles.contactBtn, {
          position: 'absolute',
          top: 20,
          left: 20
        }]}>
            <Ionicons name="arrow-back" size={20} color={colors.light} />
        </TouchableOpacity>
    </View>
  );
}

const appStyles = (colors: any) => StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.background,
    padding:7
  },
  banner: { 
    height: 160, 
    width: '100%' 
  
  },
  profile: { 
    alignItems: 'center', 
    padding: 16, 
    marginTop: -50 
  },

  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: colors.light,
  },
  shopName: { 
    fontSize: 22, 
    fontWeight: '700', 
    marginTop: 8, 
    color:colors.primary
  },
  username: { 
    color: colors.grayish, 
    fontSize: 13 
  },
  badges: { 
    flexDirection: 'row', 
    gap: 8, 
    marginVertical: 8 
  },
openBadge: {
  backgroundColor: '#dcfce7',
  color: '#166534',
  paddingHorizontal: 8,
  borderRadius: 6,
  fontSize: 12,
},
closedBadge: {
  backgroundColor: '#f3f4f6',
  color: '#374151',
  paddingHorizontal: 8,
  borderRadius: 6,
  fontSize: 12,
},
verifiedBadge: {
  backgroundColor: '#fef3c7',
  color: '#92400e',
  paddingHorizontal: 8,
  borderRadius: 6,
  fontSize: 12,
},
unverifiedBadge: {
  backgroundColor: '#fee2e2',
  color: '#991b1b',
  paddingHorizontal: 8,
  borderRadius: 6,
  fontSize: 12,
},
rating: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#fffbeb', // subtle amber bg
  paddingHorizontal: 6,
  borderRadius: 6,
  gap: 2,
},
ratingText: {
  fontSize: 12,
  fontWeight: '600',
  color: '#92400e',
},
  description: { 
    textAlign: 'center', 
    color: colors.grayish, 
    fontSize: 13 
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchInput: { 
    flex: 1, 
    padding: 10 
  },
  productCard: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 12,
    overflow: 'hidden',
    borderColor:colors.lightgray,
    borderWidth:1
  },
  productImageWrapper: { 
    position: 'relative', 
    aspectRatio: 1 
  
  },
  productBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: colors.primary,
    color: '#fff',
    fontSize: 10,
    paddingHorizontal: 6,
    borderRadius: 4,
    zIndex: 1,
  },
  productImage: { 
    width: '100%', 
    height: '100%' 
  },
  productInfo: { 
    padding: 8 
  },
  productName: { 
    fontWeight: '700', 
    fontSize: 13, 
    color:colors.text
  },
  productDesc: { 
    fontSize: 11, 
    color: colors.grayish 
  },
  productPrice: { 
    fontWeight: '700', 
    color: colors.primary, 
    marginTop: 4 
  },
fixedContacts: {
  position: 'absolute',
  top: 16,
  right: 16,
  flexDirection: 'row',
  gap: 8,
  zIndex: 20,           // stays above content
},

contactBtn: {
  backgroundColor:colors.primary,
  width: 38,
  height: 38,
  borderRadius: 19,
  justifyContent: 'center',
  alignItems: 'center',
  elevation: 4,         // Android shadow
  shadowColor: '#000',  // iOS shadow
  shadowOpacity: 0.2,
  shadowRadius: 4,
  shadowOffset: { width: 0, height: 2 },
},

contactIcon: {
  color: '#fff',
  fontSize: 20,
},
});
