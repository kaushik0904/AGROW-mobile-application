import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, consumerColors, fonts, shadows } from '../../../common/theme';
import { useAuth } from '../../../context/AuthContext';
import CropCard from '../../../components/CropCard';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function HubDiscoveryScreen() {
  const [hubs, setHubs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { user, token } = useAuth();

  const fetchHubs = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/hubs/near-me`, {
        headers: {
           'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setHubs(data.hubs);
      }
    } catch (error) {
      console.error('Error fetching hubs:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    fetchHubs();
  }, [fetchHubs]);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchHubs();
  };

  const isBanned = user?.banned_from_hubs_until && new Date(user.banned_from_hubs_until) > new Date();

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={consumerColors.primaryDark} />
         </TouchableOpacity>
         <Text style={styles.title}>Group Buying Hubs</Text>
         <View style={{width: 24}}/>
      </View>

      {isBanned && (
         <View style={styles.bannedBanner}>
            <Ionicons name="warning-outline" size={20} color={colors.white} />
            <Text style={styles.bannedText}>Your AGROW Karma is low. You are restricted from joining Hubs right now.</Text>
         </View>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[consumerColors.primary]} />
        }
      >
        <View style={styles.listSection}>
          {isLoading ? (
            <ActivityIndicator size="large" color={consumerColors.primary} style={{ marginTop: 40 }} />
          ) : hubs.length === 0 ? (
            <Text style={styles.emptyText}>No active hubs near you.</Text>
          ) : (
            hubs.map((hub) => (
              <TouchableOpacity 
                key={hub.id} 
                activeOpacity={0.7} 
                onPress={() => navigation.navigate('HubDetails', { hubId: hub.id })}
              >
                <View style={[styles.hubCard, shadows.soft]}>
                   <View style={styles.hubTop}>
                       <Text style={styles.cropTitle}>{hub.crop_type} ({hub.variety})</Text>
                       <View style={styles.discountBadge}>
                          <Text style={styles.discountText}>{hub.discount_percentage}% OFF</Text>
                       </View>
                   </View>
                   <Text style={styles.hostText}>Hosted by {hub.host_name}</Text>
                   <Text style={styles.addressText}>{hub.address}</Text>

                   <View style={styles.progressContainer}>
                       <Text style={styles.progressText}>{Number(hub.current_kg)} kg / {Number(hub.target_kg)} kg filled</Text>
                       <View style={styles.progressBarBg}>
                           <View style={[styles.progressBarFill, { width: `${Math.min(100, (Number(hub.current_kg) / Number(hub.target_kg)) * 100)}%` }]} />
                       </View>
                   </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      <TouchableOpacity 
        style={styles.fab} 
        activeOpacity={0.8}
        onPress={() => {
           Alert.alert(
             "Start a New Hub",
             "To start a new group buying hub, pick any eligible crop from the Marketplace and tap 'Start Hub' on its details page.",
             [
               { text: "Cancel", style: "cancel" },
               { text: "Go to Market", onPress: () => navigation.navigate('MainTabs', { screen: 'Market' }) }
             ]
           );
        }}
      >
        <Ionicons name="add" size={24} color={colors.white} />
        <Text style={styles.fabText}>Start New Hub</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 20, fontFamily: fonts.heading, color: consumerColors.primaryDark },
  backBtn: { padding: 4 },
  bannedBanner: { backgroundColor: colors.error, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  bannedText: { color: colors.white, fontFamily: fonts.bodyMedium, fontSize: 13, flex: 1 },
  scrollContent: { paddingBottom: 30 },
  listSection: { paddingHorizontal: 20, gap: 12, marginTop: 10 },
  emptyText: { textAlign: 'center', fontFamily: fonts.bodyMedium, color: colors.textSecondary, marginTop: 40 },
  
  hubCard: { backgroundColor: colors.white, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.borderLight, marginBottom: 8 },
  hubTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cropTitle: { fontSize: 18, fontFamily: fonts.headingSemiBold, color: colors.textPrimary },
  discountBadge: { backgroundColor: consumerColors.primary100, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  discountText: { color: consumerColors.primaryDark, fontSize: 12, fontFamily: fonts.bodySemiBold },
  hostText: { fontSize: 13, color: colors.textSecondary, fontFamily: fonts.bodyMedium, marginBottom: 2 },
  addressText: { fontSize: 12, color: colors.textMuted, fontFamily: fonts.body, marginBottom: 12 },
  
  progressContainer: { marginTop: 4 },
  progressText: { fontSize: 12, color: colors.textPrimary, fontFamily: fonts.bodySemiBold, marginBottom: 6 },
  progressBarBg: { height: 8, backgroundColor: colors.gray100, borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: consumerColors.primary, borderRadius: 4 },
  
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    backgroundColor: consumerColors.primary,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  fabText: {
    color: colors.white,
    fontFamily: fonts.headingSemiBold,
    fontSize: 15,
  },
});
