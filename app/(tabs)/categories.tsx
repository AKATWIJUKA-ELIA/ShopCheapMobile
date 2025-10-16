import CategoryTile from '@/components/CategoryTile'
import RefreshScrollView from '@/components/RefreshScrollView'
import FloatingButton from '@/components/ui/FloatingBtn'
import { openHelpSideBar } from '@/components/ui/help'
import { Colors } from '@/constants/Colors'
import { categories as categoriesData } from '@/constants/data'
import { useTheme } from '@/contexts/ThemeContext'
import React, { useMemo } from 'react'
import { StyleSheet, Text, View } from 'react-native'

const categories = categoriesData

const Categories = () => {
  const {colors} = useTheme();
  const styles = useMemo(() => appStyles(colors), [colors]);
  
  return (
    <View style={{flex:1}}>
      <RefreshScrollView style={styles.container} showsVerticalScrollIndicator={false}> 
        {/* <SectionHeader title='All Categories' /> */}
        <Text style={{color:Colors.primary, fontSize: 16, fontWeight: '600', textAlign:'center', marginTop:5}}>
          All Categories
        </Text>
        <View style={styles.gridWrap}>
          {categories.map((c, idx) => (
            <CategoryTile key={idx} title={c.title} image={c.image} />
          ))}
        </View>
      </RefreshScrollView>
      <FloatingButton onPress={openHelpSideBar}/>
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