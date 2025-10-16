import { Colors } from '@/constants/Colors'
import { useTheme } from '@/contexts/ThemeContext'
import React, { PropsWithChildren, useMemo, useState } from 'react'
import { Platform, RefreshControl, ScrollView, ScrollViewProps } from 'react-native'

type Props = ScrollViewProps & {
  refreshFn?: () => Promise<void> | void
  refreshDelayMs?: number
}

export default function RefreshScrollView({ children, refreshFn, refreshDelayMs = 1200, ...rest }: PropsWithChildren<Props>) {
  const [refreshing, setRefreshing] = useState(false);
  const {colors} = useTheme();
  // const styles = useMemo(() => appStyles(colors), [colors]);

  const onRefresh = async () => {
    setRefreshing(true)
    try {
      if (refreshFn) {
        await Promise.resolve(refreshFn())
      } else {
        await new Promise(resolve => setTimeout(resolve, refreshDelayMs))
      }
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <ScrollView
      {...rest}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary} // iOS spinner color
          colors={Platform.OS === 'android' ? [colors.primary] : undefined} // Android spinner colors
          progressBackgroundColor={Platform.OS === 'android' ? colors.background : undefined}
        />
      }
    >
      {children}
    </ScrollView>
  )
}


