import Banner from '@/components/Banner'
import CategoryTile from '@/components/CategoryTile'
import RefreshScrollView from '@/components/RefreshScrollView'
import RenderItem from '@/components/RenderItem'
import SectionHeader from '@/components/SectionHeader'
import FloatingButton from '@/components/ui/FloatingBtn'
import HelpCenter, { openHelpSideBar } from '@/components/ui/help'
import { Colors } from '@/constants/Colors'
import { banners as bannerImages, categories as categoriesData, products } from '@/constants/data'
import { useTheme } from '@/contexts/ThemeContext'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React, { useMemo } from 'react'
import { FlatList, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'

const banners = bannerImages

const categories = categoriesData;
const items = products;

const Home = () => {
  const router = useRouter();
  const {colors} = useTheme();
  const styles = useMemo(() => appStyles(colors), [colors]);

  return (
    <View style={{flex:1}}>   
      <RefreshScrollView style={styles.container} showsVerticalScrollIndicator={false}> 
        <View style={{marginBottom:30}}>
          <View style={{marginTop:14}}/>

          <Banner images={banners as any} />

          <View style={{marginTop:14}}/>
          <SectionHeader title='Top Categories' actionText='See all' onActionPress={() => router.push('/(tabs)/categories')}/>
          <ScrollView horizontal style={styles.categoriesWrap}
            showsHorizontalScrollIndicator={false}
          >
            {categories.slice(0, 8).map((c, idx) => (
              <CategoryTile key={idx} title={c.title} image={c.image}/>
            ))}
          </ScrollView>

          <View style={{marginTop:14}}/>

          <View style={{backgroundColor:colors.primary, marginTop:10, marginBottom:10, justifyContent:'center', alignItems:'center'}}>
            <SectionHeader title='All Products'/>
          </View>

          <View>
            <FlatList 
              data={items}
              numColumns={2}
              renderItem={({ item, index }) => (<RenderItem item={item} index={index} />)}
              keyExtractor={(item) => item.id.toString()}
              columnWrapperStyle={{ justifyContent: 'space-between' }}
              contentContainerStyle={{ paddingHorizontal: 16 }}
            />
          </View>
        </View>
        <HelpCenter/>
      </RefreshScrollView>
      <FloatingButton 
        onPress={openHelpSideBar}
      />
    </View>
  )
}

export default Home

const appStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  // content: {
  //   padding: 16
  // },
  categoriesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  gridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  }
})