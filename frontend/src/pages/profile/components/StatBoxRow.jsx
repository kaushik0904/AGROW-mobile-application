import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, shadows } from '../../../common/theme';

export default function StatBoxRow({ stats, themeColors }) {
  if (!stats || stats.length === 0) return null;

  return (
    <View style={styles.statsRow}>
      {stats.map((stat, index) => (
        <View key={index} style={[styles.statCard, shadows.soft]}>
          <Text style={[styles.statValue, { color: themeColors.primary }]}>{stat.value}</Text>
          <Text style={styles.statLabel}>{stat.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginTop: 16 },
  statCard: { flex: 1, backgroundColor: colors.card, borderRadius: 16, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: colors.borderLight },
  statValue: { fontSize: 18, fontFamily: fonts.heading },
  statLabel: { fontSize: 10, color: colors.textMuted, marginTop: 2 },
});
