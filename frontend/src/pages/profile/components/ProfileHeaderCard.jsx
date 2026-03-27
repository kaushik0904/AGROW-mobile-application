import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, shadows } from '../../../common/theme';

export default function ProfileHeaderCard({ 
  themeColors, 
  gradientColors, 
  avatarUri, 
  title, 
  subtitle, 
  metadata, 
  followStats, 
  onEditPress 
}) {
  return (
    <View style={[styles.profileCard, shadows.card]}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.coverBg}
      />
      <View style={styles.profileBody}>
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: avatarUri || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=60' }}
            style={styles.avatar}
          />
          <TouchableOpacity style={[styles.cameraBtn, { backgroundColor: themeColors.primary }]} activeOpacity={0.8} onPress={onEditPress}>
            <Ionicons name="pencil" size={14} color={colors.white} />
          </TouchableOpacity>
        </View>

        <Text style={styles.userName}>{title}</Text>
        {subtitle ? <Text style={styles.farmName}>{subtitle}</Text> : null}

        {metadata && metadata.length > 0 && (
          <View style={styles.metaRow}>
            {metadata.map((meta, index) => meta.show ? (
              <View key={index} style={styles.metaItem}>
                <Ionicons name={meta.icon} size={12} color={meta.iconColor || colors.textMuted} />
                <Text style={styles.metaText}>{meta.text}</Text>
              </View>
            ) : null)}
          </View>
        )}

        {followStats && (
          <View style={styles.contactRow}>
            <View style={styles.followBox}>
              <Text style={styles.followNumber}>{followStats.followers || 0}</Text>
              <Text style={styles.followLabel}>Followers</Text>
            </View>
            <View style={styles.followBoxDivider} />
            <View style={styles.followBox}>
              <Text style={styles.followNumber}>{followStats.following || 0}</Text>
              <Text style={styles.followLabel}>Following</Text>
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.editBtn} activeOpacity={0.8} onPress={onEditPress}>
          <Text style={styles.editBtnText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  profileCard: { marginHorizontal: 20, marginTop: 20, backgroundColor: colors.card, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: colors.borderLight },
  coverBg: { height: 90 },
  profileBody: { paddingHorizontal: 20, paddingBottom: 20 },
  avatarContainer: { marginTop: -36, marginBottom: 12 },
  avatar: { width: 72, height: 72, borderRadius: 18, borderWidth: 3, borderColor: colors.white },
  cameraBtn: { position: 'absolute', bottom: -2, left: 56, width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  userName: { fontSize: 20, fontFamily: fonts.heading, color: colors.textPrimary },
  farmName: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  metaRow: { flexDirection: 'row', gap: 14, marginTop: 10 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: colors.textMuted },
  contactRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16, backgroundColor: colors.gray100, borderRadius: 12, paddingVertical: 12 },
  followBox: { flex: 1, alignItems: 'center' },
  followBoxDivider: { width: 1, height: '60%', backgroundColor: colors.borderLight },
  followNumber: { fontSize: 18, fontFamily: fonts.headingSemiBold, color: colors.textPrimary },
  followLabel: { fontSize: 12, fontFamily: fonts.bodyMedium, color: colors.textSecondary, marginTop: 2 },
  editBtn: { marginTop: 16, borderWidth: 1, borderColor: colors.borderLight, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  editBtnText: { fontSize: 14, fontFamily: fonts.bodySemiBold, color: colors.textPrimary },
});
