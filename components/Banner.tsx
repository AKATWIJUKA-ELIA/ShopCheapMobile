import React, { useRef } from 'react'
import { Dimensions, Image, ScrollView, StyleSheet, View } from 'react-native'

const { width } = Dimensions.get('window')

type RemoteImage = { uri: string }
type Props = {
  images: (number | RemoteImage)[]
}

export default function Banner({ images }: Props) {
  const scrollRef = useRef<ScrollView>(null)

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
      >
        {images.map((img, idx) => (
          <Image key={idx} source={img as any} style={styles.image} resizeMode='cover' />
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: 150,
  },
  image: {
    width,
    height: 150,
    resizeMode:'contain'
    // borderRadius:20
  }
})


