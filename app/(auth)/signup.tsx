import { useTheme } from '@/contexts/ThemeContext'
import { useAuthStore } from '@/store/useAuthStore'
import { useCartStore } from '@/store/useCartStore'
import { AUTH_API_URL, CREATE_USER_API_URL } from '@/types/product'
import { showToast } from '@/utils/toast'
import { AntDesign, Ionicons, MaterialIcons } from '@expo/vector-icons'
import bcrypt from 'bcryptjs'
import * as Crypto from 'expo-crypto'
import { Link, useRouter } from 'expo-router'
import React, { useMemo, useState } from 'react'
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'

// Add secure random fallback for bcryptjs in React Native
bcrypt.setRandomFallback((len: number) => {
  const array = new Uint8Array(len);
  Crypto.getRandomValues(array);
  return Array.from(array);
});

export default function Signup() {
  const [userName, setUserName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const { colors, theme, toggleTheme } = useTheme();
  const styles = useMemo(() => appStyles(colors), [colors]);

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const router = useRouter();
  const { setUser } = useAuthStore();

  const handleSignup = async () => {
    const sanitizedUserName = userName.trim();
    const sanitizedEmail = email.trim();
    const sanitizedPhone = phone.trim();
    const sanitizedPassword = password.trim();

    const validateEmail = (email: string) => {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    };

    if (!sanitizedUserName || !sanitizedEmail || !sanitizedPassword || !sanitizedPhone) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (sanitizedUserName.length < 3) {
      Alert.alert('Invalid Username', 'Username must be at least 3 characters');
      return;
    }

    if (!validateEmail(sanitizedEmail)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    if (sanitizedPhone.length < 8 || !/^\+?\d+$/.test(sanitizedPhone)) {
      Alert.alert('Invalid Phone', 'Please enter a valid phone number');
      return;
    }

    if (sanitizedPassword.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);

      // Hash the password before sending to backend (using sanitized value)
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(sanitizedPassword, salt);
      console.log('[Signup] Password hashed successfully');

      // 1. Create User
      const response = await fetch(CREATE_USER_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: sanitizedUserName,
          email: sanitizedEmail,
          passwordHash: hashedPassword, // Send hashed password
          phoneNumber: sanitizedPhone,
          isVerified: false,
          role: 'user',
          reset_token_expires: 0,
          updatedAt: Date.now(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // 2. Automatically Login after signup
        console.log('[Signup] User created successfully, attempting auto-login...');
        const loginRes = await fetch(AUTH_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const loginData = await loginRes.json();

        if (loginRes.ok && loginData.success) {
          setUser(loginData.user);

          // Fetch cart for the new user
          const { fetchCart, fetchBookmarks } = useCartStore.getState();
          await fetchCart();
          await fetchBookmarks();

          showToast('Account created and logged in!', 'success');
          router.replace('/(tabs)/home');
        } else {
          showToast('Account created! Please log in.', 'success');
          router.replace('/(auth)/login');
        }
      } else {
        // Handle specific API errors
        const errorMsg = data.message || data.error || 'Error creating account';
        Alert.alert('Signup Failed', errorMsg);
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred. Please try again later.');
      console.error('Signup error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={{ left: 0, width: 40, top: 0, }}>
        <TouchableOpacity onPress={() => router.back()} style={{
          backgroundColor: colors.background,
          borderRadius: 99,
          padding: 5
        }}>
          <Ionicons name='arrow-back' size={30} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: -20 }}>
        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>Join Shop Cheap today</Text>
      </View>

      <View style={styles.field}>
        <Ionicons name='person-outline' size={18} color={colors.grayish} />
        <TextInput
          style={styles.input}
          placeholder='Username'
          placeholderTextColor={colors.grayish}
          value={userName}
          onChangeText={setUserName}
        />
      </View>
      <View style={styles.field}>
        <Ionicons name='mail-outline' size={18} color={colors.grayish} />
        <TextInput
          style={styles.input}
          placeholder='Email'
          placeholderTextColor={colors.grayish}
          value={email}
          onChangeText={setEmail}
          keyboardType='email-address'
          autoCapitalize='none'
        />
      </View>
      <View style={styles.field}>
        <MaterialIcons name='phone' size={18} color={colors.grayish} />
        <TextInput
          style={styles.input}
          placeholder='Phone Contact'
          placeholderTextColor={colors.grayish}
          value={phone}
          onChangeText={setPhone}
          keyboardType='phone-pad'
        />
      </View>
      <View style={styles.field}>
        <Ionicons name='lock-closed-outline' size={18} color={colors.grayish} />
        <TextInput
          style={styles.input}
          placeholder='Password'
          placeholderTextColor={colors.grayish}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={togglePasswordVisibility}>
          <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.grayish} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
        activeOpacity={0.5}
        onPress={handleSignup}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text style={styles.primaryBtnText}>Create Account</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.or}>or continue with</Text>

      <View style={styles.row}>
        <TouchableOpacity style={styles.oauthBtn} activeOpacity={0.7}>
          <AntDesign name='google' size={20} color={colors.background} />
          <Text style={styles.oauthText}>Google</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.oauthBtn} activeOpacity={0.7}>
          <AntDesign name='apple1' size={20} color={colors.background} />
          <Text style={styles.oauthText}>Apple</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inline}>
        <Text style={{ color: colors.grayish }}>Already have an account?</Text>
        <Link href='/(auth)/login' style={styles.link}>Sign in</Link>
      </View >

      <TouchableOpacity
        onPress={toggleTheme}
        style={[{
          position: 'absolute',
          top: 20,
          right: 20,
          // backgroundColor:colors.primary,
          padding: 10,
          borderRadius: 99
        }]}
      >
        <Ionicons
          name={theme === 'dark' ? 'moon' : 'sunny'}
          size={25}
          color={theme === 'dark' ? colors.light : colors.text}
        />
      </TouchableOpacity>
    </View>
  )
}

const appStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
    marginTop: 12
  },
  subtitle: {
    color: colors.grayish,
    marginBottom: 24
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.background,
    borderColor: colors.primary,
    borderWidth: 1,
    paddingHorizontal: 12,
    // paddingVertical: 12,
    // borderRadius: 24,
    marginBottom: 12,
    height: 60
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 14
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: 4
  },
  primaryBtnText: {
    color: '#000',
    fontWeight: '800'
  },
  or: {
    color: colors.grayish,
    textAlign: 'center',
    marginVertical: 16
  },
  row: {
    flexDirection: 'row',
    gap: 12
  },
  oauthBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.text,
    borderColor: '#222',
    borderWidth: 1,
    paddingVertical: 12,
    justifyContent: 'center',
    borderRadius: 8
  },
  oauthText: {
    color: colors.background,
    fontWeight: '700'
  },
  inline: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 18,
    justifyContent: 'center'
  },
  link: {
    color: colors.primary,
    fontWeight: '700'
  }
})


