import ErrorView from '@/components/ui/ErrorView';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuthStore } from '@/store/useAuthStore';
import { GET_SHOP_BY_OWNER_API_URL } from '@/types/product';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

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

  const fetchShop = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${GET_SHOP_BY_OWNER_API_URL}?ownerId=${user._id}`);
      if (!res.ok) throw new Error("Failed to fetch shop profile");
      const data = await res.json();
      if (data.success && data.shop) {
        setShopName(data.shop.shop_name);
        setTagline(data.shop.slogan);
        setDescription(data.shop.description);
        setProfileImage(data.shop.profile_image);
        setCoverImage(data.shop.cover_image);
      } else {
        setError(data.message || "Shop profile not found");
      }
    } catch (error) {
      console.error("Error fetching shop profile:", error);
      setError("Network request failed. Unable to load shop profile.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchShop();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchShop();
  };

  const onSave = () => {
    // TODO: save changes to backend/API
    setIsEditing(false);
  };

  const onCancel = () => {
    // reset or just close edit mode
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
                    <TouchableOpacity style={styles.uploadButton}>
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
                <TouchableOpacity style={styles.uploadButton}>
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

            <TouchableOpacity style={styles.saveButton} onPress={onSave}>
              <MaterialIcons name="save" size={16} color={colors.light} />
              <Text style={styles.saveButtonText}>Save Changes</Text>
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
