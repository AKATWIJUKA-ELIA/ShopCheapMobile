import { Colors } from '@/constants/Colors'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuthStore } from '@/store/useAuthStore'
import { useCartStore } from '@/store/useCartStore'
import { AUTH_API_URL } from '@/types/product'
import { showToast } from '@/utils/toast'
import { AntDesign, Ionicons } from '@expo/vector-icons'
import { Link, useRouter } from 'expo-router'
import React, { useMemo, useState } from 'react'
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const router = useRouter();
  const { colors, theme, toggleTheme } = useTheme();
  const styles = useMemo(() => appStyles(colors), [colors]);

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev); // 👈 Toggle handler

  const { setUser } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(AUTH_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Success
        setUser(data.user);

        // Fetch cart from backend after login success
        const { fetchCart } = useCartStore.getState();
        await fetchCart();

        showToast('Login successful!', 'success');
        router.replace('/(tabs)/home');
      } else {
        // Error from API
        Alert.alert('Login Failed', data.message || 'Invalid credentials');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred. Please try again later.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={{ left: 0, width: 40, top: 0 }}>
        <TouchableOpacity onPress={() => router.navigate('/(tabs)/account')} style={{
          backgroundColor: colors.background,
          borderRadius: 99,
          padding: 5,
          height: 40,
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Ionicons name='arrow-back' size={30} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>
      </View>

      <View style={styles.field}>
        <Ionicons name='mail-outline' size={14} color={colors.grayish} />
        <TextInput
          style={[styles.input, {}]}
          placeholder='Email'
          placeholderTextColor={colors.grayish}
          value={email}
          onChangeText={setEmail}
          keyboardType='email-address'
          autoCapitalize='none'
          cursorColor={colors.primary}
          inputMode='email'

        />
      </View>
      <View style={styles.field}>
        <Ionicons name='lock-closed-outline' size={18} color={Colors.grayish} />
        <TextInput
          style={styles.input}
          placeholder='Password'
          placeholderTextColor={colors.grayish}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          cursorColor={colors.primary}
        />
        <TouchableOpacity onPress={togglePasswordVisibility}>
          <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.grayish} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
        activeOpacity={0.5}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text style={styles.primaryBtnText}>Sign In</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity>
        <Text style={[styles.or]}>Forgot password?</Text>
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
        <Text style={{ color: colors.grayish }}>Don't have an account?</Text>
        <Link href='/(auth)/signup' style={styles.link}>Sign Up</Link>
      </View>


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
    padding: 16
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
  },
})


