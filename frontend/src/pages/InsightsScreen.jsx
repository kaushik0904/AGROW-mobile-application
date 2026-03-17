import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, shadows } from '../common/theme';

const priceData = [
  { month: 'Jul', value: 65 },
  { month: 'Aug', value: 45 },
  { month: 'Sep', value: 80 },
  { month: 'Oct', value: 55 },
  { month: 'Nov', value: 90 },
  { month: 'Dec', value: 70 },
];

const recommendations = [
  { id: 1, type: 'bullish', crop: 'Tomatoes', text: 'Sell tomatoes in the local market this week — model predicts a short-term price increase of 8% due to festival demand.', confidence: 87 },
  { id: 2, type: 'bearish', crop: 'Onions', text: 'Hold onion inventory for 2 more weeks. Prices expected to recover after current supply glut eases.', confidence: 72 },
];

export default function InsightsScreen() {
  const maxValue = Math.max(...priceData.map((d) => d.value));
  const insets = useSafeAreaInsets();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top }]} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>AI Insights</Text>
        <Text style={styles.subtitle}>Market intelligence powered by AI</Text>
      </View>

      {/* Price Trend Chart */}
      <View style={styles.section}>
        <View style={[styles.chartCard, shadows.card]}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={styles.chartTitle}>6-Month Price Trend</Text>
              <Text style={styles.chartSubtitle}>Tomatoes — Nashik Region</Text>
            </View>
            <View style={styles.trendBadge}>
              <Ionicons name="trending-up" size={14} color="#16a34a" />
              <Text style={styles.trendText}>+8%</Text>
            </View>
          </View>

          <View style={styles.chartArea}>
            {priceData.map((item, i) => (
              <View key={item.month} style={styles.barCol}>
                <Text style={styles.barValue}>₹{item.value}</Text>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: `${(item.value / maxValue) * 100}%`,
                        backgroundColor: i === priceData.length - 2 ? colors.primary : i === priceData.length - 1 ? colors.primaryLight : 'rgba(22,101,52,0.35)',
                      },
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{item.month}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* AI Recommendations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AI RECOMMENDATIONS</Text>
        {recommendations.map((rec) => (
          <View key={rec.id} style={[styles.recCard, shadows.soft]}>
            <View style={styles.recTop}>
              <View style={[styles.recIcon, { backgroundColor: rec.type === 'bullish' ? colors.emerald100 : colors.amber100 }]}>
                <Ionicons
                  name={rec.type === 'bullish' ? 'trending-up' : 'trending-down'}
                  size={20}
                  color={rec.type === 'bullish' ? '#16a34a' : colors.amber600}
                />
              </View>
              <View style={styles.recContent}>
                <View style={styles.recTitleRow}>
                  <Text style={styles.recCrop}>{rec.crop}</Text>
                  <View style={[styles.recTypeBadge, { backgroundColor: rec.type === 'bullish' ? colors.emerald100 : colors.amber100 }]}>
                    <Text style={[styles.recTypeText, { color: rec.type === 'bullish' ? '#15803d' : colors.amber700 }]}>
                      {rec.type === 'bullish' ? '📈 Sell' : '⏳ Hold'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.recText}>{rec.text}</Text>

                {/* Confidence */}
                <View style={styles.confRow}>
                  <Ionicons name="bulb-outline" size={12} color={colors.textMuted} />
                  <Text style={styles.confLabel}>Confidence:</Text>
                  <View style={styles.confTrack}>
                    <View
                      style={[
                        styles.confFill,
                        {
                          width: `${rec.confidence}%`,
                          backgroundColor: rec.type === 'bullish' ? '#22c55e' : colors.amber500,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.confValue}>{rec.confidence}%</Text>
                </View>
              </View>
            </View>

            <View style={styles.recActions}>
              <TouchableOpacity style={styles.recActionBtn} activeOpacity={0.7}>
                <Ionicons name="thumbs-up-outline" size={16} color={colors.primary} />
                <Text style={[styles.recActionText, { color: colors.primary }]}>Accept</Text>
              </TouchableOpacity>
              <View style={styles.recDivider} />
              <TouchableOpacity style={styles.recActionBtn} activeOpacity={0.7}>
                <Ionicons name="chatbubble-outline" size={16} color={colors.textSecondary} />
                <Text style={[styles.recActionText, { color: colors.textSecondary }]}>Discuss</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  scrollContent: { paddingBottom: 30 },
  header: { paddingHorizontal: 20, paddingTop: 20 },
  title: { fontSize: 24, fontFamily: fonts.heading, color: colors.primaryDark },
  subtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  section: { paddingHorizontal: 20, marginTop: 20 },
  sectionTitle: { fontSize: 11, fontFamily: fonts.bodySemiBold, color: colors.textSecondary, letterSpacing: 1, marginBottom: 12 },
  chartCard: { backgroundColor: colors.card, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: colors.borderLight },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  chartTitle: { fontSize: 15, fontFamily: fonts.headingSemiBold, color: colors.textPrimary },
  chartSubtitle: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  trendBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.emerald50, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  trendText: { fontSize: 12, fontFamily: fonts.bodySemiBold, color: '#16a34a' },
  chartArea: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 130, gap: 8 },
  barCol: { flex: 1, alignItems: 'center', gap: 4 },
  barValue: { fontSize: 9, fontFamily: fonts.bodySemiBold, color: colors.textPrimary },
  barTrack: { flex: 1, width: '100%', justifyContent: 'flex-end' },
  bar: { width: '100%', borderTopLeftRadius: 6, borderTopRightRadius: 6, minHeight: 8 },
  barLabel: { fontSize: 10, fontFamily: fonts.bodyMedium, color: colors.textMuted },
  recCard: { backgroundColor: colors.card, borderRadius: 18, borderWidth: 1, borderColor: colors.borderLight, overflow: 'hidden', marginBottom: 14 },
  recTop: { flexDirection: 'row', padding: 18, gap: 12 },
  recIcon: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  recContent: { flex: 1 },
  recTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  recCrop: { fontSize: 15, fontFamily: fonts.headingSemiBold, color: colors.textPrimary },
  recTypeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  recTypeText: { fontSize: 9, fontFamily: fonts.bodySemiBold, textTransform: 'uppercase' },
  recText: { fontSize: 13, color: colors.textSecondary, marginTop: 8, lineHeight: 19 },
  confRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
  confLabel: { fontSize: 10, color: colors.textMuted },
  confTrack: { flex: 1, height: 5, backgroundColor: colors.gray100, borderRadius: 10, overflow: 'hidden' },
  confFill: { height: '100%', borderRadius: 10 },
  confValue: { fontSize: 10, fontFamily: fonts.bodySemiBold, color: colors.textPrimary },
  recActions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.borderLight },
  recActionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12 },
  recActionText: { fontSize: 13, fontFamily: fonts.bodyMedium },
  recDivider: { width: 1, backgroundColor: colors.borderLight },
});
