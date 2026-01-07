import { useTheme } from '@/contexts/ThemeContext';
import { useAuthStore } from '@/store/useAuthStore';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SellerLanding() {
  const { colors, theme } = useTheme();
  const styles = useMemo(() => appStyles(colors), [colors]);
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [checkingSeller, setCheckingSeller] = useState(true);
  const [isSeller, setIsSeller] = useState(false);

  useEffect(() => {
    // Check if user is seller by checking their role or querying API
    if (isAuthenticated && user?.role === 'seller') {
      setIsSeller(true);
    }
    setCheckingSeller(false);
  }, [isAuthenticated, user]);

  const scrollViewRef = useRef<ScrollView>(null);
  const targetRef = useRef<View>(null);

  if (checkingSeller) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const GoToLearnMore = () => {
    targetRef.current?.measureLayout(
      scrollViewRef.current as any,
      (_x, y) => {
        scrollViewRef.current?.scrollTo({
          y,
          animated: true,
        });
      }
    );
  };


  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
      ref={scrollViewRef}
    >
      {/* ================= HERO ================= */}
      <View style={styles.hero}>
        <TouchableOpacity onPress={() => router.back()} style={{
          position: 'absolute',
          top: 20,
          left: 20
        }}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>

        <View style={styles.heroBadge}>
          <FontAwesome5 name="crown" size={12} color={colors.primary} />
          <Text style={styles.heroBadgeText}>
            Join 50,000+ Successful Sellers
          </Text>
        </View>

        <Text style={styles.heroTitle}>
          Turn Your Passion Into{'\n'}
          <Text style={{ color: colors.primary }}>A Thriving Business</Text>
        </Text>

        <Text style={styles.heroDesc}>
          Join ShopCheap today and reach millions of customers. No upfront
          costs, powerful tools, and dedicated seller support.
        </Text>

        {isSeller ? (
          <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/Seller/(SellerDashboard)')}>
            <Ionicons name="speedometer-outline" size={20} color={colors.light} />
            <Text style={styles.primaryBtnText}>Go to Dashboard</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/Seller/register')}>
            <Ionicons name="add-circle-outline" size={20} color={colors.light} />
            <Text style={styles.primaryBtnText}>Start Selling Today</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.secondaryBtn} onPress={GoToLearnMore}>
          <Text style={styles.secondaryBtnText}>Learn More</Text>
        </TouchableOpacity>
      </View>

      {/* ================= STATS ================= */}
      <View style={styles.statsGrid}>
        {[
          ['50K+', 'Active Sellers'],
          ['2M+', 'Happy Customers'],
          ['98%', 'Satisfaction Rate'],
          ['$10M+', 'Monthly Sales'],
        ].map(([value, label]) => (
          <View key={label} style={styles.statBox}>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
          </View>
        ))}
      </View>

      {/* ================= WHY SELL ================= */}
      <View style={styles.section}>
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <Text style={styles.sectionTitle}>
            Why Sell on{' '}
            <Text style={{ color: colors.primary }}>ShopCheap?</Text>
          </Text>
          <Text style={styles.sectionSub}>
            Everything you need to start, scale, and grow your business.
          </Text>
        </View>

        <View style={styles.cardsContainer}>
          {[
            ['globe', 'Global Reach', 'Access millions of customers worldwide'],
            ['shield-alt', 'Secure Payments', 'Get paid on time, every time'],
            ['chart-line', 'Powerful Analytics', 'Make data-driven decisions'],
            ['headset', '24/7 Support', 'We’re always here to help'],
            ['bolt', 'Easy Setup', 'Launch your store in minutes'],
            ['arrow-up', 'Marketing Tools', 'Boost visibility & sales'],
          ].map(([icon, title, desc]) => (
            <View key={title} style={styles.infoCard}>
              <View style={styles.iconCircle}>
                <FontAwesome5 name={icon as any} size={16} color={colors.primary} />
              </View>
              <Text style={styles.cardTitle}>{title}</Text>
              <Text style={styles.cardDesc}>{desc}</Text>
            </View>
          ))}
        </View>

      </View>

      {/* ================= STEPS ================= */}
      <View style={styles.section} ref={targetRef}>
        <Text style={[styles.sectionTitle, { textAlign: 'center' }]}>
          Start Selling in{' '}
          <Text style={{ color: colors.primary }}>4 Easy Steps</Text>
        </Text>

        {[
          ['Create Account', 'Sign up & complete profile'],
          ['Set Up Store', 'Customize your storefront'],
          ['List Products', 'Upload products & pricing'],
          ['Start Selling', 'Go live & receive orders'],
        ].map((step, i) => (
          <View key={i} style={styles.stepRow}>
            <View style={styles.stepCircle}>
              <Text style={styles.stepNumber}>{i + 1}</Text>
            </View>
            <View style={styles.stepCard}>
              <Text style={styles.stepTitle}>{step[0]}</Text>
              <Text style={styles.stepDesc}>{step[1]}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* ================= PRICING ================= */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Simple, Transparent{' '}
          <Text style={{ color: colors.primary }}>Pricing</Text>
        </Text>

        {[
          'No monthly subscription fees',
          'Pay only when you sell',
          'Competitive commission rates',
          'Unlimited product listings',
        ].map((item) => (
          <View key={item} style={styles.checkRow}>
            <Ionicons name="checkmark-circle" size={18} color="#22c55e" />
            <Text style={styles.checkText}>{item}</Text>
          </View>
        ))}

        <View style={styles.pricingCard}>
          <Text style={styles.pricingTitle}>Commission Based</Text>
          <Text style={styles.pricingValue}>
            5% <Text style={styles.pricingSmall}>per sale</Text>
          </Text>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.push(isSeller ? '/Seller/(SellerDashboard)' : '/Seller/register')}
          >
            <Text style={styles.primaryBtnText}>
              {isSeller ? "Go to Dashboard" : "Get Started Free"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ================= CTA ================= */}
      <View style={styles.cta}>
        <Text style={styles.ctaTitle}>Ready to Start Your Journey?</Text>
        <Text style={styles.ctaDesc}>
          Create your store today and reach customers worldwide.
        </Text>

        <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/Seller/register')}>
          <Text style={styles.primaryBtnText}>Create Your Store</Text>
        </TouchableOpacity>

        {/* <TouchableOpacity style={styles.secondaryOutlineBtn}>
          <Text style={styles.secondaryOutlineText}>Already a Seller? Sign In</Text>
        </TouchableOpacity> */}
      </View>
    </ScrollView>
  );
}

/* ================= STYLES ================= */

const appStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    hero: {
      padding: 24,
      borderBottomLeftRadius: 48,
      borderBottomRightRadius: 48,
      backgroundColor: '#654925',
      alignItems: 'center',
    },
    heroBadge: {
      flexDirection: 'row',
      gap: 8,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.primary,
      marginBottom: 16,
    },
    heroBadgeText: {
      color: colors.primary,
      fontSize: 11,
      fontWeight: '600',
    },
    heroTitle: {
      color: '#fff',
      fontSize: 28,
      fontWeight: '800',
      textAlign: 'center',
      marginBottom: 12,
    },
    heroDesc: {
      color: '#d1d5db',
      textAlign: 'center',
      fontSize: 14,
      marginBottom: 20,
    },

    primaryBtn: {
      flexDirection: 'row',
      gap: 8,
      backgroundColor: colors.primary,
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 30,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
      width: '100%',
    },
    primaryBtnText: {
      color: '#fff',
      fontWeight: '700',
    },
    secondaryBtn: {
      borderWidth: 1,
      borderColor: '#ffffff40',
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 30,
      width: '100%',
      alignItems: 'center',
    },
    secondaryBtnText: {
      color: '#fff',
    },

    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      padding: 20,
    },
    statBox: {
      width: '50%',
      alignItems: 'center',
      marginBottom: 20,
      // backgroundColor:colors.card
    },
    statValue: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.primary,
    },
    statLabel: {
      fontSize: 10,
      color: colors.grayish,
      marginTop: 4,
      textTransform: 'uppercase',
    },

    section: {
      padding: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 8,
      textAlign: 'center'
    },
    sectionSub: {
      color: colors.grayish,
      marginBottom: 16,
    },
    cardsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between', // spreads cards evenly
      marginHorizontal: -8, // optional: adjust spacing
      margin: 10
    },
    infoCard: {
      backgroundColor: colors.card,
      padding: 16,
      borderRadius: 20,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.borderLine,
      justifyContent: 'center',
      alignItems: 'center',
      width: '48%'
    },
    iconCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary + '20',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },
    cardTitle: {
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
      textAlign: 'center',
      justifyContent: 'center'
    },
    cardDesc: {
      fontSize: 12,
      color: colors.grayish,
      textAlign: 'center',
      justifyContent: 'center'
    },

    stepRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 16,
    },
    stepCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepNumber: {
      color: '#fff',
      fontWeight: '800',
    },
    stepCard: {
      marginLeft: 12,
      backgroundColor: colors.card,
      padding: 14,
      borderRadius: 14,
      flex: 1,
    },
    stepTitle: {
      fontWeight: '700',
      color: colors.text,
    },
    stepDesc: {
      fontSize: 12,
      color: colors.grayish,
    },

    checkRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 8,
    },
    checkText: {
      fontSize: 13,
      color: colors.text,
    },

    pricingCard: {
      backgroundColor: colors.gray,
      padding: 24,
      borderRadius: 28,
      marginTop: 16,
      alignItems: 'center',
    },
    pricingTitle: {
      color: '#fff',
      fontWeight: '700',
      marginBottom: 6,
    },
    pricingValue: {
      fontSize: 40,
      fontWeight: '800',
      color: colors.primary,
    },
    pricingSmall: {
      fontSize: 12,
      color: '#9ca3af',
    },

    cta: {
      padding: 24,
      backgroundColor: colors.gray,
      borderTopLeftRadius: 48,
      borderTopRightRadius: 48,
      alignItems: 'center',
    },
    ctaTitle: {
      fontSize: 24,
      fontWeight: '800',
      color: '#fff',
      marginBottom: 8,
      textAlign: 'center',
    },
    ctaDesc: {
      color: '#9ca3af',
      fontSize: 13,
      marginBottom: 20,
      textAlign: 'center',
    },
    secondaryOutlineBtn: {
      borderWidth: 1,
      borderColor: '#374151',
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 14,
      marginTop: 8,
    },
    secondaryOutlineText: {
      color: '#fff',
      fontSize: 13,
    },
  });
