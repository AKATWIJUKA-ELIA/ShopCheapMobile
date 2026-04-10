import ErrorView from "@/components/ui/ErrorView";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuthStore } from "@/store/useAuthStore";
import { GET_SHOPS_API_URL, UPDATE_SHOP_API_URL } from "@/types/product";
import { showToast } from "@/utils/toast";
import { uploadImages } from "@/utils/upload";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ShopProfileScreen() {
  const [isEditing, setIsEditing] = useState(false);
  const { colors, theme, toggleTheme } = useTheme();
  const styles = useMemo(() => appStyles(colors), [colors]);
  const { user } = useAuthStore();

  const [shopName, setShopName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [coverImage, setCoverImage] = useState("");
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

      console.log(
        `[ShopFetch] Fetching all shops to find match for owner: ${user._id}`,
      );

      const res = await fetch(GET_SHOPS_API_URL);
      if (!res.ok) throw new Error("Failed to fetch shops list");

      const allShops = await res.json();
      const shopData = allShops.find((s: any) => s.owner_id === user._id);

      if (shopData) {
        setShopName(shopData.shop_name);
        setTagline(shopData.slogan);
        setDescription(shopData.description);
        setProfileImage(shopData.profile_image);
        setCoverImage(shopData.cover_image);
        setOriginalShopData(shopData);
        console.log(`[ShopFetch] Shop profile found and loaded`);
      } else {
        setError(
          "Shop profile not found for your account. Please ensure you are registered as a seller.",
        );
      }
    } catch (error: any) {
      console.error("Error fetching shop profile:", error);
      setError(error.message || "Network Error. Unable to load shop profile.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const pickImage = async (
    setter: (uri: string) => void,
    aspect: [number, number] = [1, 1],
  ) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
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
      if (
        profileImage &&
        (profileImage.startsWith("file://") ||
          profileImage.startsWith("content://"))
      ) {
        const ids = await uploadImages([profileImage]);
        if (ids.length > 0) finalProfileImage = ids[0];
      }

      // Handle cover image upload if changed
      if (
        coverImage &&
        (coverImage.startsWith("file://") ||
          coverImage.startsWith("content://"))
      ) {
        const ids = await uploadImages([coverImage]);
        if (ids.length > 0) finalCoverImage = ids[0];
      }

      setLoadingStatus("Saving changes...");

      const payload = {
        shopId: originalShopData._id,
        shop_name: shopName,
        description: description,
        slogan: tagline,
        profile_image: finalProfileImage,
        cover_image: finalCoverImage,
      };

      console.log(
        "[ShopUpdate] Sending payload:",
        JSON.stringify(payload, null, 2),
      );

      const response = await fetch(UPDATE_SHOP_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let result;
      const responseText = await response.text();

      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error(
          `[ShopUpdate] Failed to parse JSON. Status: ${response.status}, Response: ${responseText}`,
        );
        throw new Error(
          `Server returned invalid response (${response.status}). Please check logs.`,
        );
      }

      if (response.ok && result.success) {
        showToast("Shop profile updated successfully", "success");
        setIsEditing(false);
        fetchShop(); // Refresh data
      } else {
        const errorMsg = result.message || "Failed to update shop";
        console.error("[ShopUpdate] Server error:", errorMsg);
        showToast(errorMsg, "error");
      }
    } catch (error: any) {
      console.error("Error saving shop profile:", error);
      showToast(error.message || "An error occurred while saving", "error");
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
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
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
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Profile Header */}
        <View style={styles.headerContainer}>
          {/* Banner */}
          <TouchableOpacity
            activeOpacity={isEditing ? 0.7 : 1}
            onPress={() => isEditing && pickImage(setCoverImage, [3, 1])}
          >
            {coverImage ? (
              <Image
                source={{
                  uri: Array.isArray(coverImage) ? coverImage[0] : coverImage,
                }}
                style={styles.bannerHeader}
              />
            ) : (
              <View style={[styles.bannerHeader, styles.bannerPlaceholder]}>
                <MaterialIcons
                  name="add-photo-alternate"
                  size={40}
                  color={colors.grayish}
                />
                {isEditing && (
                  <Text style={styles.uploadTextSmall}>Tap to add banner</Text>
                )}
              </View>
            )}
            {isEditing && (
              <View style={styles.bannerEditIcon}>
                <MaterialIcons name="camera-alt" size={20} color="white" />
              </View>
            )}
          </TouchableOpacity>

          {/* Logo Overlap */}
          <View style={styles.logoOverlapContainer}>
            <TouchableOpacity
              activeOpacity={isEditing ? 0.7 : 1}
              onPress={() => isEditing && pickImage(setProfileImage)}
              style={styles.logoWrapper}
            >
              {profileImage ? (
                <Image
                  source={{
                    uri: Array.isArray(profileImage)
                      ? profileImage[0]
                      : profileImage,
                  }}
                  style={styles.logoOverlap}
                />
              ) : (
                <View style={[styles.logoOverlap, styles.logoPlaceholder]}>
                  <MaterialIcons
                    name="storefront"
                    size={40}
                    color={colors.grayish}
                  />
                </View>
              )}
              {isEditing && (
                <View style={styles.logoEditIcon}>
                  <MaterialIcons name="camera-alt" size={16} color="white" />
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.headerInfo}>
              <Text style={styles.headerShopName} numberOfLines={1}>
                {shopName || "Your Shop"}
              </Text>
              <Text style={styles.headerTagline} numberOfLines={1}>
                {tagline || "Shop tagline goes here"}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.editCircle,
                isEditing && { backgroundColor: colors.grayish },
              ]}
              onPress={() => (isEditing ? onCancel() : setIsEditing(true))}
            >
              <MaterialIcons
                name={isEditing ? "close" : "edit"}
                size={20}
                color="white"
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ padding: 16 }}>
          {/* Shop Information Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderTitle}>
                <MaterialIcons
                  name="info-outline"
                  size={18}
                  color={colors.primary}
                />
                <Text style={styles.sectionTitleText}>Shop Details</Text>
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
                    placeholder="Enter shop name"
                    cursorColor={colors.primary}
                  />
                ) : (
                  <View style={styles.readOnlyContainer}>
                    <Text style={styles.readOnlyText}>
                      {shopName || "Not set"}
                    </Text>
                  </View>
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
                    placeholder="Enter shop tagline"
                    cursorColor={colors.primary}
                  />
                ) : (
                  <View style={styles.readOnlyContainer}>
                    <Text style={styles.readOnlyText}>
                      {tagline || "No tagline"}
                    </Text>
                  </View>
                )}
              </View>

              {/* Description */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Description</Text>
                {isEditing ? (
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    placeholder="Enter shop description"
                    cursorColor={colors.primary}
                  />
                ) : (
                  <View style={styles.readOnlyContainer}>
                    <Text style={styles.descriptionText}>
                      {description || "No description provided."}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        {isEditing && (
          <View style={styles.bottomActions}>
            <TouchableOpacity
              style={styles.saveAction}
              onPress={onSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <MaterialIcons name="check" size={20} color="white" />
                  <Text style={styles.saveActionText}>Save Changes</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Theme Button */}
      {!isEditing && (
        <TouchableOpacity style={styles.themeButton} onPress={toggleTheme}>
          <Ionicons
            name={theme === "dark" ? "sunny" : "moon"}
            size={24}
            color="white"
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const appStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    headerContainer: {
      backgroundColor: colors.card,
      paddingBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.lightgray,
    },
    bannerHeader: {
      width: "100%",
      height: 180,
    },
    bannerPlaceholder: {
      backgroundColor: colors.lightgray,
      justifyContent: "center",
      alignItems: "center",
    },
    bannerEditIcon: {
      position: "absolute",
      top: 10,
      right: 10,
      backgroundColor: "rgba(0,0,0,0.5)",
      padding: 8,
      borderRadius: 20,
    },
    logoOverlapContainer: {
      flexDirection: "row",
      alignItems: "flex-end",
      paddingHorizontal: 16,
      marginTop: -40,
      gap: 12,
    },
    logoWrapper: {
      borderRadius: 60,
      padding: 3,
      backgroundColor: colors.background,
      elevation: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },
    logoOverlap: {
      width: 100,
      height: 100,
      borderRadius: 50,
    },
    logoPlaceholder: {
      backgroundColor: colors.lightgray,
      justifyContent: "center",
      alignItems: "center",
    },
    logoEditIcon: {
      position: "absolute",
      bottom: 5,
      right: 5,
      backgroundColor: colors.primary,
      padding: 6,
      borderRadius: 15,
      borderWidth: 2,
      borderColor: colors.background,
    },
    headerInfo: {
      flex: 1,
      paddingBottom: 5,
    },
    headerShopName: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.text,
    },
    headerTagline: {
      fontSize: 12,
      color: colors.grayish,
      marginTop: 2,
    },
    editCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 5,
      elevation: 2,
    },
    section: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.lightgray,
    },
    sectionHeader: {
      marginBottom: 16,
    },
    sectionHeaderTitle: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    sectionTitleText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
    },
    sectionContent: {
      marginTop: 8,
    },
    inputGroup: {
      marginBottom: 16,
    },
    label: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.grayish,
      marginBottom: 8,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    input: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.lightgray,
      borderRadius: 12,
      padding: 12,
      color: colors.text,
      fontSize: 15,
    },
    textArea: {
      height: 120,
      textAlignVertical: "top",
    },
    uploadTextSmall: {
      fontSize: 10,
      color: colors.grayish,
      marginTop: 4,
    },
    readOnlyContainer: {
      backgroundColor: colors.background,
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: "transparent",
    },
    readOnlyText: {
      fontSize: 15,
      color: colors.text,
      fontWeight: "500",
    },
    descriptionText: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
    },
    bottomActions: {
      paddingHorizontal: 16,
      paddingBottom: 40,
    },
    saveAction: {
      backgroundColor: colors.primary,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
      borderRadius: 16,
      gap: 10,
      elevation: 4,
    },
    saveActionText: {
      color: "white",
      fontSize: 16,
      fontWeight: "700",
    },
    themeButton: {
      position: "absolute",
      bottom: 30,
      right: 16,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
      elevation: 5,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    },
  });
