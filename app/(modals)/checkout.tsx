import AddressScreen from '@/components/Account/DeliveryAddress';
import { useTheme } from '@/contexts/ThemeContext';
import { useCartStore } from '@/store/useCartStore';
import { formatPrice } from '@/types/product';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from '@react-native-community/blur';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, Animated, Dimensions, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const { height } = Dimensions.get("window");

const CheckoutScreen = () => {
  const router = useRouter();
  const { items, total, clearCart } = useCartStore();
  const [step, setStep] = useState(0); // 0: Address, 1: Payment, 2: Review, 3: Confirm


  const { colors } = useTheme();
  const styles = useMemo(() => appStyles(colors), [colors]);

  // Demo local state (replace with real stores)
  const [selectedAddress, setSelectedAddress] = useState({ label: 'Home', details: '12 Kintu Rd, Kampala' });
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash' | 'mobile'>('card');
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '' });


  // PIN state
  const [pinVisible, setPinVisible] = useState(false);
  const [pin, setPin] = useState('');

  const goNext = () => {
    if (step === 0 && !selectedAddress) {
      Alert.alert('Address missing', 'Please select or add an address');
      return;
    }
    if (step === 1 && paymentMethod === 'card' && (!card.number || !card.cvv)) {
      Alert.alert('Card info missing', 'Please complete your card details');
      return;
    }
    setStep((s) => Math.min(3, s + 1));
  };

  const goBack = () => {
    setStep((s) => Math.max(0, s - 1));
  };

  //   const confirmOrder = () => {
  //     clearCart();
  //     setStep(3);
  //     setTimeout(() => {
  //       Alert.alert('Order Confirmed', 'Thank you! Your order has been placed.');
  //       router.replace('/(tabs)/home');
  //     }, 500);
  //   };

  const confirmOrder = () => {
    // Only show PIN if payment method requires it
    if (paymentMethod === 'card' || paymentMethod === 'mobile') {
      setPinVisible(true); // show the PIN modal
    } else {
      finalizeOrder(); // COD can skip PIN
    }
  };


  const finalizeOrder = () => {
    clearCart();
    setStep(3); // move to "Order Confirmed"
    setTimeout(() => {
      Alert.alert('Order Confirmed', 'Thank you! Your order has been placed.');
      router.replace('/(tabs)/home');
    }, 500);
  };




  //for the bottomsheet modal
  const translateY = useState(new Animated.Value(height))[0];
  const [visible, setVisible] = useState(false);
  const [slideAnim] = useState(new Animated.Value(height));

  const openBottomSheetModal = () => {
    setVisible(true);
    Animated.timing(translateY, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const closeBottomSheetModal = () => {
    Animated.timing(translateY, {
      toValue: height,
      duration: 500,
      useNativeDriver: true,
    }).start(() => setVisible(false));
  };

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: translateY } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = ({ nativeEvent }: any) => {
    if (nativeEvent.state === 5) {
      // 5 = GestureHandlerState.END
      if (nativeEvent.translationY > 150) {
        closeBottomSheetModal();
      } else {
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Header */}
        <View style={styles.header}>
          {step > 0 && (
            <TouchableOpacity onPress={goBack}>
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>Checkout</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        {/* Step Indicator */}
        <View style={styles.stepIndicatorRow}>
          {['Address', 'Payment', 'Review', 'Done'].map((label, idx) => (
            <View key={label} style={styles.stepItem}>
              <View style={[styles.stepDot, step === idx && styles.stepDotActive]} />
              <Text style={[styles.stepLabel, step === idx && styles.stepLabelActive]}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Step Content */}
        {step === 0 && (
          <View style={{ marginTop: 16 }}>
            <Text style={[styles.sectionTitle, { textAlign: 'center', marginBottom: 10 }]}>Delivery Address</Text>
            <View style={styles.addressCard}>
              <Text style={styles.addressLabel}>{selectedAddress.label}</Text>
              <Text style={styles.addressDetails}>{selectedAddress.details}</Text>
            </View>
            <TouchableOpacity onPress={openBottomSheetModal}>
              <Text style={{ color: colors.primary, margin: 5 }}>Change Address</Text>
            </TouchableOpacity>


          </View>
        )}

        {step === 1 && (
          <View style={{ marginTop: 16 }}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              {['card', 'cash', 'mobile'].map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.payOption, paymentMethod === m && styles.payOptionSelected]}
                  onPress={() => setPaymentMethod(m as any)}
                >
                  <Text style={{ color: colors.light }}>{m.toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {paymentMethod === 'card' && (
              <View style={{ marginTop: 12 }}>
                <Text style={{ color: colors.text }}>Card number</Text>
                <TextInput
                  placeholder="Card Number"
                  placeholderTextColor={colors.grayish}
                  style={styles.input}
                  value={card.number}
                  onChangeText={(t) => setCard({ ...card, number: t })}
                  keyboardType="numeric"
                  maxLength={16}
                />
                <View style={{ flexDirection: 'row', gap: 8, }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.text }}>Expires End</Text>
                    <TextInput
                      placeholder="MM/YY"
                      placeholderTextColor={colors.grayish}
                      style={[styles.input, { flex: 1 }]}
                      value={card.expiry}
                      onChangeText={(t) => setCard({ ...card, expiry: t })}
                      maxLength={4}
                      keyboardType='numeric'
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.text }}>CVC</Text>
                    <TextInput
                      placeholder="CVC"
                      placeholderTextColor={colors.grayish}
                      style={[styles.input, { flex: 1 }]}
                      value={card.cvv} onChangeText={(t) => setCard({ ...card, cvv: t })}
                      secureTextEntry keyboardType="numeric"
                      maxLength={3}
                    />
                  </View>
                </View>
              </View>
            )}
          </View>
        )}

        {step === 2 && (
          <View style={{ marginTop: 16 }}>
            <Text style={styles.sectionTitle}>Review Order</Text>
            {items.map((ci: any) => (
              <View key={ci.product._id} style={styles.reviewRow}>
                <Text style={{ color: colors.text }}>{ci.product.product_name} x {ci.quantity}</Text>
                <Text style={{ color: colors.text }}>{formatPrice(parseFloat(ci.product.product_price) * ci.quantity)}</Text>
              </View>
            ))}
            <Text style={[styles.totalValue, { marginTop: 12 }]}>Total: {formatPrice(total)}</Text>
          </View>
        )}

        {step === 3 && (
          <View style={{ marginTop: 32, alignItems: 'center' }}>
            <Ionicons name="checkmark-circle" size={64} color={colors.primary} />
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.light, marginTop: 12 }}>Order Confirmed!</Text>
          </View>
        )}

        {/* Footer Buttons */}
        {step < 3 && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 }}>
            {/* <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#2b2b2b' }]} onPress={() => router.back()}>
              <Text style={styles.actionBtnText}>Cancel</Text>
            </TouchableOpacity> */}
            {step === 2 ? (
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary }]} onPress={confirmOrder}>
                <Text style={[styles.actionBtnText, { color: colors.dark }]}>Confirm Order</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary }]} onPress={goNext}>
                <Text style={[styles.actionBtnText, { color: colors.dark }]}>Next</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

      </ScrollView>

      {/* PIN Modal */}
      {pinVisible && (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {/* Blur background */}
          <BlurView
            blurAmount={10}
            blurType='dark'
            style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
            }}
          />

          {/* Modal Card */}
          <Animated.View
            style={{
              width: '80%',
              backgroundColor: colors.graybackground,
              padding: 24,
              borderRadius: 16,
              elevation: 10,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: 'white', fontWeight: '700', fontSize: 18, marginBottom: 16 }}>
              Enter PIN
            </Text>

            <TextInput
              value={pin}
              onChangeText={setPin}
              keyboardType="numeric"
              secureTextEntry
              placeholder="••••"
              placeholderTextColor={colors.grayish}
              maxLength={4}
              autoFocus
              caretHidden
              keyboardAppearance='dark'
              style={{
                backgroundColor: colors.gray,
                color: 'white',
                fontSize: 22,
                padding: 14,
                borderRadius: 99,
                width: '60%',
                textAlign: 'center',
                letterSpacing: 14,
                marginBottom: 20,
              }}
            />

            {/* Buttons */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
              <TouchableOpacity onPress={() => setPinVisible(false)} style={{ padding: 12 }}>
                <Text style={{ color: 'red', fontWeight: '700' }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => {
                if (pin.length < 4) {
                  Alert.alert('Invalid PIN', 'PIN must be 4 digits');
                  return;
                }
                setPinVisible(false);
                finalizeOrder();
              }} style={{ padding: 12 }}>
                <Text style={{ color: colors.primary, fontWeight: '700' }}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      )}


      {/* Bottom Sheet for Address Selection */}
      {visible && (
        <Animated.View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: height * 0.7,
            backgroundColor: colors.background,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            transform: [{ translateY }],
            elevation: 10,
            shadowColor: "#000",
            shadowOpacity: 0.3,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: -2 },
          }}
        >
          {/* Close button */}
          <TouchableOpacity onPress={closeBottomSheetModal} style={{ alignSelf: "flex-end", padding: 10, zIndex: 1, }}>
            <Ionicons name="close" size={24} color={colors.primary} />
          </TouchableOpacity>

          {/* Your AddressScreen Component */}
          <AddressScreen />
        </Animated.View>
      )}

    </KeyboardAvoidingView>
  );
};

export default CheckoutScreen;

const appStyles = (colors: any) => StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  backText: {
    color: colors.primary,
    fontWeight: '700'
  },
  cancelText: {
    color: 'red',
    fontWeight: '700'
  },
  headerTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700'
  },
  stepIndicatorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16
  },
  stepItem: {
    alignItems: 'center',
    flex: 1
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 6,
    backgroundColor: '#333',
    marginBottom: 6
  },
  stepDotActive: {
    backgroundColor: colors.primary
  },
  stepLabel: {
    color: colors.text,
    fontSize: 12
  },
  stepLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  sectionTitle: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 8,
    marginTop: 16
  },
  addressCard: {
    backgroundColor: '#111',
    padding: 12,
    borderRadius: 10
  },
  addressLabel: {
    color: colors.light,
    fontWeight: '700'
  },
  addressDetails: {
    color: colors.gray,
    marginTop: 4
  },
  input: {
    backgroundColor: '#111',
    borderRadius: 10,
    padding: 12, color:
      colors.light,
    borderWidth: 1,
    borderColor: '#222',
    marginBottom: 10
  },
  payOption: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#111',
    marginRight: 8,
    marginBottom: 8
  },
  payOptionSelected: {
    borderColor: colors.primary,
    borderWidth: 1.2,
    backgroundColor: '#0f0f0f'
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  totalValue: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 16
  },
  actionBtn: {
    flex: 1, padding: 12,
    borderRadius: 12,
    alignItems: 'center'
  },
  actionBtnText: {
    color: colors.light,
    fontWeight: '700'
  },
});
