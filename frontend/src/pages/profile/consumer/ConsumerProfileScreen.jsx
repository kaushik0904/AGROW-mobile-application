import React, { useState, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { consumerColors, fonts, colors } from '../../../common/theme';
import { useAuth } from '../../../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';

import ProfileHeaderCard from '../components/ProfileHeaderCard';
import StatBoxRow from '../components/StatBoxRow';
import SettingsList from '../components/SettingsList';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const consumerSettingsItems = [
  { label: 'My Orders', icon: 'cube-outline', key: 'myOrders', type: 'link' },
  { label: 'Saved Products', icon: 'heart-outline', key: 'savedProducts', type: 'link' },
  { label: 'Payment Methods', icon: 'card-outline', key: 'paymentMethods', type: 'link' },
  { label: 'Help & Support', icon: 'headset-outline', key: 'helpSupport', type: 'link' },
];

export default function ConsumerProfileScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { logout, token, user } = useAuth();
  const themeColors = consumerColors;

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

  if (isLoading && !isRefreshing) {
    return (
      <View style={[styles.screen, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={themeColors.primary} />
      </View>
    );
  }

  const consumerStats = [
    { label: 'Orders', value: '0' },
    { label: 'Saved', value: '₹0' },
    { label: 'Loyalty pts', value: '150' },
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
        gradientColors={[themeColors.primaryLight, themeColors.primaryDark]}
        avatarUri={userProfile?.profile_image}
        title={userProfile?.name || user?.name || 'User'}
        metadata={[
          {
            icon: 'location',
            iconColor: themeColors.primary,
            text: userProfile?.location ? `Delivery: ${userProfile.location}` : 'No delivery address set',
            show: true
          }
        ]}
        onEditPress={() => navigation.navigate('EditConsumerProfile', { userProfile })}
      />

      <StatBoxRow stats={consumerStats} themeColors={themeColors} />

      <SettingsList
        items={consumerSettingsItems}
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
  title: { fontSize: 24, fontFamily: fonts.heading, color: consumerColors.primaryDark },
  logoutWrapper: { paddingHorizontal: 20, marginTop: 16 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.red50, paddingVertical: 14, borderRadius: 16 },
  logoutText: { fontSize: 14, fontFamily: fonts.bodyMedium, color: colors.danger },
});
