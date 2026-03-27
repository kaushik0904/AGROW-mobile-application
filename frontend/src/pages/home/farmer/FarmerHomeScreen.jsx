import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, shadows } from '../../../common/theme';
import WeatherWidget from '../../../components/WeatherWidget';
import { useAuth } from '../../../context/AuthContext';

const quickStats = [
  { label: 'Active Listings', value: '3', icon: 'basket-outline', gradient: ['#22c55e', '#166534'] },
  { label: 'Total Sales', value: '₹24,500', icon: 'trending-up-outline', gradient: ['#f59e0b', '#ea580c'] },
  { label: 'Community', value: '12', icon: 'people-outline', gradient: ['#3b82f6', '#4f46e5'] },
];

const tips = [
  { title: 'Best time to sell tomatoes', desc: 'Market prices peak during festival season. List now for maximum profit.', tag: 'Market Tip' },
  { title: 'Drip irrigation guide', desc: 'Save 40% water with modern drip techniques. Read the full guide.', tag: 'Resource' },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top }]} showsVerticalScrollIndicator={false}>
      {/* Welcome */}
      <View style={styles.section}>
        <Text style={styles.greeting}>Welcome to AGROW,</Text>
        <Text style={styles.name}>{user?.name ?? 'Farmer'} </Text>
      </View>

      <WeatherWidget />

      {/* Quick Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>QUICK STATS</Text>
        <View style={styles.statsRow}>
          {quickStats.map((stat) => (
            <View key={stat.label} style={[styles.statCard, shadows.soft]}>
              <LinearGradient colors={stat.gradient} style={styles.statIcon}>
                <Ionicons name={stat.icon} size={18} color={colors.white} />
              </LinearGradient>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Tips */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>TIPS & RESOURCES</Text>
          <TouchableOpacity style={styles.viewAll}>
            <Text style={styles.viewAllText}>View All</Text>
            <Ionicons name="arrow-forward" size={12} color={colors.primary} />
          </TouchableOpacity>
        </View>
        {tips.map((tip) => (
          <TouchableOpacity key={tip.title} style={[styles.tipCard, shadows.soft]} activeOpacity={0.8}>
            <View style={styles.tipContent}>
              <View style={styles.tipTag}>
                <Text style={styles.tipTagText}>{tip.tag}</Text>
              </View>
              <Text style={styles.tipTitle}>{tip.title}</Text>
              <Text style={styles.tipDesc}>{tip.desc}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Season Banner */}
      <View style={[styles.section, { marginBottom: 20 }]}>
        <LinearGradient
          colors={[colors.primary, colors.primaryDark, '#064e3b']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.banner, shadows.card]}
        >
          <View style={styles.bannerDecor1} />
          <View style={styles.bannerDecor2} />
          <View style={{ zIndex: 1 }}>
            <View style={styles.bannerLabel}>
              <Ionicons name="leaf" size={14} color={colors.primaryLight} />
              <Text style={styles.bannerLabelText}>RABI SEASON</Text>
            </View>
            <Text style={styles.bannerTitle}>Wheat & Mustard are trending</Text>
            <Text style={styles.bannerDesc}>List your Rabi crops now to reach 2,400+ active buyers in your region.</Text>
            <TouchableOpacity style={styles.bannerBtn} activeOpacity={0.8}>
              <Text style={styles.bannerBtnText}>List Crop →</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  scrollContent: { paddingBottom: 30 },
  section: { marginTop: 20, paddingHorizontal: 20 },
  greeting: { fontSize: 13, color: colors.textSecondary },
  name: { fontSize: 24, fontFamily: fonts.heading, color: colors.primaryDark, marginTop: 2 },
  sectionTitle: { fontSize: 11, fontFamily: fonts.bodySemiBold, color: colors.textSecondary, letterSpacing: 1 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  viewAll: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  viewAllText: { fontSize: 12, fontFamily: fonts.bodyMedium, color: colors.primary },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  statIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  statValue: { fontSize: 18, fontFamily: fonts.heading, color: colors.textPrimary },
  statLabel: { fontSize: 9, color: colors.textMuted, marginTop: 2 },
  tipCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  tipContent: { flex: 1 },
  tipTag: { backgroundColor: colors.primary50, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 6 },
  tipTagText: { fontSize: 9, fontFamily: fonts.bodySemiBold, color: colors.primary, textTransform: 'uppercase', letterSpacing: 0.5 },
  tipTitle: { fontSize: 14, fontFamily: fonts.headingSemiBold, color: colors.textPrimary },
  tipDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 4, lineHeight: 18 },
  banner: { borderRadius: 20, padding: 22, overflow: 'hidden' },
  bannerDecor1: { position: 'absolute', top: -30, right: -30, width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.05)' },
  bannerDecor2: { position: 'absolute', bottom: -20, left: -20, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.05)' },
  bannerLabel: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  bannerLabelText: { fontSize: 10, fontFamily: fonts.bodySemiBold, color: colors.primary200, letterSpacing: 1 },
  bannerTitle: { fontSize: 18, fontFamily: fonts.heading, color: colors.white },
  bannerDesc: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 6, lineHeight: 18 },
  bannerBtn: { marginTop: 14, backgroundColor: colors.white, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 12, alignSelf: 'flex-start' },
  bannerBtnText: { fontSize: 12, fontFamily: fonts.bodySemiBold, color: colors.primary },
});
