import { useTheme } from '@/contexts/ThemeContext';
import { useAuthStore } from '@/store/useAuthStore';
import { CREATE_SHOP_API_URL } from '@/types/product';
import { showToast } from '@/utils/toast';
import { uploadImages } from '@/utils/upload';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function CreateShopScreen() {
    const { colors } = useTheme();
    const styles = useMemo(() => appStyles(colors), [colors]);
    const router = useRouter();
    const { user } = useAuthStore();

    const [shopName, setShopName] = useState("");
    const [shopSlogan, setShopSlogan] = useState("");
    const [shopDescription, setShopDescription] = useState("");
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [coverImage, setCoverImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState("");

    const pickImage = async (setter: (uri: string | null) => void, aspect: [number, number] = [1, 1]) => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: aspect,
                quality: 0.2,
            });

            if (!result.canceled) {
                setter(result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert("Error", "Failed to pick image");
            console.error(error);
        }
    };

    const handleCreateShop = async () => {
        if (!user) return Alert.alert("Authentication", "Please log in to create a shop.");
        if (!shopName || !shopDescription) {
            return showToast("Shop Name and Description are required!", "error");
        }

        try {
            setLoading(true);

            // Upload images first
            let finalProfileImage = profileImage;
            let finalCoverImage = coverImage;

            if (profileImage && (profileImage.startsWith('file://') || profileImage.startsWith('content://'))) {
                setLoadingStatus("Uploading profile image...");
                const ids = await uploadImages([profileImage]);
                if (ids.length > 0) finalProfileImage = ids[0];
            }

            if (coverImage && (coverImage.startsWith('file://') || coverImage.startsWith('content://'))) {
                setLoadingStatus("Uploading cover photo...");
                const ids = await uploadImages([coverImage]);
                if (ids.length > 0) finalCoverImage = ids[0];
            }

            setLoadingStatus("Creating shop...");

            const response = await fetch(CREATE_SHOP_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    shop_name: shopName,
                    description: shopDescription,
                    slogan: shopSlogan,
                    owner_id: user._id,
                    profile_image: finalProfileImage || 'https://via.placeholder.com/200',
                    cover_image: finalCoverImage || 'https://via.placeholder.com/1200x400',
                    location: {
                        lat: 0.3476,
                        lng: 32.5825
                    }
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                showToast("Shop created successfully!", "success");
                router.replace('/Seller/seller');
            } else {
                showToast(data.message || "Failed to create shop", "error");
            }
        } catch (error) {
            showToast("An unexpected error occurred.", "error");
            console.error(error);
        } finally {
            setLoading(false);
            setLoadingStatus("");
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
                <Text style={styles.label}>Shop Images</Text>

                <Text style={styles.label}>Profile Picture</Text>
                <TouchableOpacity
                    style={[styles.input, { height: 100, justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed' }]}
                    onPress={() => pickImage(setProfileImage)}
                >
                    {profileImage ? (
                        <Image source={{ uri: profileImage }} style={{ width: '100%', height: '100%', borderRadius: 8 }} resizeMode="contain" />
                    ) : (
                        <View style={{ alignItems: 'center' }}>
                            <MaterialIcons name="add-a-photo" size={30} color={colors.grayish} />
                            <Text style={{ color: colors.grayish, fontSize: 12 }}>Pick Profile Image</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <Text style={styles.label}>Cover Photo</Text>
                <TouchableOpacity
                    style={[styles.input, { height: 120, justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed' }]}
                    onPress={() => pickImage(setCoverImage, [3, 1])}
                >
                    {coverImage ? (
                        <Image source={{ uri: coverImage }} style={{ width: '100%', height: '100%', borderRadius: 8 }} resizeMode="contain" />
                    ) : (
                        <View style={{ alignItems: 'center' }}>
                            <MaterialIcons name="image" size={30} color={colors.grayish} />
                            <Text style={{ color: colors.grayish, fontSize: 12 }}>Pick Cover Photo</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={[styles.submitBtn, { opacity: loading ? 0.7 : 1 }]}
                onPress={handleCreateShop}
                disabled={loading}
            >
                {loading ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <ActivityIndicator color="#fff" size="small" />
                        <Text style={[styles.submitText, { marginLeft: 10, fontSize: 14 }]}>{loadingStatus}</Text>
                    </View>
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
