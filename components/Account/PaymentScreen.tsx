import React, { useMemo, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, FlatList } from "react-native";
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { Picker } from "@react-native-picker/picker";
import { router, Stack } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";

interface Payment {
  method: string;
  card?: { number: string; expiry: string; cvv: string };
  mobile?: { phone: string; provider: string };
  crypto?: { coin: string; wallet: string };
}

const PaymentScreen = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string>("card");
  const [cardDetails, setCardDetails] = useState({ number: "", expiry: "", cvv: "" });
  const [mobileMoney, setMobileMoney] = useState({ phone: "", provider: "" });
  const [cryptoCoin, setCryptoCoin] = useState<string>("bitcoin");
  const [cryptoDetails, setCryptoDetails] = useState({ wallet: "" });
  const [savedPayments, setSavedPayments] = useState<Payment[]>([]);

  const { colors } = useTheme();
  const styles = useMemo(() => appStyles(colors), [colors]);

  const handleSavePayment = () => {
    const newPayment: Payment = { method: selectedMethod };
    if (selectedMethod === "card") newPayment.card = { ...cardDetails };
    if (selectedMethod === "mobile") newPayment.mobile = { ...mobileMoney };
    if (selectedMethod === "crypto") newPayment.crypto = { coin: cryptoCoin, wallet: cryptoDetails.wallet };

    setSavedPayments((prev) => [...prev, newPayment]);

    // Clear inputs and hide form
    setCardDetails({ number: "", expiry: "", cvv: "" });
    setMobileMoney({ phone: "", provider: "" });
    setCryptoDetails({ wallet: "" });
    setShowForm(false);
  };

  const PaymentOption = ({ method, label, icon }: { method: string; label: string; icon: any }) => (
    <TouchableOpacity
      style={[styles.option, selectedMethod === method && styles.optionSelected]}
      activeOpacity={0.8}
      onPress={() => setSelectedMethod(method)}
    >
      <View style={styles.optionLeft}>
        {icon}
        <Text style={[styles.optionLabel, selectedMethod === method && { color: colors.primary }]}>{label}</Text>
      </View>
      {selectedMethod === method && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
    </TouchableOpacity>
  );

  const renderSavedPayment = ({ item, index }: { item: Payment; index: number }) => (
    <View style={[styles.savedCard, { backgroundColor: colors.gray }]}>
      <Text style={{ color: colors.text, fontWeight: "bold" }}>{index + 1}. {item.method.toUpperCase()}</Text>
      {item.card && (
        <Text style={{ color: colors.text }}>Card: {item.card.number} | Exp: {item.card.expiry} | CVV: {item.card.cvv}</Text>
      )}
      {item.mobile && (
        <Text style={{ color: colors.text }}>Mobile: {item.mobile.phone} | Provider: {item.mobile.provider}</Text>
      )}
      {item.crypto && (
        <Text style={{ color: colors.text }}>Crypto: {item.crypto.coin} | Wallet: {item.crypto.wallet}</Text>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={styles.header}>Payment Methods</Text>
          <TouchableOpacity onPress={() => router.back()} style={{ position: 'absolute', right: 0, top: 3, backgroundColor: colors.background }}>
            <Text style={{ color: 'red', fontSize: 15 }}>Close</Text>
          </TouchableOpacity>
        </View>

        {/* Add Payment Button */}
        {!showForm && (
          <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.primary }]} onPress={() => setShowForm(true)}>
            <Text style={styles.saveButtonText}>Add Payment Method</Text>
          </TouchableOpacity>
        )}

        {/* Form */}
        {showForm && (
          <>
            <View style={styles.card}>
              <PaymentOption method="card" label="Credit Card" icon={<Ionicons name="card" size={24} color={selectedMethod === "card" ? colors.primary : colors.light} />} />
              <PaymentOption method="cod" label="Cash on Delivery" icon={<FontAwesome5 name="money-bill-wave" size={20} color={selectedMethod === "cod" ? colors.primary : colors.light} />} />
              <PaymentOption method="crypto" label="Crypto" icon={<MaterialCommunityIcons name="bitcoin" size={24} color={selectedMethod === "crypto" ? colors.primary : colors.light} />} />
              <PaymentOption method="mobile" label="Mobile Money" icon={<MaterialCommunityIcons name="cellphone" size={24} color={selectedMethod === "mobile" ? colors.primary : colors.light} />} />
            </View>

            {selectedMethod === "card" && (
              <View style={styles.inputSection}>
                <TextInput style={styles.input} placeholder="1234-5678-9012-3456" placeholderTextColor={colors.grayish} keyboardType="numeric" value={cardDetails.number} maxLength={16} onChangeText={(text) => setCardDetails({ ...cardDetails, number: text })} />
                <View style={styles.row}>
                  <TextInput style={[styles.input, { flex: 1, marginRight: 8 }]} placeholder="MM/YY" placeholderTextColor={colors.grayish} keyboardType="numeric" value={cardDetails.expiry} maxLength={4} onChangeText={(text) => setCardDetails({ ...cardDetails, expiry: text })} />
                  <TextInput style={[styles.input, { flex: 1 }]} placeholder="CVV" placeholderTextColor={colors.grayish} keyboardType="numeric" secureTextEntry value={cardDetails.cvv} maxLength={3} onChangeText={(text) => setCardDetails({ ...cardDetails, cvv: text })} />
                </View>
              </View>
            )}

            {selectedMethod === "mobile" && (
              <View style={styles.inputSection}>
                <View style={styles.pickerContainer}>
                  <Picker selectedValue={mobileMoney.provider} dropdownIconColor={colors.light} onValueChange={(itemValue) => setMobileMoney({ ...mobileMoney, provider: itemValue })} style={{
                    color: colors.light, 
                    width: '100%'
                  }}>
                    <Picker.Item label="MTN" value="MTN" />
                    <Picker.Item label="Airtel" value="Airtel" />
                  </Picker>
                </View>
                <TextInput style={styles.input} placeholder="Mobile Number" placeholderTextColor={colors.grayish} keyboardType="phone-pad" value={mobileMoney.phone} maxLength={10} onChangeText={(text) => setMobileMoney({ ...mobileMoney, phone: text })} />
              </View>
            )}

            {selectedMethod === "crypto" && (
              <View style={styles.inputSection}>
                <Text style={styles.label}>Select Cryptocurrency</Text>
                <View style={styles.pickerWrapper}>
                  <Picker selectedValue={cryptoCoin} onValueChange={(value) => setCryptoCoin(value)} style={{ color: colors.light, width: '100%' }}>
                    <Picker.Item label="Bitcoin (BTC)" value="bitcoin" />
                    <Picker.Item label="Ethereum (ETH)" value="ethereum" />
                    <Picker.Item label="Dogecoin (DOGE)" value="dogecoin" />
                    <Picker.Item label="Tether (USDT)" value="tether" />
                    <Picker.Item label="Litecoin (LTC)" value="litecoin" />
                  </Picker>
                </View>
                <TextInput style={styles.input} placeholder={`Enter ${cryptoCoin.toUpperCase()} Wallet Address`} placeholderTextColor={colors.grayish} value={cryptoDetails.wallet} onChangeText={(text) => setCryptoDetails({ wallet: text })} />
              </View>
            )}

            <TouchableOpacity style={styles.saveButton} activeOpacity={0.8} onPress={handleSavePayment}>
              <Text style={styles.saveButtonText}>Save Payment Method</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Display Saved Payments */}
        {savedPayments.length > 0 && (
          <View style={{ marginTop: 20 }}>
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>Saved Payments</Text>
            <FlatList data={savedPayments} keyExtractor={(_, index) => index.toString()} renderItem={({ item, index }) => (
              <View style={[styles.savedCard, { backgroundColor: colors.gray }]}>
                <Text style={{ color: colors.light, fontWeight: "bold" }}>{index + 1}. {item.method.toUpperCase()}</Text>
                {item.card && <Text style={{ color: colors.light }}>Card Number: {item.card.number} | Exp: {item.card.expiry} | CVV: {item.card.cvv}</Text>}
                {item.mobile && <Text style={{ color: colors.light }}>Mobile Number: {item.mobile.phone} | Provider: {item.mobile.provider}</Text>}
                {item.crypto && <Text style={{ color: colors.light }}>Crypto: {item.crypto.coin} | Wallet: {item.crypto.wallet}</Text>}
              </View>
            )} />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default PaymentScreen;

// Styles
const appStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { color: colors.text, fontSize: 20, fontWeight: "700", marginBottom: 16, left: -65 },
  card: { backgroundColor: colors.gray, borderRadius: 16, paddingVertical: 10, marginBottom: 20 },
  option: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: "#222" },
  optionLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  optionLabel: { color: colors.light, fontSize: 16 },
  optionSelected: { backgroundColor: "#1a1a1a" },
  inputSection: { marginTop: 10 },
  input: { backgroundColor: "#1a1a1a", padding: 12, borderRadius: 12, color: colors.light, marginBottom: 12, borderWidth: 1, borderColor: "#333" },
  row: { flexDirection: "row", justifyContent: "space-between" },
  saveButton: { backgroundColor: colors.primary, paddingVertical: 16, borderRadius: 12, alignItems: "center", marginTop: 10 },
  saveButtonText: { color: colors.dark, fontWeight: "bold", fontSize: 16 },
  pickerContainer: { backgroundColor: colors.input, borderRadius: 12, borderWidth: 1, borderColor: "#333", marginBottom: 12, overflow: "hidden" },
  pickerWrapper: { backgroundColor: colors.input, borderRadius: 8, marginBottom: 12, height: 'auto' },
  label: { color: colors.light, marginBottom: 6, fontWeight: "500", fontSize: 16 },
  savedCard: { padding: 12, borderRadius: 12, marginBottom: 12 },
});
