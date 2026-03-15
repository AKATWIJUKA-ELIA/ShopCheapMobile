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
  const [currentIndex, setCurrentIndex] = React.useState(1); // Start at index 1 (first real item)
  const currentOffset = useRef(width); // Start at index 1 offset
  const isJumping = useRef(false);
  const isUserInteracting = useRef(false);
  const interactionTimeout = useRef<any>(null);

  // Augment images: [Last, 1, 2, 3, 4, 1]
  const augmentedImages = images.length > 1 ? [images[images.length - 1], ...images, images[0]] : images;

  // Custom smooth scroll with controllable speed and easing
  const smoothScrollTo = (targetX: number, duration: number = 1200) => {
    if (isJumping.current) return;
    const startX = currentOffset.current;
    const distance = targetX - startX;
    const startTime = Date.now();

    const step = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic for buttery smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      const newX = startX + distance * eased;
      scrollRef.current?.scrollTo({ x: newX, animated: false });
      currentOffset.current = newX;
      if (progress < 1 && !isUserInteracting.current) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  };

  // Initial jump to first real item
  useEffect(() => {
    if (images.length > 1) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({ x: width, animated: false });
        currentOffset.current = width;
      }, 100);
    }
  }, [images.length]);

  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      if (isJumping.current || isUserInteracting.current) return;

      const nextIndex = currentIndex + 1;
      const targetX = nextIndex * width;

      smoothScrollTo(targetX);
      setCurrentIndex(nextIndex);

      // Handle jump after animation
      if (nextIndex === augmentedImages.length - 1) {
        setTimeout(() => {
          isJumping.current = true;
          scrollRef.current?.scrollTo({ x: width, animated: false });
          currentOffset.current = width;
          setCurrentIndex(1);
          setTimeout(() => { isJumping.current = false; }, 50);
        }, 1300);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [images.length, augmentedImages.length, currentIndex]);

  const handleScroll = (event: any) => {
    if (isJumping.current) return;
    const x = event.nativeEvent.contentOffset.x;
    currentOffset.current = x;

    // Jump if manually scrolled to clones
    if (x <= 0) {
      isJumping.current = true;
      const jumpX = (augmentedImages.length - 2) * width;
      scrollRef.current?.scrollTo({ x: jumpX, animated: false });
      currentOffset.current = jumpX;
      setCurrentIndex(augmentedImages.length - 2);
      setTimeout(() => { isJumping.current = false; }, 50);
    } else if (x >= (augmentedImages.length - 1) * width) {
      isJumping.current = true;
      scrollRef.current?.scrollTo({ x: width, animated: false });
      currentOffset.current = width;
      setCurrentIndex(1);
      setTimeout(() => { isJumping.current = false; }, 50);
    } else {
      const idx = Math.round(x / width);
      if (idx !== currentIndex) setCurrentIndex(idx);
    }
  };

  const handleTouchStart = () => {
    isUserInteracting.current = true;
    if (interactionTimeout.current) clearTimeout(interactionTimeout.current);
  };

  const handleScrollBeginDrag = () => {
    isUserInteracting.current = true;
    if (interactionTimeout.current) clearTimeout(interactionTimeout.current);
  };

  const handleScrollEndDrag = () => {
    interactionTimeout.current = setTimeout(() => {
      isUserInteracting.current = false;
    }, 5000);
  };

  const handleMomentumScrollEnd = (event: any) => {
    handleScroll(event);
    if (interactionTimeout.current) clearTimeout(interactionTimeout.current);
    interactionTimeout.current = setTimeout(() => {
      isUserInteracting.current = false;
    }, 5000);
  };

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
        scrollEventThrottle={16}
        onScroll={handleScroll}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        onTouchStart={handleTouchStart}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
      >
        {augmentedImages.map((item, idx) => {
          const isObject = typeof item === 'object' && item !== null && 'uri' in item;
          const source = isObject ? (typeof item.uri === 'string' ? { uri: item.uri } : item.uri) : (typeof item === 'string' ? { uri: item } : item);
          const title = isObject ? (item as BannerItem).title : null;

          return (
            <TouchableOpacity
              key={`${idx}-${isObject ? (item as BannerItem).id : idx}`}
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
      {/* <View style={styles.pagination}>
        {images.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              currentIndex === i ? styles.activeDot : styles.inactiveDot
            ]}
          />
        ))}
      </View> */}
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


