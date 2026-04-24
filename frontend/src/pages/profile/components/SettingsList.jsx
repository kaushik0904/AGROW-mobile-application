import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, shadows } from '../../../common/theme';

export default function SettingsList({ items, toggles, onToggle, themeColors, onPressItem }) {
  return (
    <View style={styles.settingsSection}>
      <Text style={styles.sectionTitle}>ACCOUNT SETTINGS</Text>
      <View style={[styles.settingsCard, shadows.soft]}>
        {items.map((item, index) => (
          <View key={item.key}>
            <TouchableOpacity 
              style={styles.settingRow} 
              activeOpacity={0.7} 
              disabled={item.type !== 'link'}
              onPress={() => item.type === 'link' && onPressItem && onPressItem(item.key)}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: themeColors.primary50 }]}>
                  <Ionicons name={item.icon} size={16} color={themeColors.primary} />
                </View>
                <Text style={styles.settingLabel}>{item.label}</Text>
              </View>
              {item.type === 'link' ? (
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              ) : (
                <TouchableOpacity
                  onPress={() => onToggle && onToggle(item.key)}
                  activeOpacity={0.8}
                  style={[styles.toggle, toggles[item.key] && [styles.toggleOn, { backgroundColor: themeColors.primary }]]}
                >
                  <View style={[styles.toggleKnob, toggles[item.key] && styles.toggleKnobOn]} />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
            {index < items.length - 1 && <View style={styles.divider} />}
          </View>
        ))}
        <View style={styles.divider} />
        <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: themeColors.primary50 }]}>
              <Ionicons name="shield-outline" size={16} color={themeColors.primary} />
            </View>
            <Text style={styles.settingLabel}>Security</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  settingsSection: { paddingHorizontal: 20, marginTop: 24 },
  sectionTitle: { fontSize: 11, fontFamily: fonts.bodySemiBold, color: colors.textSecondary, letterSpacing: 1, marginBottom: 12 },
  settingsCard: { backgroundColor: colors.card, borderRadius: 18, borderWidth: 1, borderColor: colors.borderLight, overflow: 'hidden' },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingIcon: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  settingLabel: { fontSize: 14, fontFamily: fonts.bodyMedium, color: colors.textPrimary },
  toggle: { width: 44, height: 24, borderRadius: 12, backgroundColor: colors.gray200, padding: 2 },
  toggleOn: { backgroundColor: colors.primary },
  toggleKnob: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.white },
  toggleKnobOn: { transform: [{ translateX: 20 }] },
  divider: { height: 1, backgroundColor: colors.borderLight, marginHorizontal: 16 },
});
