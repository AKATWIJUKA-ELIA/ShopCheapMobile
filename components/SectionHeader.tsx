import { Colors } from '@/constants/Colors'
import { useTheme } from '@/contexts/ThemeContext'
import React, { useMemo } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

type Props = {
  title: string
  actionText?: string
  onActionPress?: () => void;
}

export default function SectionHeader({ title, actionText, onActionPress }: Props) {
    const {colors} = useTheme();
  const styles = useMemo(() => appStyles(colors), [colors]);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {actionText && (
        <TouchableOpacity onPress={onActionPress}>
          <Text style={styles.action}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const appStyles = (colors: any) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    color: colors.light,
    fontSize: 16,
    fontWeight: '600'
  },
  action: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '500'
  }
})


