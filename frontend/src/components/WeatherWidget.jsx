import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { colors, fonts, shadows } from '../common/theme';

const WEATHER_API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY;

export default function WeatherWidget() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied');
        setLoading(false);
        return;
      }

      // 2. Get current GPS coordinates
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = location.coords;

      // 3. Fetch weather from WeatherAPI.com
      const response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${latitude},${longitude}&aqi=no`
      );

      if (!response.ok) {
        throw new Error('Weather fetch failed');
      }

      const data = await response.json();

      setWeather({
        temp: Math.round(data.current.temp_c),
        city: data.location.name,
        region: data.location.region,
        humidity: data.current.humidity,
        windKph: Math.round(data.current.wind_kph),
        condition: data.current.condition.text,
      });
    } catch (err) {
      setError('Unable to fetch weather');
      console.error('Weather error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, shadows.card]}>
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=60' }}
        style={styles.background}
        imageStyle={styles.backgroundImage}
      >
        <View style={styles.overlay} />
        <View style={styles.content}>
          {loading ? (
            <View style={styles.centerState}>
              <ActivityIndicator color={colors.white} size="small" />
              <Text style={styles.stateText}>Fetching weather...</Text>
            </View>
          ) : error ? (
            <View style={styles.centerState}>
              <Ionicons name="cloud-offline-outline" size={22} color="rgba(255,255,255,0.8)" />
              <Text style={styles.stateText}>{error}</Text>
            </View>
          ) : (
            <>
              <View style={styles.leftSection}>
                <View style={styles.tempRow}>
                  <Text style={styles.temp}>{weather.temp}°</Text>
                  <Text style={styles.unit}>C</Text>
                </View>
                <Text style={styles.condition}>{weather.condition}</Text>
                <View style={styles.locationRow}>
                  <Ionicons name="location-outline" size={12} color="rgba(255,255,255,0.7)" />
                  <Text style={styles.location}>{weather.city}, {weather.region}</Text>
                </View>
              </View>
              <View style={styles.rightSection}>
                <View style={styles.statPill}>
                  <Ionicons name="water-outline" size={14} color="#bfdbfe" />
                  <View>
                    <Text style={styles.statLabel}>Humidity</Text>
                    <Text style={styles.statValue}>{weather.humidity}%</Text>
                  </View>
                </View>
                <View style={styles.statPill}>
                  <Ionicons name="leaf-outline" size={14} color="#bfdbfe" />
                  <View>
                    <Text style={styles.statLabel}>Wind</Text>
                    <Text style={styles.statValue}>{weather.windKph} km/h</Text>
                  </View>
                </View>
              </View>
            </>
          )}
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
    minHeight: 90,
  },
  centerState: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  stateText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontFamily: fonts.body,
  },
  leftSection: {},
  tempRow: { flexDirection: 'row', alignItems: 'flex-end' },
  temp: { fontSize: 38, fontFamily: fonts.heading, color: colors.white },
  unit: { fontSize: 18, color: 'rgba(255,255,255,0.8)', marginBottom: 6, marginLeft: 2 },
  condition: { fontSize: 10, color: 'rgba(255,255,255,0.65)', marginTop: 2, textTransform: 'capitalize' },
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
