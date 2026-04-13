import { Colors } from '@/constants/Colors'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Dimensions, ImageBackground, ImageSourcePropType,Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { ShopData } from '@/types/webTypes'
import { Shop } from '@/types/product'
const { width } = Dimensions.get('window')


export type BannerItem = {
  shops: ShopData[]
}



export default function Banner({shops}: BannerItem) {
  const router = useRouter()
  const scrollRef = useRef<ScrollView>(null)
  const [currentIndex, setCurrentIndex] = useState(1)
  const currentOffset = useRef(width)
  const isJumping = useRef(false)
  const isUserInteracting = useRef(false)
  const interactionTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const autoScrollFrame = useRef<number | null>(null)
  const initialScrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const augmentedImages = useMemo(
    () => (shops.length > 1 ? [shops[shops.length - 1], ...shops, shops[0]] : shops),
    [shops]
  )

  const activeDotIndex = shops.length > 1 ? (currentIndex - 1 + shops.length) % shops.length : 0

  const getImageSource = (item: number | string | ShopData): ImageSourcePropType => {
    if (typeof item === 'number') return item
    if (typeof item === 'string') return { uri: item }
    return typeof item.cover_image === 'string' ? { uri: item.cover_image } : require('@/assets/images/placeholder.webp')
  }

  const smoothScrollTo = (targetX: number, duration: number = 1200) => {
    if (isJumping.current) return

    if (autoScrollFrame.current) {
      cancelAnimationFrame(autoScrollFrame.current)
    }

    const startX = currentOffset.current
    const distance = targetX - startX
    const startTime = Date.now()

    const step = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const newX = startX + distance * eased

      scrollRef.current?.scrollTo({ x: newX, animated: false })
      currentOffset.current = newX

      if (progress < 1 && !isUserInteracting.current) {
        autoScrollFrame.current = requestAnimationFrame(step)
      }
    }

    autoScrollFrame.current = requestAnimationFrame(step)
  }

  useEffect(() => {
    if (shops.length > 1) {
      initialScrollTimeout.current = setTimeout(() => {
        scrollRef.current?.scrollTo({ x: width, animated: false })
        currentOffset.current = width
        setCurrentIndex(1)
      }, 100)
    }
    return () => {
      if (initialScrollTimeout.current) {
        clearTimeout(initialScrollTimeout.current)
      }
    }
  }, [shops.length])

  useEffect(() => {
    return () => {
      if (interactionTimeout.current) clearTimeout(interactionTimeout.current)
      if (autoScrollFrame.current) cancelAnimationFrame(autoScrollFrame.current)
    }
  }, [])

  useEffect(() => {
    if (shops.length <= 1) return

    const interval = setInterval(() => {
      if (isJumping.current || isUserInteracting.current) return

      const nextIndex = currentIndex + 1
      const targetX = nextIndex * width

      smoothScrollTo(targetX)
      setCurrentIndex(nextIndex)

      if (nextIndex === augmentedImages.length - 1) {
        setTimeout(() => {
          isJumping.current = true
          scrollRef.current?.scrollTo({ x: width, animated: false })
          currentOffset.current = width
          setCurrentIndex(1)
          setTimeout(() => {
            isJumping.current = false
          }, 50)
        }, 1300)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [shops.length, augmentedImages.length, currentIndex])

  const handleScroll = (event: any) => {
    if (isJumping.current) return

    const x = event.nativeEvent.contentOffset.x
    currentOffset.current = x

    if (x <= 0) {
      isJumping.current = true
      const jumpX = (augmentedImages.length - 2) * width
      scrollRef.current?.scrollTo({ x: jumpX, animated: false })
      currentOffset.current = jumpX
      setCurrentIndex(augmentedImages.length - 2)
      setTimeout(() => {
        isJumping.current = false
      }, 50)
    } else if (x >= (augmentedImages.length - 1) * width) {
      isJumping.current = true
      scrollRef.current?.scrollTo({ x: width, animated: false })
      currentOffset.current = width
      setCurrentIndex(1)
      setTimeout(() => {
        isJumping.current = false
      }, 50)
    } else {
      const idx = Math.round(x / width)
      if (idx !== currentIndex) setCurrentIndex(idx)
    }
  }

  const handleTouchStart = () => {
    isUserInteracting.current = true
    if (interactionTimeout.current) clearTimeout(interactionTimeout.current)
  }

  const handleScrollBeginDrag = () => {
    isUserInteracting.current = true
    if (interactionTimeout.current) clearTimeout(interactionTimeout.current)
  }

  const handleScrollEndDrag = () => {
    interactionTimeout.current = setTimeout(() => {
      isUserInteracting.current = false
    }, 5000)
  }

  const handleMomentumScrollEnd = (event: any) => {
    handleScroll(event)
    if (interactionTimeout.current) clearTimeout(interactionTimeout.current)
    interactionTimeout.current = setTimeout(() => {
      isUserInteracting.current = false
    }, 5000)
  }

  const handlePress = (item: ShopData) => {
    if (item?._id) {
      router.push(`/Screens/${item._id}`)
    }
  }

  if (!shops.length) {
    return null
  }

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={width}
        snapToAlignment="start"
        disableIntervalMomentum
        decelerationRate="fast"
        scrollEventThrottle={16}
        onScroll={handleScroll}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        onTouchStart={handleTouchStart}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
      >
        {augmentedImages.map((item, idx) => {
          const isObject = typeof item === 'object'
          
          const source = getImageSource(item)
          const title = isObject ? (item as ShopData).shop_name : null
          const isClickable = isObject && typeof item._id === 'string'
          const profileImage = isObject ? (item as ShopData).profile_image : null
          // console.log('Rendering banner item:', { item, isClickable })

          return (
            <Pressable
              key={`${idx}-${isObject ? item ._id : idx}`}
              onPress={() => handlePress(item)}
              disabled={!isClickable}
            >
              <View style={styles.slide}>
                <ImageBackground source={source} style={styles.card} imageStyle={styles.cardImage}>
                  <View style={styles.cardBackdrop} />
                  <View style={styles.cardGlow} />

                  <View style={styles.cardContent}>
                    <View style={styles.topRow}>
                      <View >
                        <Image source={profileImage ? { uri: profileImage } : require('@/assets/images/placeholder.webp')}
                            style={styles.profile}
                            resizeMode="cover"
                        />
                        {/* <Ionicons name="sparkles" size={12} color={Colors.primary} /> */}
                        {/* <Text style={styles.badgeText}>Featured deal</Text> */}
                      </View>

                      {shops.length > 1 && (
                        <View style={styles.counterPill}>
                          <Text style={styles.counterText}>{activeDotIndex + 1}/{shops.length}</Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.bottomContent}>
                      <View style={styles.titleBlock}>
                        <Text numberOfLines={2} style={styles.titleText}>
                          {title || 'Discover curated picks for your next order'}
                        </Text>
                        <Text style={styles.subtitleText}>{}</Text>
                      </View>

                      <View style={styles.ctaPill}>
                        <Text style={styles.ctaText}>visit shop</Text>
                        <Ionicons name="arrow-forward" size={14} color={Colors.gray} />
                      </View>
                    </View>
                  </View>
                </ImageBackground>
              </View>
            </Pressable>
          )
        })}
      </ScrollView>

      <View style={styles.paginationRow}>
        <View style={styles.dotGroup}>
          {shops.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                activeDotIndex === i ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>

        {shops.length > 1 && <Text style={styles.paginationLabel}>Swipe for more</Text>}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: -8,
    paddingTop: 4,
    paddingBottom: 6,
  },
  slide: {
    width: width,
    paddingHorizontal: 8,
  },
  card: {
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 14,
    },
    // shadowOpacity: 0.24,
    // shadowRadius: 22,
    // elevation: 8,
  },
  cardImage: {
    borderRadius: 8,
  },
  cardBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(17, 24, 39, 0.16)',
  },
  cardGlow: {
    position: 'absolute',
    right: -36,
    top: -34,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 156, 43, 0.16)',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 18,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  profile:{
        width: 50,
        height: 50,
        borderRadius: 20,
        position: 'absolute',
        top: 2,
        left: 3,
        borderWidth: 1,
        borderColor: '#fff',
    },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  badgeText: {
    color: Colors.gray,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  counterPill: {
    backgroundColor: 'rgba(17, 24, 39, 0.65)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  counterText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '700',
  },
  bottomContent: {
    gap: 12,
  },
  titleBlock: {
    gap: 8,
    maxWidth: '88%',
  },
  titleText: {
    color: 'white',
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
    letterSpacing: -0.4,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  subtitleText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    lineHeight: 18,
    maxWidth: '92%',
  },
  ctaPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.96)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  ctaText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  paginationRow: {
    marginTop: 10,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  dotGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 999,
  },
  activeDot: {
    width: 20,
    backgroundColor: Colors.primary,
  },
  inactiveDot: {
    width: 8,
    backgroundColor: 'rgba(176, 26, 26, 0.28)',
  },
  paginationLabel: {
    color: "#111827",
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
})


