import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, consumerColors, fonts, shadows } from '../common/theme';
import { useAuth } from '../context/AuthContext';

export default function CropCard({ crop, onEdit, onRemove, isOwner }) {
  const { user } = useAuth();
  const themeColors = user?.category === 'consumer' ? consumerColors : colors;
  return (
    <View style={[styles.container, shadows.soft]}>
      <View style={styles.row}>
        <View style={[styles.imageWrapper, { borderColor: themeColors.primary100 }]}>
          <Image source={{ uri: crop.image_url || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200&q=80' }} style={styles.image} />
        </View>
        <View style={styles.info}>
          <Text style={[styles.name, { color: themeColors.primaryDark }]}>{crop.variety ? `${crop.variety} ${crop.crop_type}` : crop.crop_type}</Text>
          <Text style={[styles.farmer, { color: themeColors.primary }]}>By: {crop.farmer_name}</Text>
          <Text style={styles.detail}>
            Listed: <Text style={styles.bold}>{crop.quantity} kg</Text> |{' '}
            <Text style={[styles.price, { color: themeColors.primary }]}>₹{crop.price_per_kg}/kg</Text>
          </Text>
          <View style={styles.expiryRow}>
            <Ionicons name="calendar-outline" size={12} color={colors.textMuted} />
            <Text style={styles.expiry}>Harvest: {crop.harvest_date || 'N/A'}</Text>
          </View>
        </View>
          <View style={styles.actions}>
            {isOwner ? (
              <>
                <TouchableOpacity style={styles.editBtn} activeOpacity={0.8} onPress={onEdit}>
                  <Ionicons name="pencil-outline" size={12} color={colors.white} />
                  <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.removeBtn} activeOpacity={0.7} onPress={onRemove}>
                  <Ionicons name="trash-outline" size={12} color={colors.danger} />
                  <Text style={styles.removeText}>Remove</Text>
                </TouchableOpacity>
              </>
            ) : null}
          </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  imageWrapper: {
    width: 60,
    height: 60,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.primary100,
  },
  image: { width: '100%', height: '100%' },
  info: { flex: 1 },
  name: { fontSize: 15, fontFamily: fonts.headingSemiBold, color: colors.primaryDark },
  farmer: { fontSize: 11, color: colors.primary, fontFamily: fonts.bodyMedium, marginTop: 1 },
  detail: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
  bold: { fontFamily: fonts.bodyMedium, color: colors.textPrimary },
  price: { fontFamily: fonts.bodySemiBold, color: colors.primary },
  expiryRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  expiry: { fontSize: 11, color: colors.textMuted },
  actions: { gap: 8, alignItems: 'center' },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  editText: { fontSize: 11, fontFamily: fonts.bodyMedium, color: colors.white },
  removeBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  removeText: { fontSize: 11, fontFamily: fonts.bodyMedium, color: colors.danger },
});
