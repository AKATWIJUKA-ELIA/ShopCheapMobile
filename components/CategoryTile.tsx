import { useTheme } from '@/contexts/ThemeContext'
import { useRouter } from 'expo-router'
import React, { useMemo } from 'react'
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

type Props = {
  title: string
  image: any
}

export default function CategoryTile({ title, image }: Props) {
  const { width, height } = Dimensions.get('window');
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => appStyles(colors), [colors]);

  return (
    <TouchableOpacity style={styles.container} activeOpacity={0.8} onPress={() => router.push({ pathname: '/(modals)/categories', params: { name: title } })}>
      <View style={styles.imageWrap}>
        <Image source={image} style={styles.image} />
      </View>
      <Text style={styles.title} numberOfLines={1}>{title}</Text>
    </TouchableOpacity>
  )
}

const appStyles = (colors: any) => StyleSheet.create({
  container: {
    width: 90,
    height: 'auto',
    padding: 8,
  },
  imageWrap: {
    backgroundColor: '#111',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    marginBottom: 6
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8
  },
  title: {
    color: colors.text,
    fontSize: 10,
    textAlign: 'center'
  }
})


