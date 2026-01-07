import React, { useMemo, useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
// import * as ImagePicker from "expo-image-picker";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuthStore } from "@/store/useAuthStore";
import { SELLER_REGISTER_API_URL } from "@/types/product";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function SellerRegistrationScreen() {
  const [shopName, setShopName] = useState("");
  const [shopSlogan, setShopSlogan] = useState("");
  const [shopDescription, setShopDescription] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [coverImage, setCoverImage] = useState(null);

  const { colors, theme } = useTheme();
  const styles = useMemo(() => appStyles(colors), [colors]);
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);

  // Calculate progress
  const totalFields = 3; // shopName, description, location (simulate with description for now)
  const filledFields =
    (shopName ? 1 : 0) + (shopDescription.length >= 50 ? 1 : 0);
  const progress = (filledFields / totalFields) * 100;

  //   const pickImage = async (setter) => {
  //     const result = await ImagePicker.launchImageLibraryAsync({
  //       mediaTypes: ImagePicker.MediaTypeOptions.Images,
  //       quality: 1,
  //     });

  //     if (!result.canceled) {
  //       setter(result.assets[0].uri);
  //     }
  //   };

  const handleSubmit = async () => {
    if (!user) return Alert.alert("Authentication", "Please log in to apply.");
    if (!shopName) return Alert.alert("Validation Error", "Shop Name is required!");
    if (shopDescription.length < 50)
      return Alert.alert(
        "Validation Error",
        "Shop Description must be at least 50 characters!"
      );

    try {
      setLoading(true);
      const response = await fetch(SELLER_REGISTER_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user._id,
          store_name: shopName,
          description: shopDescription,
          profile_image: profileImage || 'https://via.placeholder.com/200',
          slogan: shopSlogan,
          cover_image: coverImage || 'https://via.placeholder.com/1200x400',
          location: {
            lat: 0.3476, // TODO: Get actual location
            lng: 32.5825
          }
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        Alert.alert("Success", data.message || "Seller Application Submitted!");
        router.replace('/Seller/seller'); // Navigate to seller dashboard
      } else {
        Alert.alert("Error", data.message || "Failed to submit application");
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
      console.error("Seller registration error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={{ color: colors.text, fontSize: 18, justifyContent: 'center', textAlign: 'center' }}>
          <Text style={{ color: colors.primary }}>Enhance</Text> your online presence with <Text style={{ color: colors.primary }}>ShopCheap</Text>
        </Text>
        <Text style={{ color: colors.grayish, fontSize: 12, textAlign: 'center', marginTop: 10 }}>
          Join thousands of successful sellers on our platform.
          Complete the registration process to start selling your products to millions of customers worldwide.
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.card}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressText}>Registration Progress</Text>
          <Text style={{ color: colors.primary }}>{Math.floor(progress)}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      {/* Shop Information */}
      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="storefront" size={20} color={colors.primary} />
          <Text style={styles.sectionTitle}>Shop Information</Text>
        </View>

        <Text style={styles.label}>
          Shop Name <Text style={{ color: colors.primary }}>*</Text>
        </Text>
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
          placeholder="A catchy slogan for your shop"
          placeholderTextColor={colors.grayish}
          value={shopSlogan}
          onChangeText={setShopSlogan}
          cursorColor={colors.primary}
        />

        <Text style={styles.label}>
          Shop Description <Text style={{ color: colors.primary }}>*</Text>
        </Text>
        <TextInput
          style={styles.textArea}
          placeholder="Describe your shop, products, and what makes you unique"
          placeholderTextColor={colors.grayish}
          value={shopDescription}
          onChangeText={setShopDescription}
          multiline
          numberOfLines={16}
          cursorColor={colors.primary}
        />
        <View style={styles.charCount}>
          <Text style={{ color: "red" }}>Min 50 chars</Text>
          <Text style={{ color: colors.grayish }}>{shopDescription.length}/500</Text>
        </View>
      </View>

      {/* Shop Images */}
      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="image" size={20} color={colors.primary} />
          <Text style={styles.sectionTitle}>Shop Images</Text>
        </View>

        <Text style={styles.label}>Profile Picture</Text>
        <TouchableOpacity style={styles.imagePicker}
        // onPress={() => pickImage(setProfileImage)}
        >
          {profileImage ? (
            <Image source={{ uri: Array.isArray(profileImage) ? profileImage[0] : profileImage }} style={styles.imagePreview} />
          ) : (
            <>
              <MaterialIcons name="add-a-photo" size={30} color={colors.grayish} />
              <Text style={{ color: colors.primary, fontSize: 10 }}>Upload</Text>
            </>
          )}
        </TouchableOpacity>
        <Text style={styles.helperText}>Recommended: Square, 200x200px</Text>

        <Text style={styles.label}>Cover Photo</Text>
        <TouchableOpacity style={styles.coverPicker}
        // onPress={() => pickImage(setCoverImage)}
        >
          {coverImage ? (
            <Image source={{ uri: Array.isArray(coverImage) ? coverImage[0] : coverImage }} style={styles.coverPreview} />
          ) : (
            <>
              <MaterialIcons name="cloud-upload" size={30} color={colors.grayish} />
              <Text style={{ color: colors.primary, fontSize: 12 }}>Upload Cover Photo</Text>
            </>
          )}
        </TouchableOpacity>
        <Text style={styles.helperText}>Recommended: 1200x400px</Text>
      </View>

      {/* Submit Button */}
      <View style={{ marginTop: 10 }}>
        <TouchableOpacity
          style={[
            styles.submitBtn,
            { backgroundColor: progress >= 80 ? colors.primary : colors.grayish },
          ]}
          disabled={progress < 80}
          onPress={handleSubmit}
        >
          <MaterialIcons name="check-circle" size={20} color="white" />
          <Text style={styles.submitText}>Submit Seller Application</Text>
        </TouchableOpacity>
        <Text style={[styles.helperText, { textAlign: "center", marginTop: 5 }]}>
          Please complete at least 80% of the form to submit.
        </Text>
      </View>
    </ScrollView>
  );
}

const appStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
    backgroundColor: colors.background
  },
  header: {
    height: 'auto',
    alignItems: "center",
    paddingHorizontal: 8,
    backgroundColor: colors.card,
    padding: 8,
    borderRadius: 12
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center"
  },
  iconBtn: {
    marginHorizontal: 5,
    padding: 5
  },
  logo: {
    fontSize: 20,
    fontWeight: "bold",
  },
  cartBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "black",
    borderRadius: 8,
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold"
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: colors.grayish,
    backgroundColor: colors.card
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6
  },
  progressText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text
  },
  progressBar: {
    height: 8,
    borderRadius: 6,
    backgroundColor: colors.grayish,
    overflow: "hidden"
  },
  progressFill: {
    height: 8,
    borderRadius: 6,
    backgroundColor: colors.primary

  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8

  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 6,
    color: colors.text
  },
  label: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 4,
    color: colors.text
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
    borderColor: "#D1D5DB",
    backgroundColor: colors.background,
    color: colors.text
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
    minHeight: 80,
    borderColor: "#D1D5DB",
    backgroundColor: colors.background,
    color: colors.text
  },
  charCount: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 2
  },
  imagePicker: {
    width: 80,
    height: 80,
    borderWidth: 2,
    borderRadius: 50,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
    borderColor: "#D1D5DB",
    backgroundColor: colors.background,
  },
  coverPicker: {
    width: "100%",
    height: 140,
    borderWidth: 2,
    borderRadius: 12,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
    borderColor: "#D1D5DB",
    backgroundColor: colors.background,
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 50
  },
  coverPreview: {
    width: "100%",
    height: 140,
    borderRadius: 12
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  submitText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 6
  },
  helperText: {
    fontSize: 10,
    color: colors.grayish
  },
});
