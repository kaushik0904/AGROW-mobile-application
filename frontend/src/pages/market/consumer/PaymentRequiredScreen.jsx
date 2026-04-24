import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors, consumerColors, fonts, shadows } from '../../../common/theme';
import { useAuth } from '../../../context/AuthContext';
import io from 'socket.io-client';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function PaymentRequiredScreen() {
  const [hub, setHub] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const { hubId } = route.params;
  const { token, user } = useAuth();

  useEffect(() => {
    fetchHubDetails();
  }, [hubId]);

  const fetchHubDetails = async () => {
    try {
      const response = await fetch(`${API_URL}/hubs/${hubId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setHub(data.hub);
      }
    } catch (error) {
      console.error('Error fetching hub:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTimeLeft = (deadline) => {
      const diff = new Date(deadline) - new Date();
      if (diff <= 0) return 'Expired';
      const m = Math.floor((diff/1000/60));
      return `${m} minutes remaining`;
  };

  const handlePay = async () => {
    setIsPaying(true);
    try {
        const amount = Number(myPledge?.pledge_kg || 0) * Number(hub.price_per_kg) * ((100 - Number(hub.discount_percentage))/100);
        
        const response = await fetch(`${API_URL}/payment/create-intent`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ amount, type: 'HUB', reference_id: hubId })
        });
        const data = await response.json();
        if (response.ok) {
            Alert.alert('Payment Successful', 'Payment secured in Escrow! You will get your wholesale crop soon.');
            navigation.navigate('MainTabs');
        } else {
            Alert.alert('Error', data.error || 'Failed to process payment');
        }
    } catch (err) {
        Alert.alert('Error', 'Connection failed');
    } finally {
        setIsPaying(false);
    }
  };

  if (isLoading || !hub) {
      return (
         <View style={[styles.screen, { justifyContent: 'center', alignItems: 'center' }]}>
             <ActivityIndicator size="large" color={consumerColors.primary} />
         </View>
      );
  }
  
  const myPledge = hub.members?.find(m => m.user_id === user?.id);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.navigate('MainTabs')} style={styles.backBtn}>
                <Ionicons name="close" size={28} color={colors.textPrimary} />
            </TouchableOpacity>
        </View>

        <View style={styles.content}>
            <View style={styles.iconCircle}>
                <Ionicons name="alert-circle" size={50} color={colors.white} />
            </View>
            <Text style={styles.hugeTitle}>🎉 GOAL REACHED!</Text>
            <Text style={styles.description}>
                Your Hub for <Text style={{fontFamily: fonts.bodySemiBold}}>{hub.crop_type}</Text> has met its target!
            </Text>

            <View style={styles.timerBox}>
                <Text style={styles.timerLabel}>Time remaining to checkout:</Text>
                <Text style={styles.timerValue}>{calculateTimeLeft(hub.deadline)}</Text>
            </View>

            <View style={styles.summaryBox}>
                <Text style={styles.summaryLabel}>Your Pledge:</Text>
                <Text style={styles.summaryValue}>{Number(myPledge?.pledge_kg || 0)} kg</Text>
                <View style={styles.divider} />
                <Text style={styles.summaryLabel}>Discounted Total:</Text>
                <Text style={styles.summaryPrice}>₹{(Number(myPledge?.pledge_kg || 0) * Number(hub.price_per_kg) * ((100 - Number(hub.discount_percentage))/100)).toFixed(2)}</Text>
            </View>

            <TouchableOpacity 
                style={[styles.payBtn, isPaying && {opacity: 0.7}]} 
                onPress={handlePay}
                disabled={isPaying || hub.status === 'FAILED' || myPledge?.status === 'PAID'}
            >
                <Text style={styles.payBtnText}>
                    {isPaying ? 'Processing...' : myPledge?.status === 'PAID' ? 'ALREADY PAID' : 'COMPLETE PAYMENT NOW'}
                </Text>
            </TouchableOpacity>
            
            <View style={styles.warningBanner}>
               <Ionicons name="warning" size={16} color={colors.danger} />
               <Text style={styles.warningText}>
                  Failure to pay within the deadline lowers your AGROW Karma and jeopardizes the group's discount.
               </Text>
            </View>
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  header: { paddingHorizontal: 20, paddingTop: 10, alignItems: 'flex-start' },
  backBtn: { padding: 4 },
  
  content: { flex: 1, paddingHorizontal: 30, paddingTop: 20, alignItems: 'center' },
  iconCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: consumerColors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 20, ...shadows.soft },
  hugeTitle: { fontSize: 28, fontFamily: fonts.headingBold, color: consumerColors.primaryDark, marginBottom: 12 },
  description: { fontSize: 16, fontFamily: fonts.bodyMedium, color: colors.textSecondary, textAlign: 'center', marginBottom: 30, lineHeight: 24 },

  timerBox: { backgroundColor: colors.error + '10', paddingVertical: 16, paddingHorizontal: 30, borderRadius: 16, alignItems: 'center', marginBottom: 30, borderWidth: 1, borderColor: colors.error + '40', width: '100%' },
  timerLabel: { fontSize: 13, fontFamily: fonts.bodySemiBold, color: colors.error, marginBottom: 4 },
  timerValue: { fontSize: 24, fontFamily: fonts.headingBold, color: colors.error },

  summaryBox: { width: '100%', backgroundColor: colors.gray50, padding: 20, borderRadius: 16, marginBottom: 30, borderWidth: 1, borderColor: colors.borderLight },
  summaryLabel: { fontSize: 14, fontFamily: fonts.bodyMedium, color: colors.textSecondary, marginBottom: 4 },
  summaryValue: { fontSize: 18, fontFamily: fonts.headingSemiBold, color: colors.textPrimary },
  divider: { height: 1, backgroundColor: colors.borderLight, marginVertical: 16 },
  summaryPrice: { fontSize: 28, fontFamily: fonts.headingBold, color: consumerColors.primary },

  payBtn: { width: '100%', backgroundColor: consumerColors.primary, paddingVertical: 18, borderRadius: 16, alignItems: 'center', ...shadows.soft, marginBottom: 20 },
  payBtnText: { color: colors.white, fontSize: 16, fontFamily: fonts.headingBold },
  
  warningBanner: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: colors.danger + '10', padding: 12, borderRadius: 8, gap: 8 },
  warningText: { flex: 1, fontSize: 12, fontFamily: fonts.body, color: colors.danger, lineHeight: 18 }
});
