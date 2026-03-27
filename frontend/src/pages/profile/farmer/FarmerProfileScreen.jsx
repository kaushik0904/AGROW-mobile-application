import React, { useState, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '../../../common/theme';
import { useAuth } from '../../../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';

import ProfileHeaderCard from '../components/ProfileHeaderCard';
import StatBoxRow from '../components/StatBoxRow';
import SettingsList from '../components/SettingsList';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const farmerSettingsItems = [
  { label: 'Notifications', icon: 'notifications-outline', key: 'notifications', defaultOn: true },
  { label: 'Price Alerts', icon: 'trending-up-outline', key: 'priceAlerts', defaultOn: true },
  { label: 'Share Profile', icon: 'share-social-outline', key: 'shareProfile', defaultOn: false },
];

export default function FarmerProfileScreen({ navigation }) {
  const [toggles, setToggles] = useState({
    notifications: true,
    priceAlerts: true,
    shareProfile: false,
  });
  const insets = useSafeAreaInsets();
  const { logout, token, user } = useAuth();
  const themeColors = colors;

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/users/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setUserProfile(data.user);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [token])
  );

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchProfile();
  };

  const handleToggle = (key) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (isLoading && !isRefreshing) {
    return (
      <View style={[styles.screen, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={themeColors.primary} />
      </View>
    );
  }

  const farmerStats = [
    { label: 'Listings', value: '12' },
    { label: 'Sold', value: '47' },
    { label: 'Earnings', value: '₹1.2L' },
  ];

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top }]}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[themeColors.primary]} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <ProfileHeaderCard
        themeColors={themeColors}
        gradientColors={[colors.primary, colors.primaryDark, '#064e3b']}
        avatarUri={userProfile?.profile_image}
        title={userProfile?.name || user?.name || 'User'}
        subtitle={userProfile?.farm_name}
        metadata={[
          { icon: 'resize-outline', text: userProfile?.farm_size, show: !!userProfile?.farm_size },
          { icon: 'location-outline', text: userProfile?.location, show: !!userProfile?.location }
        ]}
        followStats={{ followers: userProfile?.followersCount, following: userProfile?.followingCount }}
        onEditPress={() => navigation.navigate('EditFarmerProfile', { userProfile })}
      />

      <StatBoxRow stats={farmerStats} themeColors={themeColors} />

      <SettingsList
        items={farmerSettingsItems}
        toggles={toggles}
        onToggle={handleToggle}
        themeColors={themeColors}
      />

      <View style={styles.logoutWrapper}>
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
  logoutWrapper: { paddingHorizontal: 20, marginTop: 16 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.red50, paddingVertical: 14, borderRadius: 16 },
  logoutText: { fontSize: 14, fontFamily: fonts.bodyMedium, color: colors.danger },
});
