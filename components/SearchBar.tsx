import { Colors } from '@/constants/Colors'
import { useTheme } from '@/contexts/ThemeContext'
import { Ionicons } from '@expo/vector-icons'
import React, { useMemo } from 'react'
import { StyleSheet, TextInput, View } from 'react-native'

type Props = {
  placeholder?: string
}

export default function SearchBar({ placeholder = 'Search on Shop Cheap' }: Props) {
  const {colors} = useTheme();
  const styles = useMemo(() => appStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <Ionicons name="search" size={18} color={colors.grayish} />
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={colors.grayish}
        style={styles.input}
      />
      {/* <Ionicons name="mic-outline" size={18} color={Colors.gray} /> */}
    </View>
  )
}

const appStyles = (colors: any) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.background,
    borderColor: colors.primary,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 99,
  },
  input: {
    flex: 1,
    color: colors.text,
    paddingVertical: 0,
    fontSize: 14,
  }
})


