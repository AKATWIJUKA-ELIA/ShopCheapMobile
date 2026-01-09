import ErrorView from '@/components/ui/ErrorView';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuthStore } from '@/store/useAuthStore';
import { GET_SHOP_BY_OWNER_API_URL, GET_SHOPS_API_URL, GET_USER_API_URL, UPDATE_SHOP_API_URL } from '@/types/product';
import { showToast } from '@/utils/toast';
import { uploadImages } from '@/utils/upload';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ShopProfileScreen() {
  const [isEditing, setIsEditing] = useState(false);
  const { colors, theme, toggleTheme } = useTheme();
  const styles = useMemo(() => appStyles(colors), [colors]);
  const { user } = useAuthStore();

  const [shopName, setShopName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState("");
  const [originalShopData, setOriginalShopData] = useState<any>(null);

  const fetchShop = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);

      console.log(`[ShopFetch] Fetching user details for: ${user._id}`);
      const userRes = await fetch(`${GET_USER_API_URL}?id=${user._id}`);
      if (!userRes.ok) {
        throw new Error(`Failed to fetch user details: ${userRes.status}`);
      }
      const userData = await userRes.json();
      console.log(`[ShopFetch] User details found:`, userData);

      // Try fetching shop by owner ID
      let shopResponse = await fetch(`${GET_SHOP_BY_OWNER_API_URL}?owner_id=${userData._id}`);
      let shopData = await shopResponse.json();

      // Fallback: search in all shops if direct owner fetch fails
      if (!shopData.success) {
        console.log(`[ShopFetch] Direct owner_id fetch failed, searching in all shops...`);
        const allShopsRes = await fetch(GET_SHOPS_API_URL);
        if (allShopsRes.ok) {
          const allShops = await allShopsRes.json();
          const foundShop = allShops.find((s: any) => s.owner_id === userData._id);
          if (foundShop) {
            shopData = { success: true, shop: foundShop };
          }
        }
      }

      if (shopData.success && shopData.shop) {
        const s = shopData.shop;
        setShopName(s.shop_name);
        setTagline(s.slogan);
        setDescription(s.description);
        setProfileImage(s.profile_image);
        setCoverImage(s.cover_image);
        setOriginalShopData(s);
        console.log(`[ShopFetch] Shop profile loaded successfully`);
      } else {
        setError(shopData.message || "Shop profile not found for your account.");
      }
    } catch (error: any) {
      console.error("Error fetching shop profile:", error);
      setError(error.message || "Network request failed. Unable to load shop profile.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const pickImage = async (setter: (uri: string) => void, aspect: [number, number] = [1, 1]) => {
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

  useEffect(() => {
    fetchShop();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchShop();
  };

  const onSave = async () => {
    if (!user || !originalShopData) return;
    try {
      setSaving(true);
      setLoadingStatus("Uploading images...");

      let finalProfileImage = profileImage;
      let finalCoverImage = coverImage;

      // Handle profile image upload if changed
      if (profileImage && (profileImage.startsWith('file://') || profileImage.startsWith('content://'))) {
        const ids = await uploadImages([profileImage]);
        if (ids.length > 0) finalProfileImage = ids[0];
      }

      // Handle cover image upload if changed
      if (coverImage && (coverImage.startsWith('file://') || coverImage.startsWith('content://'))) {
        const ids = await uploadImages([coverImage]);
        if (ids.length > 0) finalCoverImage = ids[0];
      }

      setLoadingStatus("Saving changes...");

      const response = await fetch(UPDATE_SHOP_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopId: originalShopData._id,
          shop_name: shopName,
          description: description,
          slogan: tagline,
          profile_image: finalProfileImage,
          cover_image: finalCoverImage,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showToast("Shop profile updated successfully", "success");
        setIsEditing(false);
        fetchShop(); // Refresh data
      } else {
        showToast(result.message || "Failed to update shop", "error");
      }
    } catch (error) {
      console.error("Error saving shop profile:", error);
      showToast("An error occurred while saving", "error");
    } finally {
      setSaving(false);
      setLoadingStatus("");
    }
  };

  const onCancel = () => {
    if (originalShopData) {
      setShopName(originalShopData.shop_name);
      setTagline(originalShopData.slogan);
      setDescription(originalShopData.description);
      setProfileImage(originalShopData.profile_image);
      setCoverImage(originalShopData.cover_image);
    }
    setIsEditing(false);
  };

  if (loading && !refreshing) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <ErrorView message={error} onRetry={fetchShop} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        <View style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={styles.mainTitle}>Shop Settings</Text>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setIsEditing((p) => !p)}
            >
              <MaterialIcons
                name={isEditing ? 'close' : 'edit'}
                size={24}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.mainSubtitle}>
            {isEditing
              ? 'Edit your shop details'
              : "Manage your shop's visual identity and details."}
          </Text>
        </View>

        {/* Branding Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderTitle}>
              <MaterialIcons name="storefront" size={16} color={colors.primary} />
              <Text style={styles.sectionTitleText}>Shop Branding</Text>
            </View>
          </View>

          <View style={styles.sectionContent}>
            {/* Shop Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Shop Name</Text>

              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={shopName}
                  onChangeText={setShopName}
                  placeholder="Shop name"
                  cursorColor={colors.primary}
                />
              ) : (
                <Text style={styles.readOnlyText}>{shopName}</Text>
              )}
            </View>

            {/* Tagline */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tagline</Text>

              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={tagline}
                  onChangeText={setTagline}
                  placeholder="Tagline"
                  cursorColor={colors.primary}
                />
              ) : (
                <Text style={styles.readOnlyText}>{tagline}</Text>
              )}
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Shop Description</Text>

              {isEditing ? (
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  placeholder="Description"
                  cursorColor={colors.primary}
                />
              ) : (
                <Text style={[styles.readOnlyText, { fontWeight: '500', fontSize: 12 }]}>{description}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Images Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderTitle}>
              <MaterialIcons name="image" size={16} color={colors.primary} />
              <Text style={styles.sectionTitleText}>Shop Images</Text>
            </View>
          </View>

          <View style={styles.sectionContent}>
            {/* Logo */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Shop Logo</Text>
              <View style={styles.logoRow}>
                {profileImage ? (
                  <Image source={{ uri: Array.isArray(profileImage) ? profileImage[0] : profileImage }} style={styles.logoImage} />
                ) : (
                  <View style={styles.logoPlaceholder}>
                    <MaterialIcons name="storefront" size={28} color={colors.grayish} />
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.uploadHelper}>
                    Recommended size:{'\n'}
                    <Text style={{ fontWeight: '500' }}>200x200px</Text>
                  </Text>
                  {isEditing && (
                    <TouchableOpacity style={styles.uploadButton} onPress={() => pickImage(setProfileImage)}>
                      <MaterialIcons name="upload-file" size={14} color={colors.primary} />
                      <Text style={styles.uploadButtonText}>Change Logo</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>

            {/* Banner */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Shop Banner</Text>
              {coverImage ? (
                <Image source={{ uri: Array.isArray(coverImage) ? coverImage[0] : coverImage }} style={styles.bannerImage} />
              ) : (
                <View style={styles.bannerDropZone}>
                  <MaterialIcons name="add-photo-alternate" size={32} color={colors.grayish} />
                  <Text style={styles.uploadTextSmall}>No banner uploaded</Text>
                </View>
              )}
              {isEditing && (
                <TouchableOpacity style={styles.uploadButton} onPress={() => pickImage(setCoverImage, [3, 1])}>
                  <MaterialIcons name="upload-file" size={14} color={colors.primary} />
                  <Text style={styles.uploadButtonText}>Change Banner</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
        {/* Bottom Save / Cancel buttons */}
        {isEditing && (
          <View style={styles.bottomBar}>
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.grayish }]}
              onPress={onCancel}
            >
              <Text style={styles.saveButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveButton} onPress={onSave} disabled={saving}>
              {saving ? (
                <ActivityIndicator size="small" color={colors.light} />
              ) : (
                <MaterialIcons name="save" size={16} color={colors.light} />
              )}
              <Text style={styles.saveButtonText}>{saving ? loadingStatus : "Save Changes"}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Theme Button */}
      {!isEditing && (
        <TouchableOpacity style={styles.themeButton}
          onPress={toggleTheme}
        >
          <Ionicons
            name="moon"
            size={24}
            color={colors.background}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}


const appStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  iconButton: {
    padding: 8,
    borderRadius: 99
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text

  },
  mainSubtitle: {
    fontSize: 12,
    color: colors.grayish,
    marginTop: 2
  },
  section: {
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.lightgray,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderColor: colors.lightgray,
    paddingBottom: 8
  },
  sectionHeaderTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  sectionTitleText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text
  },
  sectionSubtitle: {
    fontSize: 10,
    color: colors.grayish,
    marginTop: 2
  },
  sectionContent: {
    marginTop: 8
  },
  inputGroup: {
    marginBottom: 12
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.lightgray,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    color: colors.text,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top'
  },
  inputHelper: {
    fontSize: 10,
    color: colors.lightgray,
    marginTop: 2
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12
  },
  logoImage: {
    width: 96,
    height: 96,
    borderRadius: 12,
  },
  logoPlaceholder: {
    width: 96,
    height: 96,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    borderRadius: 12,
    backgroundColor: colors.lightgray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerImage: {
    width: '100%',
    height: 128,
    borderRadius: 12,
    marginBottom: 4,
  },
  bannerDropZone: {
    width: '100%',
    height: 128,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    borderRadius: 12,
    backgroundColor: colors.lightgray,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  uploadText: {
    fontSize: 10,
    color: colors.grayish,
    fontWeight: '500',
    marginTop: 2
  },
  uploadTextSmall: {
    fontSize: 10,
    color: colors.grayish
  },
  uploadHelper: {
    fontSize: 10,
    color: colors.grayish,
    marginTop: 4
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4
  },
  uploadButtonText: {
    fontSize: 12,
    color: colors.primary,
    marginLeft: 2
  },
  bottomBar: {
    padding: 16,
    backgroundColor: colors.background,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  savePrompt: {
    fontSize: 10,
    color: colors.grayish,
    marginBottom: 4
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 12,
  },
  saveButtonText: {
    color: colors.light
    ,
    fontWeight: '600',
    fontSize: 14
  },
  themeButton: {
    position: 'absolute',
    bottom: 40,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'black',
    shadowOpacity: 0.8,
    shadowRadius: 9,
  },
  readOnlyText: {
    fontSize: 14,
    color: colors.grayish,
    fontWeight: '700',
  }
});
