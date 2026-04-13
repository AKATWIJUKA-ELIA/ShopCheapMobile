import React, { useMemo, useState } from "react";
import {View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, FlatList, Alert} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Colors } from "@/constants/Colors";
import { BlurView } from "@react-native-community/blur";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/contexts/ThemeContext";

const REGIONS = {
  Central: ["Kampala", "Entebbe", "Mukono", "Wakiso", "Gayaza"],
  Eastern: ["Mbale", "Jinja", "Tororo", "Soroti"],
  Northern: ["Gulu", "Lira", "Arua", "Kitgum"],
  Western: ["Mbarara", "Fort Portal", "Kabale", "Hoima"],
};

export default function AddressScreen() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);

  const {colors} = useTheme();
  const styles = useMemo(() => appStyles(colors), [colors]);

  // Form state
  const [modalVisible, setModalVisible] = useState(false);
  const [region, setRegion] = useState("");
  const [town, setTown] = useState("");
  const [specificAddress, setSpecificAddress] = useState("");

  const handleSaveAddress = () => {
    if (region && town && specificAddress) {
      setAddresses((prev) => [
        ...prev,
        {
          id: Date.now(),
          region,
          town,
          specificAddress,
          isDefault: addresses.length === 0, // first address auto-default
        },
      ]);
      resetForm();
      setModalVisible(false);
    }
  };

  const resetForm = () => {
    setRegion("");
    setTown("");
    setSpecificAddress("");
  };

  const setDefaultAddress = (id: number) => {
    setAddresses((prev) =>
      prev.map((addr) => ({ ...addr, isDefault: addr.id === id }))
    );
    setSelectedAddress(id);
  };

  const renderAddressItem = ({ item }: any) => (
    <TouchableOpacity activeOpacity={0.7}
      style={[styles.addressCard, item.isDefault && styles.defaultCard, {
        flexDirection:'row',
        justifyContent:'space-between'
      }]}
      onPress={() => setDefaultAddress(item.id)}
      onLongPress={() => {
         Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Alert.alert(
          "Delete Address",
          "Are you sure you want to delete this address?",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Delete",
              style: "destructive",
              onPress: () => {
                setAddresses((prev) => prev.filter((addr) => addr.id !== item.id));
              },
            },
          ]
        );
      }}
      delayLongPress={300} // optional: shorter delay for better UX
    >
      <View>
        <Text style={styles.addressText}>
          {item.region} - {item.town}
        </Text>
        <Text style={styles.addressText}>{item.specificAddress}</Text>
        {item.isDefault && <Text style={styles.defaultTag}>Default</Text>}
      </View>
      {item.isDefault &&<Ionicons name="location-sharp" size={50} color={colors.primary}/>}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Addresses</Text>

      <FlatList
        data={addresses}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderAddressItem}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No addresses added yet.</Text>
        }
      />

      {/* Add Address Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addButtonText}>+ Add Address</Text>
      </TouchableOpacity>

      {/* Modal for adding new address */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <BlurView style={styles.modalOverlay}
          blurAmount={7}
          blurType="light"
        >
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Add New Address</Text>

            {/* Region Picker */}
            <Text style={styles.label}>Region</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={region}
                onValueChange={(value) => {
                  setRegion(value);
                  setTown(""); // reset town when region changes
                }}
                style={{color:colors.light}}
              >
                <Picker.Item label="Select Region" value=""/>
                {Object.keys(REGIONS).map((reg) => (
                  <Picker.Item key={reg} label={reg} value={reg}/>
                ))}
              </Picker>
            </View>

            {/* Town Picker */}
            <Text style={styles.label}>Town</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={town}
                onValueChange={(value) => setTown(value)}
                enabled={!!region}
                style={{color:colors.light}}
              >
                <Picker.Item
                  label={region ? "Select Town" : "Select Region First"}
                  value=""
                />
                {region &&
                  REGIONS[region].map((townName) => (
                    <Picker.Item key={townName} label={townName} value={townName} />
                  ))}
              </Picker>
            </View>

            {/* Specific Address */}
            <Text style={styles.label}>Specific Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Street, house number..."
              placeholderTextColor={colors.grayish}
              value={specificAddress}
              onChangeText={setSpecificAddress}
            />

            {/* Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveAddress}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </Modal>
    </View>
  );
}

const appStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
    color: colors.text,
  },
  emptyText: {
    textAlign: "center",
    color: colors.grayish,
    marginVertical: 20,
  },
  addressCard: {
    backgroundColor: colors.gray,
    padding: 14,
    marginVertical: 6,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  defaultCard: {
    borderColor: colors.primary,
    borderWidth: 1,
  },
  addressText: {
    fontSize: 16,
    color: colors.light,
  },
  defaultTag: {
    marginTop: 4,
    fontSize: 12,
    color: colors.primary,
    fontWeight: "600",
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 99,
    alignItems: "center",
    marginTop: 12,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 16,
  },
  modalContainer: {
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
    color: colors.text,
  },
  label: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "500",
  },
  pickerContainer: {
    backgroundColor: colors.gray,
    borderRadius: 16,
    marginVertical: 6,
  },
  input: {
    backgroundColor: colors.gray,
    borderRadius: 10,
    padding: 10,
    marginVertical: 6,
    color: colors.light,
    fontSize:14,
    height:45
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
  },
  cancelButton: {
    marginRight: 10,
    padding: 10,
  },
  cancelText: {
    color: colors.text,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 99,
  },
  saveText: {
    color: "white",
    fontWeight: "bold",
  },
});
