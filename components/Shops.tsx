import { useTheme } from '@/contexts/ThemeContext';
import { AUTH_TOKEN, GET_RECOMMENDATIONS_API_URL, GET_RELATED_PRODUCTS_API_URL, GET_SPONSORED_PRODUCTS_API_URL, Product, getFirstImage } from '@/types/product';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import SectionHeader from './SectionHeader';
import { ShopData } from "@/types/webTypes";

const { width } = Dimensions.get('window');
const CARD_SIZE = Math.min(136, width * 0.44);

interface shopProps {
    shops: ShopData[];
};
const ShopItem = ({ item, colors }: { item: ShopData; colors: any }) => {
    const router = useRouter();
    // const imageUrl = getFirstImage(item.product_image);

    return (
        <TouchableOpacity
            style={[
                styles.card,
                {
                    width: CARD_SIZE,
                    height: CARD_SIZE,
                    backgroundColor: "#f3eae7",
                    borderColor: "#c32727",
                    borderWidth: 0.3,
                },
            ]}
            activeOpacity={0.85}
            onPress={() => router.push({ pathname: '/(modals)/product', params: { id: item._id } })}
        >
            <View style={[styles.imageWrap, { backgroundColor: colors.background }]}>
                <Image
                    source={item.cover_image ? { uri: item.cover_image } : require('@/assets/images/placeholder.webp')}
                    style={styles.image}
                    resizeMode="cover"
                />
                <Text style={[styles.text,]} numberOfLines={2}>
                    {item.shop_name}
                </Text>
                <Image
                    source={item.profile_image ? { uri: item.profile_image } : require('@/assets/images/placeholder.webp')}
                    style={styles.profile}
                    resizeMode="cover"
                />
            </View>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
                {item.description}
            </Text>
            </TouchableOpacity>
    );
};


const Shops = ({ shops }: shopProps) => {
    const [loading, setLoading] = useState(true);
    const { colors } = useTheme();
    const router = useRouter();


    useEffect(() => {
        console.log("shops data in Shops component:", shops);
        if (shops.length > 0) {
            setLoading(false);
        }
    }, [shops]);

        if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
            </View>
        );
    }
    return (
        <View style={styles.container}>
            <SectionHeader title="Trending Shops" actionText='see all' 
            onActionPress={() => router.push("/(tabs)/shops")} />
            <FlatList
                data={shops}
                renderItem={({ item }) => <ShopItem item={item} colors={colors} />}
                keyExtractor={(item) => item._id}
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={CARD_SIZE + 12}
                decelerationRate="fast"
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 5,
        padding: 4,
        backgroundColor: '#f6f2e9',
    },
    card: {
        borderRadius: 1,
        borderWidth: 0.3,
        padding: 2,
        marginRight: 6,
        // borderTopWidth: 0.3,
        borderColor: '#c32727',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 1,
        justifyContent: 'space-between',
    },
    imageWrap: {
        flex: 1,
        // borderRadius: 4,
        // alignItems: 'center',
        // justifyContent: 'center',
        overflow: 'hidden',
    },
    loadingContainer: {
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingHorizontal: 16,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    profile:{
        width: 30,
        height: 30,
        borderRadius: 20,
        position: 'absolute',
        bottom: 2,
        left: 3,
        borderWidth: 1,
        borderColor: '#fff',
    },
    title: {
        fontSize: 11,
        fontWeight: '600',
        textAlign: 'center',
        marginTop: 8,
        paddingVertical: 4,
        lineHeight: 14,
    },
    text: {
        position: 'absolute',
        bottom: 5,
        backgroundColor: 'rgb(255, 255, 255)',
        color: '#f54141',
        borderRadius: 50,
        paddingHorizontal: 6,
        right: 1,        
        fontSize: 8,
        fontWeight: '600',
        paddingVertical: 4,
        lineHeight: 14,
    },
});

export default Shops;
