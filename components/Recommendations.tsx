import { useTheme } from '@/contexts/ThemeContext';
import { AUTH_TOKEN, GET_RECOMMENDATIONS_API_URL, GET_RELATED_PRODUCTS_API_URL, GET_SPONSORED_PRODUCTS_API_URL, Product, getFirstImage } from '@/types/product';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import SectionHeader from './SectionHeader';

const { width } = Dimensions.get('window');
const CARD_SIZE = Math.min(136, width * 0.44);

const RecommendationItem = ({ item, colors }: { item: Product; colors: any }) => {
    const router = useRouter();
    const imageUrl = getFirstImage(item.product_image);

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
                    source={imageUrl ? { uri: imageUrl } : require('@/assets/images/placeholder.webp')}
                    style={styles.image}
                    resizeMode="cover"
                />
                <Text style={[styles.price,]} numberOfLines={2}>
                    shs. {item.product_price}
                </Text>
            </View>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
                {item.product_name}
            </Text>
            </TouchableOpacity>
    );
};


const Recommendations = () => {
    const [recommendations, setRecommendations] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const { colors } = useTheme();
    const router = useRouter();
    const fetchSponsoredProducts = async (): Promise<Product[]> => {
        const related: Product[] = [];
            try {
                const res = await fetch(`${GET_SPONSORED_PRODUCTS_API_URL}`,{
                     headers: {
                        'Content-Type': 'application/json',
                        "X-Auth-Token": AUTH_TOKEN,
                    },
                    method: "GET",
                }
                );
                if (res.ok) {
                    const data = await res.json();
                    const items = Array.isArray(data.data.page) ? data.data.page : [];
                    // console.log(`[Recommendations] Fetched sponsored products:`, data);
                    related.push(...items);

                    setRecommendations(items);
                }
            } catch (err) {
                console.log('[Recommendations] Related fetch error for', err);
            }
        
        return related;
    };

    const fetchRecommendations = useCallback(async () => {
        try {
            // if (!user?._id) {
            //     setLoading(false);
            //     return;
            // }

            let recommendedItems: Product[] = [];
            const types = ['view', 'purchase', 'bookmark', 'cart'];
            for (const type of types) {
                const res = await fetch(`${GET_RECOMMENDATIONS_API_URL}?type=${type}`,{
                    headers: {
                        'Content-Type': 'application/json',
                        "X-Auth-Token": AUTH_TOKEN,
                    },
                    method: "GET",
                });
                if (res.ok) {
                    const data = await res.json();
                    console.log(`[Recommendations] Fetched ${type} recommendations:`, data);
                    recommendedItems = Array.isArray(data) ? data : (data || []);
                    
                }
            }
            if (recommendedItems.length === 0||!recommendedItems) {
                recommendedItems = await fetchSponsoredProducts();
            }
            setRecommendations(recommendedItems);

            // setRecommendations(allItems);
        } catch (error) {
            console.error('[Recommendations] Error:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        setLoading(true);
        const fetchData = async () => {
            await fetchRecommendations();
        }
        
        fetchData();
        
    }, []);
    // if (!isAuthenticated) return null;

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
            </View>
        );
    }

    if (recommendations.length === 0) return null;

    return (
        <View style={styles.container}>
            <SectionHeader title="you may also like" actionText='see all' 
            onActionPress={() => router.push("/(tabs)/categories")} />
            <FlatList
                data={recommendations}
                renderItem={({ item }) => <RecommendationItem item={item} colors={colors} />}
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
        marginTop:4
    },
    listContent: {
        paddingHorizontal: 16,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    title: {
        fontSize: 11,
        fontWeight: '600',
        textAlign: 'center',
        marginTop: 8,
        paddingVertical: 4,
        lineHeight: 14,
    },
    price: {
        position: 'absolute',
        bottom: 10,
        backgroundColor: 'rgb(255, 255, 255)',
        color: '#f54141',
        borderRadius: 50,
        paddingHorizontal: 6,
        left: 10,        
        fontSize: 11,
        fontWeight: '600',
        paddingVertical: 4,
        lineHeight: 14,
    },
});

export default Recommendations;
