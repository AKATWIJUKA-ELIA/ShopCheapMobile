import { useTheme } from '@/contexts/ThemeContext';
import { useAuthStore } from '@/store/useAuthStore';
import { CREATE_PRODUCT_API_URL } from '@/types/product';
import { showToast } from '@/utils/toast';
import { uploadImages } from '@/utils/upload';
import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// const COLORS = {
//   primary: '#f97316',
//   backgroundLight: '#f8f9fa',
//   backgroundDark: '#120f0d',
//   cardLight: '#ffffff',
//   cardDark: '#1c1917',
//   inputLight: '#f3f4f6',
//   inputDark: '#1c1917',
//   borderLight: '#e5e7eb',
//   borderDark: '#292524',
//   textMainLight: '#1f2937',
//   textMainDark: '#f3f4f6',
//   textSubLight: '#6b7280',
//   textSubDark: '#9ca3af',
//   danger: '#ef4444',
// };

export default function AddProductScreen() {
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('');
  const [discount, setDiscount] = useState('');
  const [price, setPrice] = useState('');

  const router = useRouter();
  const { colors, toggleTheme } = useTheme();
  const styles = useMemo(() => appStyles(colors), [colors]);
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState("");
  const [images, setImages] = useState<string[]>([]);

  const pickImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit: 5 - images.length,
        quality: 0.3,
      });

      if (!result.canceled) {
        const newImages = result.assets.map(asset => asset.uri);
        setImages(prev => [...prev, ...newImages].slice(0, 5));
      }
    } catch (error) {
      showToast("Failed to pick images", "error");
      console.error(error);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.background }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={28} color={colors.grayish} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>
          Add <Text style={{ color: colors.primary }}>Product</Text>
        </Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Main Form */}
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Title */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
          <View style={[styles.iconContainer, { backgroundColor: colors.card, borderColor: colors.lightgray }]}>
            <MaterialIcons name="inventory-2" size={28} color={colors.grayish} />
          </View>
          <View style={{ marginLeft: 12, justifyContent: 'center', alignItems: 'center' }}>

            <Text style={[styles.subtitle, { color: colors.grayish }]}>
              Fill in the details to list your product
            </Text>
          </View>
        </View>

        {/* Form Fields */}
        <View style={{ marginBottom: 16 }}>
          <Text style={[styles.label, { color: colors.text }]}>
            Product Name <Text style={{ color: colors.primary }}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, borderColor: colors.lightgray, color: colors.text }]}
            placeholder="Enter product name"
            placeholderTextColor={colors.grayish}
            value={productName}
            onChangeText={setProductName}
            cursorColor={colors.primary}
          />
        </View>

        <View style={{ marginBottom: 16 }}>
          <Text style={[styles.label, { color: colors.text }]}>
            Description <Text style={{ color: colors.primary }}>*</Text>
          </Text>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              { backgroundColor: colors.card, borderColor: colors.lightgray, color: colors.text },
            ]}
            placeholder="Describe your product in detail..."
            placeholderTextColor={colors.grayish}
            multiline
            value={description}
            onChangeText={setDescription}
            cursorColor={colors.primary}
          />
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={[styles.label, { color: colors.text }]}>
              Category <Text style={{ color: colors.primary }}>*</Text>
            </Text>
            <View style={[styles.selectContainer, { borderColor: colors.lightgray, backgroundColor: colors.card }]}>
              <Picker
                selectedValue={category}
                onValueChange={(itemValue) => setCategory(itemValue)}
                style={{ color: colors.text }}
              >
                <Picker.Item label="Select" value="" />
                <Picker.Item label="Phones" value="Phones" />
                <Picker.Item label="Gadgets" value="Gadgets" />
                <Picker.Item label="Shoes" value="Shoes" />
                <Picker.Item label="Electronics" value="Electronics" />
                <Picker.Item label="Clothing" value="Clothing" />
                <Picker.Item label="Watches" value="Watches" />
                <Picker.Item label="Furniture" value="Furniture" />
                <Picker.Item label="Automotive" value="Automotive" />
              </Picker>
            </View>
          </View>

          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={[styles.label, { color: colors.text }]}>
              Condition <Text style={{ color: colors.primary }}>*</Text>
            </Text>
            <View style={[styles.selectContainer, { borderColor: colors.lightgray, backgroundColor: colors.card }]}>
              <Picker
                selectedValue={condition}
                onValueChange={(itemValue) => setCondition(itemValue)}
                style={{ color: colors.text }}
              >
                <Picker.Item label="Select" value="" />
                <Picker.Item label="New" value="new" />
                <Picker.Item label="Used" value="used" />
              </Picker>
            </View>
          </View>
        </View>

        {/* Discount */}
        <View style={{ marginBottom: 16 }}>
          <Text style={[styles.label, { color: colors.text }]}>Discount %</Text>
          <View style={[styles.discountInputContainer, { borderColor: colors.lightgray, backgroundColor: colors.card }]}>
            <TextInput
              style={[styles.discountInput, { color: colors.text }]}
              placeholder="0"
              placeholderTextColor={colors.grayish}
              keyboardType="numeric"
              value={discount}
              onChangeText={setDiscount}
              cursorColor={colors.primary}
            />
            <Text style={{ color: colors.text, fontWeight: '500' }}>%</Text>
          </View>
        </View>

        {/* Price */}
        <View style={{ marginBottom: 16 }}>
          <Text style={[styles.label, { color: colors.text }]}>
            Price <Text style={{ color: colors.primary }}>*</Text>
          </Text>
          <View style={[styles.priceInputContainer, { borderColor: colors.lightgray, backgroundColor: colors.card }]}>
            <Text style={{ color: colors.text, fontWeight: '500', marginLeft: 8 }}>$</Text>
            <TextInput
              style={[styles.priceInput, { color: colors.text }]}
              placeholder="0.00"
              placeholderTextColor={colors.grayish}
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
              cursorColor={colors.primary}
            />
          </View>
        </View>

        {/* Images */}
        <View style={{ marginBottom: 32 }}>
          <Text style={[styles.label, { color: colors.text }]}>
            Product Images <Text style={{ color: colors.primary }}>*</Text>
          </Text>
          <Text style={[styles.smallText, { color: colors.grayish }]}>
            Upload up to 5 images. First image will be the cover.
          </Text>

          <TouchableOpacity
            style={[
              styles.imageDropZone,
              { backgroundColor: colors.card, borderColor: colors.lightgray },
            ]}
            onPress={pickImages}
            disabled={images.length >= 5}
          >
            <View style={styles.imageIcon}>
              <MaterialIcons name="add-photo-alternate" size={28} color={colors.gray} />
            </View>
            <Text style={[styles.label, { color: colors.grayish }]}>
              {images.length >= 5 ? "Maximum 5 images reached" : "Tap to upload images"}
            </Text>
            <Text style={[styles.smallText, { color: colors.grayish }]}>PNG, JPG, GIF up to 3 MB each</Text>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', marginTop: 12, flexWrap: 'wrap', gap: 8 }}>
            {images.map((uri, i) => (
              <View
                key={i}
                style={[
                  { width: '18%', aspectRatio: 1 },
                  { borderRadius: 12, backgroundColor: colors.gray, borderWidth: 1, borderColor: colors.lightgray, overflow: 'hidden' },
                ]}
              >
                <Image source={{ uri }} style={{ width: '100%', height: '100%' }} />
                <TouchableOpacity
                  onPress={() => removeImage(i)}
                  style={{ position: 'absolute', top: 2, right: 2, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 10 }}
                >
                  <MaterialIcons name="close" size={16} color="white" />
                </TouchableOpacity>
              </View>
            ))}
            {Array(Math.max(0, 5 - images.length)).fill(0).map((_, i) => (
              <View
                key={`empty-${i}`}
                style={[
                  { width: '18%', aspectRatio: 1 },
                  { borderRadius: 12, backgroundColor: colors.gray, borderWidth: 1, borderColor: colors.lightgray, borderStyle: 'dashed' },
                ]}
              />
            ))}
          </View>

          {/* Post Button */}
          <TouchableOpacity
            style={[styles.postButton, { opacity: loading ? 0.7 : 1 }]}
            onPress={async () => {
              if (!user) return showToast("Please log in to add products.", "error");
              if (!productName || !price || !category || !condition) {
                return showToast("Please fill in all required fields.", "error");
              }

              try {
                setLoading(true);

                // Upload images first
                let finalImages = ["https://via.placeholder.com/320"];
                if (images.length > 0) {
                  setLoadingStatus(`Uploading ${images.length} image(s)...`);
                  finalImages = await uploadImages(images);
                }

                setLoadingStatus("Saving product...");

                const response = await fetch(CREATE_PRODUCT_API_URL, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    products: {
                      product_name: productName,
                      product_price: price,
                      product_description: description,
                      product_category: category,
                      product_condition: condition,
                      product_image: finalImages,
                      product_owner_id: user._id,
                      approved: false, // Default to unapproved
                      product_discount: parseFloat(discount) || 0,
                    }
                  }),
                });

                const data = await response.json();

                if (response.ok && data.success) {
                  showToast("Product listed successfully! It will be visible after approval.", "success");
                  router.back();
                } else {
                  showToast(data.message || "Failed to add product", "error");
                }
              } catch (error) {
                showToast("An unexpected error occurred.", "error");
                console.error(error);
              } finally {
                setLoading(false);
                setLoadingStatus("");
              }
            }}
            disabled={loading}
          >
            <Text style={styles.postButtonText}>
              {loading ? (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <ActivityIndicator color="white" size="small" />
                  <Text style={[styles.postButtonText, { marginLeft: 10, fontSize: 14 }]}>{loadingStatus}</Text>
                </View>
              ) : "Post Product"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>


    </View>
  );
}

const appStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1 },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600'
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4
  },
  title: {
    fontSize: 20,
    fontWeight: '700'
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4
  },
  input: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 12,
    fontSize: 14
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top'
  },
  selectContainer: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden'
  },
  discountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    justifyContent: 'space-between'
  },
  discountInput: {
    flex: 1,
    height: '100%',
    fontSize: 14
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    height: 48
  },
  priceInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    paddingHorizontal: 8
  },
  imageDropZone: {
    borderWidth: 2,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12
  },
  imageIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12
  },
  smallText: {
    fontSize: 12
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1
  },
  postButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 12
  },
  postButtonText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 16
  },
  darkModeButton: {
    position: 'absolute',
    bottom: 96,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1
  },
});
