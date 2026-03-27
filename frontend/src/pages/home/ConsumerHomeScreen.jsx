import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, consumerColors, fonts, shadows } from '../../common/theme';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

const categories = [
  { id: 1, name: 'Vegetables', icon: 'leaf-outline', color: '#22c55e', bg: '#dcfce7' },
  { id: 2, name: 'Fruits', icon: 'nutrition-outline', color: '#ef4444', bg: '#fee2e2' },
  { id: 3, name: 'Grains', icon: 'sunny-outline', color: '#f59e0b', bg: '#fef3c7' },
  { id: 4, name: 'Dairy', icon: 'water-outline', color: '#3b82f6', bg: '#dbeafe' },
];

export default function ConsumerHomeScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const navigation = useNavigation();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top }]} showsVerticalScrollIndicator={false}>
      {/* Welcome */}
      <View style={styles.section}>
        <Text style={styles.greeting}>Good Morning,</Text>
        <Text style={styles.name}>{user?.name ?? 'Guest'} </Text>
      </View>

      {/* Categories */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>SHOP BY CATEGORY</Text>
        </View>
        <View style={styles.categoriesRow}>
          {categories.map((cat) => (
            <TouchableOpacity 
              key={cat.id} 
              style={styles.categoryCard} 
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Market', { category: cat.name })}
            >
              <View style={[styles.categoryIconWrap, { backgroundColor: cat.bg }]}>
                <Ionicons name={cat.icon} size={24} color={cat.color} />
              </View>
              <Text style={styles.categoryName}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Fresh Picks Banner */}
      <View style={[styles.section, { marginBottom: 20 }]}>
        <LinearGradient
          colors={[consumerColors.primaryLight, consumerColors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.banner, shadows.card]}
        >
          <View style={styles.bannerDecor1} />
          <View style={styles.bannerDecor2} />
          <View style={{ zIndex: 1 }}>
            <View style={styles.bannerLabel}>
              <Ionicons name="sparkles" size={14} color={consumerColors.primary100} />
              <Text style={styles.bannerLabelText}>FRESH ARRIVALS</Text>
            </View>
            <Text style={styles.bannerTitle}>Farm to Table Deals</Text>
            <Text style={styles.bannerDesc}>Get up to 20% off on newly harvested organic tomatoes and potatoes today!</Text>
            <TouchableOpacity 
              style={styles.bannerBtn} 
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Market')}
            >
              <Text style={styles.bannerBtnText}>Shop Now →</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      {/* Why Agrow */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>WHY CHOOSE AGROW</Text>
        <View style={[styles.infoCard, shadows.soft]}>
          <View style={styles.infoRow}>
            <Ionicons name="shield-checkmark-outline" size={24} color={consumerColors.primary} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>100% Quality Assured</Text>
              <Text style={styles.infoDesc}>Directly sourced from verified local farmers.</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Ionicons name="leaf-outline" size={24} color={consumerColors.primary} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>Fresh & Organic</Text>
              <Text style={styles.infoDesc}>Harvested and delivered within 24 hours.</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  scrollContent: { paddingBottom: 30 },
  section: { marginTop: 20, paddingHorizontal: 20 },
  greeting: { fontSize: 13, color: colors.textSecondary },
  name: { fontSize: 24, fontFamily: fonts.heading, color: consumerColors.primaryDark, marginTop: 2 },
  sectionTitle: { fontSize: 11, fontFamily: fonts.bodySemiBold, color: colors.textSecondary, letterSpacing: 1, marginBottom: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  categoriesRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  categoryCard: { alignItems: 'center', width: '22%' },
  categoryIconWrap: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  categoryName: { fontSize: 11, fontFamily: fonts.bodyMedium, color: colors.textSecondary, textAlign: 'center' },
  banner: { borderRadius: 20, padding: 22, overflow: 'hidden' },
  bannerDecor1: { position: 'absolute', top: -30, right: -30, width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.05)' },
  bannerDecor2: { position: 'absolute', bottom: -20, left: -20, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.05)' },
  bannerLabel: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  bannerLabelText: { fontSize: 10, fontFamily: fonts.bodySemiBold, color: consumerColors.primary200, letterSpacing: 1 },
  bannerTitle: { fontSize: 18, fontFamily: fonts.heading, color: colors.white },
  bannerDesc: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 6, lineHeight: 18 },
  bannerBtn: { marginTop: 14, backgroundColor: colors.white, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 12, alignSelf: 'flex-start' },
  bannerBtnText: { fontSize: 12, fontFamily: fonts.bodySemiBold, color: consumerColors.primary },
  infoCard: { backgroundColor: colors.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.borderLight },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoTextContainer: { flex: 1 },
  infoTitle: { fontSize: 14, fontFamily: fonts.headingSemiBold, color: colors.textPrimary },
  infoDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.borderLight, marginVertical: 12 },
});
