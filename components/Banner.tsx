import { Colors } from '@/constants/Colors'
import { useRouter } from 'expo-router'
import React, { useEffect, useRef } from 'react'
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

const { width } = Dimensions.get('window')

export type BannerItem = {
  id?: string;
  title?: string;
  uri: string | number;
}

type Props = {
  images: (number | string | BannerItem)[]
}

export default function Banner({ images }: Props) {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = React.useState(0);

  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % images.length;
        scrollRef.current?.scrollTo({
          x: nextIndex * width,
          animated: true,
        });
        return nextIndex;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [images.length]);

  const handlePress = (item: any) => {
    if (item?.id) {
      router.push(`/Screens/${item.id}`);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        scrollEnabled={false}
      >
        {images.map((item, idx) => {
          const isObject = typeof item === 'object' && item !== null && 'uri' in item;
          const source = isObject ? (typeof item.uri === 'string' ? { uri: item.uri } : item.uri) : (typeof item === 'string' ? { uri: item } : item);
          const title = isObject ? (item as BannerItem).title : null;

          return (
            <TouchableOpacity
              key={idx}
              activeOpacity={0.9}
              onPress={() => handlePress(item)}
              disabled={!isObject || !(item as BannerItem).id}
            >
              <View style={styles.imageContainer}>
                <Image
                  source={source as any}
                  style={styles.image}
                  // resizeMode='contain'
                  resizeMode='stretch'
                />
                {title && (
                  <View style={styles.overlay}>
                    <View style={styles.titleBadge}>
                      <Text style={styles.titleText}>{title}</Text>
                    </View>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {images.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              currentIndex === i ? styles.activeDot : styles.inactiveDot
            ]}
          />
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: 200,
    marginTop: -8,
  },
  imageContainer: {
    width: width,
    height: 200,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
  },
  titleBadge: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  titleText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  pagination: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 99,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: Colors.primary,
    width: 20,
  },
  inactiveDot: {
    backgroundColor: Colors.grayish,
  }
})


