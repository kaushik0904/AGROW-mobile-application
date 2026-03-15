import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, shadows } from '../common/theme';
import { useAuth } from '../context/AuthContext';

const settingsItems = [
  { label: 'Notifications', icon: 'notifications-outline', key: 'notifications', defaultOn: true },
  { label: 'Price Alerts', icon: 'trending-up-outline', key: 'priceAlerts', defaultOn: true },
  { label: 'Share Profile', icon: 'share-social-outline', key: 'shareProfile', defaultOn: false },
];

export default function ProfileScreen() {
  const [toggles, setToggles] = useState({
    notifications: true,
    priceAlerts: true,
    shareProfile: false,
  });
  const insets = useSafeAreaInsets();
  const { logout } = useAuth();

  const handleToggle = (key) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top }]} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      {/* Profile Card */}
      <View style={[styles.profileCard, shadows.card]}>
        <LinearGradient
          colors={[colors.primary, colors.primaryDark, '#064e3b']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.coverBg}
        />
        <View style={styles.profileBody}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=60' }}
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.cameraBtn} activeOpacity={0.8}>
              <Ionicons name="camera" size={14} color={colors.white} />
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>Ramesh Kulkarni</Text>
          <Text style={styles.farmName}>Kulkarni Farms</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="resize-outline" size={12} color={colors.textMuted} />
              <Text style={styles.metaText}>12 hectares</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={12} color={colors.textMuted} />
              <Text style={styles.metaText}>Nashik</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="star" size={12} color="#facc15" />
              <Text style={styles.metaText}>4.8</Text>
            </View>
          </View>

          <View style={styles.contactRow}>
            <TouchableOpacity style={styles.msgBtn} activeOpacity={0.8}>
              <Ionicons name="chatbubble-outline" size={16} color={colors.white} />
              <Text style={styles.msgText}>Message</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.callBtn} activeOpacity={0.8}>
              <Ionicons name="call-outline" size={16} color={colors.primary} />
              <Text style={styles.callText}>Call</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {[
          { label: 'Listings', value: '12' },
          { label: 'Sold', value: '47' },
          { label: 'Earnings', value: '₹1.2L' },
        ].map((stat) => (
          <View key={stat.label} style={[styles.statCard, shadows.soft]}>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Account Settings */}
      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>ACCOUNT SETTINGS</Text>
        <View style={[styles.settingsCard, shadows.soft]}>
          {settingsItems.map((item, index) => (
            <View key={item.key}>
              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <View style={styles.settingIcon}>
                    <Ionicons name={item.icon} size={16} color={colors.primary} />
                  </View>
                  <Text style={styles.settingLabel}>{item.label}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleToggle(item.key)}
                  activeOpacity={0.8}
                  style={[styles.toggle, toggles[item.key] && styles.toggleOn]}
                >
                  <View style={[styles.toggleKnob, toggles[item.key] && styles.toggleKnobOn]} />
                </TouchableOpacity>
              </View>
              {index < settingsItems.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
          <View style={styles.divider} />
          <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
            <View style={styles.settingLeft}>
              <View style={styles.settingIcon}>
                <Ionicons name="shield-outline" size={16} color={colors.primary} />
              </View>
              <Text style={styles.settingLabel}>Security</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.8} onPress={logout}>
          <Ionicons name="log-out-outline" size={16} color={colors.danger} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  scrollContent: { paddingBottom: 30 },
  header: { paddingHorizontal: 20, paddingTop: 20 },
  title: { fontSize: 24, fontFamily: fonts.heading, color: colors.primaryDark },
  profileCard: { marginHorizontal: 20, marginTop: 20, backgroundColor: colors.card, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: colors.borderLight },
  coverBg: { height: 90 },
  profileBody: { paddingHorizontal: 20, paddingBottom: 20 },
  avatarContainer: { marginTop: -36, marginBottom: 12 },
  avatar: { width: 72, height: 72, borderRadius: 18, borderWidth: 3, borderColor: colors.white },
  cameraBtn: { position: 'absolute', bottom: -2, left: 56, width: 28, height: 28, borderRadius: 8, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  userName: { fontSize: 20, fontFamily: fonts.heading, color: colors.textPrimary },
  farmName: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  metaRow: { flexDirection: 'row', gap: 14, marginTop: 10 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: colors.textMuted },
  contactRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  msgBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.primary, paddingVertical: 11, borderRadius: 12 },
  msgText: { fontSize: 13, fontFamily: fonts.bodyMedium, color: colors.white },
  callBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.primary50, paddingVertical: 11, borderRadius: 12 },
  callText: { fontSize: 13, fontFamily: fonts.bodyMedium, color: colors.primary },
  statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginTop: 16 },
  statCard: { flex: 1, backgroundColor: colors.card, borderRadius: 16, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: colors.borderLight },
  statValue: { fontSize: 18, fontFamily: fonts.heading, color: colors.primary },
  statLabel: { fontSize: 10, color: colors.textMuted, marginTop: 2 },
  settingsSection: { paddingHorizontal: 20, marginTop: 24 },
  sectionTitle: { fontSize: 11, fontFamily: fonts.bodySemiBold, color: colors.textSecondary, letterSpacing: 1, marginBottom: 12 },
  settingsCard: { backgroundColor: colors.card, borderRadius: 18, borderWidth: 1, borderColor: colors.borderLight, overflow: 'hidden' },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: colors.primary50, justifyContent: 'center', alignItems: 'center' },
  settingLabel: { fontSize: 14, fontFamily: fonts.bodyMedium, color: colors.textPrimary },
  toggle: { width: 44, height: 24, borderRadius: 12, backgroundColor: colors.gray200, padding: 2 },
  toggleOn: { backgroundColor: colors.primary },
  toggleKnob: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.white },
  toggleKnobOn: { transform: [{ translateX: 20 }] },
  divider: { height: 1, backgroundColor: colors.borderLight, marginHorizontal: 16 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16, backgroundColor: colors.red50, paddingVertical: 14, borderRadius: 16 },
  logoutText: { fontSize: 14, fontFamily: fonts.bodyMedium, color: colors.danger },
});
