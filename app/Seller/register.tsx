import { useTheme } from "@/contexts/ThemeContext";
import { useAuthStore } from "@/store/useAuthStore";
import { SELLER_REGISTER_API_URL } from "@/types/product";
import { showToast } from "@/utils/toast";
import { uploadImages } from "@/utils/upload";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { ActivityIndicator, Alert, Dimensions, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import MapView, { Marker } from "react-native-maps";

export default function SellerRegistrationScreen() {
  const [shopName, setShopName] = useState("");
  const [shopSlogan, setShopSlogan] = useState("");
  const [shopDescription, setShopDescription] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isMapModalVisible, setIsMapModalVisible] = useState(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: 0.3476,
    longitude: 32.5825,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const { colors, theme } = useTheme();
  const styles = useMemo(() => appStyles(colors), [colors]);
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState("");

  // Calculate progress
  const totalFields = 6; // shopName, slogan, description, profileImage, coverImage, location
  const filledFields =
    (shopName ? 1 : 0) +
    (shopSlogan ? 1 : 0) +
    (shopDescription.length >= 50 ? 1 : 0) +
    (profileImage ? 1 : 0) +
    (coverImage ? 1 : 0) +
    (location ? 1 : 0);
  const progress = (filledFields / totalFields) * 100;

  const pickImage = async (setter: (uri: string | null) => void, aspect: [number, number] = [1, 1]) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: aspect,
        quality: 0.2,
        base64: false,
      });

      if (!result.canceled) {
        setter(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
      console.error(error);
    }
  };

  const handleGetCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return Alert.alert("Permission Denied", "Permission to access location was denied");
      }

      const loc = await Location.getCurrentPositionAsync({});
      const newRegion = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setMapRegion(newRegion);
      setLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
    } catch (error) {
      Alert.alert("Error", "Failed to get current location");
      console.error(error);
    }
  };

  const handleMapPress = (e: any) => {
    const coords = e.nativeEvent.coordinate;
    setLocation({ lat: coords.latitude, lng: coords.longitude });
  };

  const handleSubmit = async () => {
    if (!user) return showToast("Please log in to apply.", "error");
    if (!shopName) return showToast("Shop Name is required!", "error");
    if (shopDescription.length < 50)
      return showToast(
        "Shop Description must be at least 50 characters!",
        "error"
      );
    if (!location) return showToast("Please select your shop location!", "error");

    try {
      setLoading(true);

      // Upload images if they are local URIs
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

      setLoadingStatus("Submitting application...");

      const response = await fetch(SELLER_REGISTER_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user._id,
          store_name: shopName,
          description: shopDescription,
          profile_image: finalProfileImage || 'https://via.placeholder.com/200',
          slogan: shopSlogan,
          cover_image: finalCoverImage || 'https://via.placeholder.com/1200x400',
          location: {
            lat: location.lat,
            lng: location.lng
          }
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showToast(data.message || "Seller Application Submitted!", "success");
        router.replace('/(tabs)/account'); // Navigate to seller dashboard
      } else {
        showToast(data.message || "Failed to submit application", "error");
      }
    } catch (error) {
      showToast("An unexpected error occurred. Please try again.", "error");
      console.error("Seller registration error:", error);
    } finally {
      setLoading(false);
      setLoadingStatus("");
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
          maxLength={500}
          textAlignVertical="top"
          numberOfLines={16}
          cursorColor={colors.primary}
        />
        <View style={styles.charCount}>
          <Text style={{ color: shopDescription.length >= 50 ? "#22C55E" : "red" }}>
            {shopDescription.length >= 50 ? "Length Reached" : "Min 50 chars"}
          </Text>
          <Text style={{ color: colors.grayish }}>{shopDescription.length}/500</Text>
        </View>
      </View>

      {/* Shop Location */}
      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="location-on" size={20} color={colors.primary} />
          <Text style={styles.sectionTitle}>Shop Location <Text style={{ color: colors.primary }}>*</Text></Text>
        </View>

        <TouchableOpacity
          style={styles.locationContainer}
          onPress={() => setIsMapModalVisible(true)}
        >
          {location ? (
            <View>
              <Text style={{ color: colors.text, fontSize: 14 }}>
                Latitude: {location.lat.toFixed(6)}
              </Text>
              <Text style={{ color: colors.text, fontSize: 14 }}>
                Longitude: {location.lng.toFixed(6)}
              </Text>
              <Text style={{ color: colors.primary, fontSize: 12, marginTop: 4 }}>
                Tap to change location
              </Text>
            </View>
          ) : (
            <View style={{ alignItems: 'center' }}>
              <MaterialIcons name="map" size={30} color={colors.grayish} />
              <Text style={{ color: colors.primary, fontSize: 12 }}>Select Shop Location on Map</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <Modal
        visible={isMapModalVisible}
        animationType="slide"
        transparent={false}
      >
        <View style={{ flex: 1 }}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setIsMapModalVisible(false)}>
              <MaterialIcons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Location</Text>
            <TouchableOpacity onPress={() => setIsMapModalVisible(false)}>
              <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Done</Text>
            </TouchableOpacity>
          </View>

          <View style={{
            height: Dimensions.get('window').height - 150,
            width: '100%',
            backgroundColor: '#f0f0f0',
            overflow: 'hidden'
          }}>
            <MapView
              style={StyleSheet.absoluteFillObject}
              initialRegion={mapRegion}
              onPress={handleMapPress}
              showsUserLocation={true}
              showsMyLocationButton={true}
            >
              {location && (
                <Marker
                  coordinate={{
                    latitude: location.lat,
                    longitude: location.lng
                  }}
                  draggable
                  onDragEnd={(e) => setLocation({ lat: e.nativeEvent.coordinate.latitude, lng: e.nativeEvent.coordinate.longitude })}
                />
              )}
            </MapView>
          </View>

          <View style={styles.mapControls}>
            <TouchableOpacity
              style={styles.currentLocBtn}
              onPress={handleGetCurrentLocation}
            >
              <MaterialIcons name="my-location" size={24} color="white" />
              <Text style={{ color: 'white', marginLeft: 8 }}>Use Current Location</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 10, color: colors.grayish, textAlign: 'center', marginTop: 8 }}>
              Tap on the map to place a marker or drag the marker to adjust
            </Text>
          </View>
        </View>
      </Modal>

      {/* Shop Images */}
      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="image" size={20} color={colors.primary} />
          <Text style={styles.sectionTitle}>Shop Images</Text>
        </View>

        <Text style={styles.label}>Profile Picture</Text>
        <TouchableOpacity style={styles.imagePicker}
          onPress={() => pickImage(setProfileImage)}
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
          onPress={() => pickImage(setCoverImage, [3, 1])}
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
            { backgroundColor: (shopName && shopDescription.length >= 50 && location) ? colors.primary : colors.grayish },
          ]}
          disabled={!shopName || shopDescription.length < 50 || !location || loading}
          onPress={handleSubmit}
        >
          {loading ? (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <ActivityIndicator color="white" size="small" />
              <Text style={[styles.submitText, { fontSize: 14 }]}>{loadingStatus}</Text>
            </View>
          ) : (
            <>
              <MaterialIcons name="check-circle" size={20} color="white" />
              <Text style={styles.submitText}>Submit Seller Application</Text>
            </>
          )}
        </TouchableOpacity>
        <Text style={[styles.helperText, { textAlign: "center", marginTop: 5 }]}>
          Please complete the required fields (*) to submit.
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
  locationContainer: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#D1D5DB",
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    minHeight: 80
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 50,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.grayish
  },
  mapControls: {
    position: 'absolute',
    bottom: 40,
    left: 16,
    right: 16,
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  currentLocBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 10
  }
});
