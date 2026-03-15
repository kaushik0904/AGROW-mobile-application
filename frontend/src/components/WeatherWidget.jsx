import React from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, shadows } from '../common/theme';

export default function WeatherWidget() {
  return (
    <View style={[styles.container, shadows.card]}>
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=60' }}
        style={styles.background}
        imageStyle={styles.backgroundImage}
      >
        <View style={styles.overlay} />
        <View style={styles.content}>
          <View style={styles.leftSection}>
            <View style={styles.tempRow}>
              <Text style={styles.temp}>28°</Text>
              <Text style={styles.unit}>C</Text>
            </View>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={12} color="rgba(255,255,255,0.7)" />
              <Text style={styles.location}>Nashipur, West Bengal</Text>
            </View>
          </View>
          <View style={styles.rightSection}>
            <View style={styles.statPill}>
              <Ionicons name="water-outline" size={14} color="#bfdbfe" />
              <View>
                <Text style={styles.statLabel}>Humidity</Text>
                <Text style={styles.statValue}>60%</Text>
              </View>
            </View>
            <View style={styles.statPill}>
              <Ionicons name="leaf-outline" size={14} color="#bfdbfe" />
              <View>
                <Text style={styles.statLabel}>Wind</Text>
                <Text style={styles.statValue}>25 km/h</Text>
              </View>
            </View>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  background: {
    width: '100%',
  },
  backgroundImage: {
    borderRadius: 16,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(22,101,52,0.82)',
    borderRadius: 16,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  leftSection: {},
  tempRow: { flexDirection: 'row', alignItems: 'flex-end' },
  temp: { fontSize: 38, fontFamily: fonts.heading, color: colors.white },
  unit: { fontSize: 18, color: 'rgba(255,255,255,0.8)', marginBottom: 6, marginLeft: 2 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  location: { fontSize: 11, color: 'rgba(255,255,255,0.8)' },
  rightSection: { gap: 8 },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statLabel: { fontSize: 9, color: 'rgba(255,255,255,0.7)' },
  statValue: { fontSize: 13, fontFamily: fonts.bodySemiBold, color: colors.white },
});
