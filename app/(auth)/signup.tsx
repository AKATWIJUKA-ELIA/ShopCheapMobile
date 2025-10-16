import { Colors } from '@/constants/Colors'
import { useTheme } from '@/contexts/ThemeContext'
import { AntDesign, Ionicons, MaterialIcons } from '@expo/vector-icons'
import { Link, useRouter } from 'expo-router'
import React, { useMemo, useState } from 'react'
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'

export default function Signup() {
  const [userName, setUserName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const {colors, theme, toggleTheme} = useTheme();
  const styles = useMemo(() => appStyles(colors), [colors]);

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev); 

  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={{left:0, width:40, top:0,}}>
        <TouchableOpacity onPress={() => router.back()} style={{
            backgroundColor:colors.background,
            borderRadius:99,
            padding:5
            }}>
          <Ionicons name='arrow-back' size={30} color={colors.text}/>
        </TouchableOpacity>
      </View>

      <View style={{justifyContent:'center', alignItems:'center', marginTop:-20}}>
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

      <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.5}>
        <Text style={styles.primaryBtnText}>Create Account</Text>
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
        <Text style={{ color: colors.gray }}>Already have an account?</Text>
        <Link href='/(auth)/login' style={styles.link}>Sign in</Link>
      </View >

      <TouchableOpacity
        onPress={toggleTheme}
        style={[{
          position: 'absolute',
          top: 20,
          right: 20,
          // backgroundColor:colors.primary,
          padding:10,
          borderRadius:99
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
    height:60
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize:14
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
  },
  link: {
    color: colors.primary,
    fontWeight: '700'
  }
})


