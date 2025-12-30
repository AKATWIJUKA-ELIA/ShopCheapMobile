import CategoryTile from '@/components/CategoryTile'
import RefreshScrollView from '@/components/RefreshScrollView'
import FloatingButton from '@/components/ui/FloatingBtn'
import { openHelpSideBar } from '@/components/ui/help'
import { Colors } from '@/constants/Colors'
import { categories as categoriesData } from '@/constants/data'
import { useTheme } from '@/contexts/ThemeContext'
import React, { useMemo } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { useSearchStore } from '@/components/SearchStore'

const categories = categoriesData

const Categories = () => {
  const { colors, toggleTheme } = useTheme();
  const styles = useMemo(() => appStyles(colors), [colors]);
  const { query } = useSearchStore();

  return (
    <View style={{ flex: 1 }}>
      <RefreshScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* <SectionHeader title='All Categories' /> */}
        <Text style={{ color: Colors.primary, fontSize: 16, fontWeight: '600', textAlign: 'center', marginTop: 5 }}>
          All Categories
        </Text>
        <View style={styles.gridWrap}>
          {categories.filter(c => c.title.toLowerCase().includes(query.toLowerCase())).map((c, idx) => (
            <CategoryTile key={idx} title={c.title} image={c.image} />
          ))}
        </View>
      </RefreshScrollView>
      <FloatingButton
        onPress={openHelpSideBar}
        icon='message-alert'
        color={Colors.primary}
        onLongPress={toggleTheme}
      />
    </View>
  )
}

export default Categories

const appStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  gridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  }
})