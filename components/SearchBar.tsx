import { Colors } from '@/constants/Colors'
import { useTheme } from '@/contexts/ThemeContext'
import { Ionicons, MaterialIcons } from '@expo/vector-icons'
import React, { useMemo } from 'react'
import { StyleSheet, TextInput, View } from 'react-native'

type Props = {
  placeholder?: string
  value?: string
  onChangeText?: (text: string) => void
}

export default function SearchBar({ placeholder = 'Search on Shop Cheap', value, onChangeText }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => appStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <Ionicons name="search" size={18} color={colors.grayish} />
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={colors.grayish}
        style={styles.input}
        cursorColor={colors.primary}
        value={value}
        onChangeText={onChangeText}
      />
      {value ? (
        <MaterialIcons name="cancel" size={18} color={Colors.grayish} onPress={() => onChangeText?.('')} />
      ) : null}
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


