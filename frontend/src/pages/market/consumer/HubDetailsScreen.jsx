import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors, consumerColors, fonts, shadows } from '../../../common/theme';
import { useAuth } from '../../../context/AuthContext';
import io from 'socket.io-client';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const BASE_URL = API_URL.replace('/api', '');

export default function HubDetailsScreen() {
  const [hub, setHub] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pledgeKg, setPledgeKg] = useState('5');
  const [isCommitting, setIsCommitting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const { hubId } = route.params;
  const { token, user } = useAuth();

  useEffect(() => {
    fetchHubDetails();
    
    // Socket.io for live updates
    const socket = io(BASE_URL);
    socket.on('hub_updated', (data) => {
        if (data.hub_id === hubId) {
            setHub(prev => prev ? { ...prev, current_kg: data.current_kg, status: data.status } : prev);
            if (data.status === 'PAYMENT_REQUIRED') {
                navigation.navigate('PaymentRequired', { hubId });
            }
        }
    });

    return () => socket.disconnect();
  }, [hubId]);

  const fetchHubDetails = async () => {
    try {
      const response = await fetch(`${API_URL}/hubs/${hubId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setHub(data.hub);
        const userPledge = data.hub.members?.find(m => m.user_id === user?.id);
        if (userPledge) {
            setPledgeKg(String(userPledge.pledge_kg));
        }
        if (data.hub.status === 'PAYMENT_REQUIRED') {
            navigation.replace('PaymentRequired', { hubId });
        }
      }
    } catch (error) {
      console.error('Error fetching hub:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommit = async () => {
    if (!pledgeKg || isNaN(pledgeKg) || Number(pledgeKg) <= 0) return Alert.alert("Invalid amount");
    setIsCommitting(true);
    try {
        const response = await fetch(`${API_URL}/hubs/${hubId}/commit`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ pledge_kg: Number(pledgeKg) })
        });
        const data = await response.json();
        if (response.ok) {
            if (data.isWaitlist) {
                 Alert.alert('Waitlisted', 'You are on the waitlist! If someone flakes, you will be notified.');
            } else {
                 Alert.alert('Pledged!', 'Your commitment has been recorded. You will be notified to pay when the goal is met.');
            }
            fetchHubDetails();
        } else {
            Alert.alert('Error', data.error || 'Failed to pledge');
        }
    } catch (err) {
        Alert.alert('Error', 'Connection failed');
    } finally {
        setIsCommitting(false);
    }
  };

  const handleCancel = async () => {
    Alert.alert(
      "Cancel Pledge",
      "Are you sure you want to withdraw entirely from this Hub?",
      [
        { text: "No", style: "cancel" },
        { 
          text: "Yes, Cancel", 
          style: "destructive",
          onPress: async () => {
             setIsCancelling(true);
             try {
                 const response = await fetch(`${API_URL}/hubs/${hubId}/commit`, {
                     method: 'DELETE',
                     headers: { 'Authorization': `Bearer ${token}` }
                 });
                 if (response.ok) {
                     Alert.alert('Cancelled', 'Your pledge has been removed.');
                     setPledgeKg('5');
                     fetchHubDetails();
                 } else {
                     const data = await response.json();
                     Alert.alert('Error', data.error || 'Failed to cancel pledge');
                 }
             } catch (err) {
                 Alert.alert('Error', 'Connection failed');
             } finally {
                 setIsCancelling(false);
             }
          }
        }
      ]
    );
  };

  if (isLoading || !hub) {
      return (
         <View style={[styles.screen, { justifyContent: 'center', alignItems: 'center' }]}>
             <ActivityIndicator size="large" color={consumerColors.primary} />
         </View>
      );
  }

  const fillPercentage = Math.min(100, (Number(hub.current_kg) / Number(hub.target_kg)) * 100);
  const isWaitlist = fillPercentage >= 100;
  
  const myPledge = hub.members?.find(m => m.user_id === user?.id);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : null} style={[styles.screen, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={24} color={consumerColors.primaryDark} />
            </TouchableOpacity>
            <Text style={styles.title}>Hub Details</Text>
            <View style={{width: 24}}/>
        </View>

        <View style={styles.card}>
            <Text style={styles.cropTitle}>{hub.crop_type} ({hub.variety})</Text>
            <Text style={styles.hostText}>Hosted centrally at: {hub.address}</Text>
            <Text style={styles.discountText}>🔥 {hub.discount_percentage}% Wholesale Discount Active</Text>

            <View style={styles.progressContainer}>
                <View style={styles.progressRow}>
                    <Text style={styles.progressLabel}>Goal Progress</Text>
                    <Text style={styles.progressValue}>{Number(hub.current_kg)} / {Number(hub.target_kg)} kg</Text>
                </View>
                <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${fillPercentage}%` }]} />
                </View>
            </View>

            <View style={styles.pledgeInputRow}>
                <Text style={styles.pledgeLabel}>I want to buy:</Text>
                <View style={styles.inputWrapper}>
                    <TextInput 
                        style={styles.input} 
                        keyboardType="numeric" 
                        value={pledgeKg} 
                        onChangeText={setPledgeKg}
                        maxLength={4}
                    />
                    <Text style={styles.kgBadge}>kg</Text>
                </View>
            </View>

            {myPledge ? (
               <View style={styles.myPledgeBox}>
                   <Ionicons name="checkmark-circle" size={20} color={consumerColors.primary} />
                   <Text style={styles.myPledgeText}>You pledged {Number(myPledge.pledge_kg)} kg. {myPledge.is_waitlist ? '(Waitlisted)' : ''}</Text>
               </View>
            ) : null}

            {myPledge ? (
               <View style={styles.editActionRow}>
                  <TouchableOpacity 
                      style={[styles.outlineBtn, isCancelling && {opacity: 0.7}]} 
                      onPress={handleCancel}
                      disabled={isCancelling || isCommitting || hub.status !== 'OPEN'}
                  >
                      <Text style={styles.outlineBtnText}>{isCancelling ? '...' : 'Cancel'}</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                      style={[styles.commitBtn, {flex: 2}, isCommitting && {opacity: 0.7}]} 
                      onPress={handleCommit}
                      disabled={isCancelling || isCommitting || hub.status !== 'OPEN'}
                  >
                      <Text style={styles.commitBtnText}>
                          {isCommitting ? 'Updating...' : `Update to ${pledgeKg || 0} kg`}
                      </Text>
                  </TouchableOpacity>
               </View>
            ) : (
               <TouchableOpacity 
                   style={[styles.commitBtn, isCommitting && {opacity: 0.7}]} 
                   onPress={handleCommit}
                   disabled={isCommitting || hub.status !== 'OPEN'}
               >
                   <Text style={styles.commitBtnText}>
                       {isCommitting ? 'Committing...' : isWaitlist ? `JOIN WAITLIST FOR ${pledgeKg || 0} kg` : `COMMIT TO ${pledgeKg || 0} kg`}
                   </Text>
               </TouchableOpacity>
            )}
            
            <Text style={styles.subtext}>You will only be asked to pay once the group hits the full {Number(hub.target_kg)} kg goal.</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  scrollContent: { paddingBottom: 40 },
  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 20, fontFamily: fonts.heading, color: consumerColors.primaryDark },
  backBtn: { padding: 4 },
  
  card: { backgroundColor: colors.white, marginHorizontal: 20, borderRadius: 16, padding: 20, ...shadows.card, marginTop: 10 },
  cropTitle: { fontSize: 22, fontFamily: fonts.headingBold, color: colors.textPrimary, marginBottom: 4 },
  hostText: { fontSize: 13, fontFamily: fonts.bodyMedium, color: colors.textSecondary, marginBottom: 16 },
  discountText: { fontSize: 15, fontFamily: fonts.headingSemiBold, color: consumerColors.primary, marginBottom: 20 },

  progressContainer: { marginBottom: 24 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { fontSize: 14, fontFamily: fonts.bodySemiBold, color: colors.textPrimary },
  progressValue: { fontSize: 14, fontFamily: fonts.bodyMedium, color: colors.textSecondary },
  progressBarBg: { height: 12, backgroundColor: colors.gray100, borderRadius: 6, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: consumerColors.primary, borderRadius: 6 },

  pledgeInputRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.borderLight },
  pledgeLabel: { fontSize: 16, fontFamily: fonts.bodyMedium, color: colors.textPrimary },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.gray50, borderWidth: 1, borderColor: colors.borderLight, borderRadius: 8, paddingHorizontal: 12 },
  input: { fontSize: 18, fontFamily: fonts.headingSemiBold, color: colors.textPrimary, paddingVertical: 8, minWidth: 50, textAlign: 'center' },
  kgBadge: { fontSize: 16, fontFamily: fonts.bodyMedium, color: colors.textSecondary, marginLeft: 4 },

  commitBtn: { backgroundColor: consumerColors.primary, paddingVertical: 16, borderRadius: 12, alignItems: 'center', ...shadows.soft },
  commitBtnText: { color: colors.white, fontSize: 16, fontFamily: fonts.headingSemiBold },
  subtext: { textAlign: 'center', fontSize: 12, fontFamily: fonts.body, color: colors.textMuted, marginTop: 12 },
  
  myPledgeBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: consumerColors.primary50, padding: 12, borderRadius: 8, marginBottom: 16, gap: 8 },
  myPledgeText: { fontSize: 14, fontFamily: fonts.bodyMedium, color: consumerColors.primaryDark },

  editActionRow: { flexDirection: 'row', gap: 12 },
  outlineBtn: { flex: 1, borderWidth: 1, borderColor: colors.error, backgroundColor: 'transparent', paddingVertical: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  outlineBtnText: { color: colors.error, fontSize: 16, fontFamily: fonts.headingSemiBold }
});
