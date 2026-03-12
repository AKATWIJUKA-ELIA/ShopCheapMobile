import { Colors } from '@/constants/Colors'
import { useTheme } from '@/contexts/ThemeContext'
import React, { useMemo } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

type Props = {
  title: string
  actionText?: React.ReactNode
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
          {typeof actionText === "string" ? (
            <Text style={styles.action}>{actionText}</Text>
          ) : (
            actionText
          )}
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
    backgroundColor: colors.card,
    // borderRadius: 8,
    // marginBottom: 8,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600'
  },
  action: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '500'
  }
})


