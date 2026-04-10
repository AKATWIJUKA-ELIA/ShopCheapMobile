import { useTheme } from '@/contexts/ThemeContext';
import { useAuthStore } from '@/store/useAuthStore';
import { GET_RECOMMENDATIONS_API_URL, GET_RELATED_PRODUCTS_API_URL, Product, getFirstImage } from '@/types/product';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import SectionHeader from './SectionHeader';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.7;

const RecommendationItem = ({ item, colors }: { item: Product; colors: any }) => {
    const router = useRouter();
    const imageUrl = getFirstImage(item.product_image);

    return (
        <TouchableOpacity
            style={[styles.itemContainer, { backgroundColor: colors.background }]}
            onPress={() => router.push({ pathname: '/(modals)/product', params: { id: item._id } })}
            activeOpacity={0.9}
        >
            <Image
                source={imageUrl ? { uri: imageUrl } : require('@/assets/images/placeholder.webp')}
                style={styles.image}
                resizeMode="cover"
            />
            <View style={[styles.infoContainer, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                <Text style={styles.name} numberOfLines={1}>
                    {item.product_name}
                </Text>
            </View>
        </TouchableOpacity>
    );
};


const Recommendations = () => {
    const { user, isAuthenticated } = useAuthStore();
    const [recommendations, setRecommendations] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const { colors } = useTheme();

    const fetchRelatedProducts = async (categories: string[]): Promise<Product[]> => {
        const related: Product[] = [];
        for (const category of categories) {
            try {
                const res = await fetch(`${GET_RELATED_PRODUCTS_API_URL}?category=${encodeURIComponent(category)}`);
                if (res.ok) {
                    const data = await res.json();
                    const items = Array.isArray(data) ? data : [];
                    related.push(...items);
                }
            } catch (err) {
                console.log('[Recommendations] Related fetch error for', category);
            }
        }
        return related;
    };

    const fetchRecommendations = useCallback(async () => {
        try {
            if (!user?._id) {
                setLoading(false);
                return;
            }

            let recItems: Product[] = [];
            const types = ['view', 'purchase', 'bookmark', 'cart'];
            for (const type of types) {
                const url = `${GET_RECOMMENDATIONS_API_URL}?userId=${user._id}&type=${type}`;
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    recItems = Array.isArray(data) ? data : (data.products || data.recommendations || []);
                    if (recItems.length > 0) break;
                }
            }

            const categories = [...new Set(recItems.map((p: Product) => p.product_category).filter(Boolean))];
            let relatedItems: Product[] = [];
            if (categories.length > 0) {
                relatedItems = await fetchRelatedProducts(categories.slice(0, 3));
            }

            const seenIds = new Set(recItems.map(p => p._id));
            const uniqueRelated = relatedItems.filter(p => !seenIds.has(p._id));
            const allItems = [...recItems, ...uniqueRelated];

            setRecommendations(allItems);
        } catch (error) {
            console.error('[Recommendations] Error:', error);
        } finally {
            setLoading(false);
        }
    }, [user?._id]);

    useEffect(() => {
        if (isAuthenticated && user?._id) {
            fetchRecommendations();
        } else {
            setLoading(false);
        }
    }, [isAuthenticated, user?._id, fetchRecommendations]);

    if (!isAuthenticated) return null;

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
            <SectionHeader title="Recommended for you" />
            <FlatList
                data={recommendations}
                renderItem={({ item }) => <RecommendationItem item={item} colors={colors} />}
                keyExtractor={(item) => item._id}
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={ITEM_WIDTH + 16}
                decelerationRate="fast"
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 10,
    },
    loadingContainer: {
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingHorizontal: 16,
        gap: 16,
    },
    itemContainer: {
        width: ITEM_WIDTH,
        height: 180,
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    infoContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 10,
    },
    name: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
});

export default Recommendations;
