import RenderItem from '@/components/RenderItem'
import { Colors } from '@/constants/Colors'
import { products } from '@/constants/data'
import { useTheme } from '@/contexts/ThemeContext'
import { Ionicons } from '@expo/vector-icons'
import { router, useLocalSearchParams } from 'expo-router'
import React, { useMemo } from 'react'
import { FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

export default function CategoryModal() {
  const { name } = useLocalSearchParams()
  const categoryName = String(name || '')
  const filtered = products.filter(p => (p as any).category === categoryName);

  const {colors} = useTheme();
  const styles = useMemo(() => appStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <View style={{flexDirection:'row'}}>
        {Platform.OS === 'android'? (
          <TouchableOpacity onPress={() => router.back()} style={{
            backgroundColor:colors.background, 
            padding:20}}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.primary}/>
          </TouchableOpacity>
        ):undefined}

        <Text style={{color:colors.primary, fontSize:24, fontWeight:'bold', padding:20}}>
          {categoryName}
        </Text>
      </View>
      
      {/* <Text style={styles.title}>{categoryName}</Text> */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        renderItem={({ item, index }) => (<RenderItem item={item} index={index} />)}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12 }}
      />
    </View>
  )
}

const appStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  title: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '800',
    padding: 16
  }
})



