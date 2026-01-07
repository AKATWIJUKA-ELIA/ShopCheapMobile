import { useTheme } from '@/contexts/ThemeContext';
import { useAuthStore } from '@/store/useAuthStore';
import { CREATE_SHOP_API_URL } from '@/types/product';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function CreateShopScreen() {
    const { colors } = useTheme();
    const styles = useMemo(() => appStyles(colors), [colors]);
    const router = useRouter();
    const { user } = useAuthStore();

    const [shopName, setShopName] = useState("");
    const [shopSlogan, setShopSlogan] = useState("");
    const [shopDescription, setShopDescription] = useState("");
    const [profileImage, setProfileImage] = useState("");
    const [coverImage, setCoverImage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleCreateShop = async () => {
        if (!user) return Alert.alert("Authentication", "Please log in to create a shop.");
        if (!shopName || !shopDescription) {
            return Alert.alert("Validation Error", "Shop Name and Description are required!");
        }

        try {
            setLoading(true);
            const response = await fetch(CREATE_SHOP_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    shop_name: shopName,
                    description: shopDescription,
                    slogan: shopSlogan,
                    owner_id: user._id,
                    profile_image: profileImage || 'https://via.placeholder.com/200',
                    cover_image: coverImage || 'https://via.placeholder.com/1200x400',
                    location: {
                        lat: 0.3476,
                        lng: 32.5825
                    }
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                Alert.alert("Success", "Shop created successfully!");
                router.replace('/Seller/seller');
            } else {
                Alert.alert("Error", data.message || "Failed to create shop");
            }
        } catch (error) {
            Alert.alert("Error", "An unexpected error occurred.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Create Your <Text style={{ color: colors.primary }}>Shop</Text></Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.label}>Shop Name *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your shop name"
                    placeholderTextColor={colors.grayish}
                    value={shopName}
                    onChangeText={setShopName}
                    cursorColor={colors.primary}
                />

                <Text style={styles.label}>Shop Slogan</Text>
                <TextInput
                    style={styles.input}
                    placeholder="A catchy tagline for your store"
                    placeholderTextColor={colors.grayish}
                    value={shopSlogan}
                    onChangeText={setShopSlogan}
                    cursorColor={colors.primary}
                />

                <Text style={styles.label}>Shop Description *</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Tell customers about your shop..."
                    placeholderTextColor={colors.grayish}
                    value={shopDescription}
                    onChangeText={setShopDescription}
                    multiline
                    numberOfLines={4}
                    cursorColor={colors.primary}
                />
            </View>

            <View style={styles.card}>
                <Text style={styles.label}>Shop Images (URLs for now)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Profile Image URL"
                    placeholderTextColor={colors.grayish}
                    value={profileImage}
                    onChangeText={setProfileImage}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Cover Image URL"
                    placeholderTextColor={colors.grayish}
                    value={coverImage}
                    onChangeText={setCoverImage}
                />
            </View>

            <TouchableOpacity
                style={[styles.submitBtn, { opacity: loading ? 0.7 : 1 }]}
                onPress={handleCreateShop}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.submitText}>Create Shop</Text>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
}

const appStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        padding: 16
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 10
    },
    backBtn: {
        marginRight: 10
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.text
    },
    card: {
        backgroundColor: colors.card,
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.borderLine || '#eee'
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 6,
        marginTop: 10
    },
    input: {
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.grayish,
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        color: colors.text,
        marginBottom: 10
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top'
    },
    submitBtn: {
        backgroundColor: colors.primary,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10
    },
    submitText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16
    }
});
