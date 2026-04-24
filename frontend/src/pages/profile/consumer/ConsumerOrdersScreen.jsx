import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { consumerColors, fonts, shadows, colors } from '../../../common/theme';
import { useAuth } from '../../../context/AuthContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function ConsumerOrdersScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { token } = useAuth();
  
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error('Error fetching consumer orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [])
  );

  const confirmReceipt = async (orderId) => {
    try {
      const response = await fetch(`${API_URL}/payment/release`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ order_id: orderId })
      });
      
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Escrow Released', 'Thank you! Payment has been released to the farmer.');
        fetchOrders();
      } else {
        Alert.alert('Error', data.error || 'Failed to release escrow');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error while confirming receipt');
    }
  };

  const renderTimeline = (status) => {
    const steps = ['pending', 'processing', 'out_for_delivery', 'delivered'];
    const currentIndex = steps.indexOf(status);
    
    return (
      <View style={styles.timelineContainer}>
        {steps.map((step, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;
          return (
            <View key={step} style={styles.timelineStep}>
              <View style={[
                styles.timelineDot,
                isCompleted && { backgroundColor: consumerColors.primary },
                isCurrent && { transform: [{ scale: 1.2 }], borderWidth: 2, borderColor: colors.white }
              ]} />
              {index < steps.length - 1 && (
                <View style={[
                  styles.timelineLine,
                  isCompleted && index < currentIndex && { backgroundColor: consumerColors.primary }
                ]} />
              )}
            </View>
          );
        })}
      </View>
    );
  };

  const renderOrder = ({ item }) => {
    return (
      <View style={[styles.orderCard, shadows.soft]}>
        <View style={styles.orderHeader}>
          <Text style={styles.orderId}>Order #{item.id}</Text>
          <Text style={styles.orderDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
        </View>

        {renderTimeline(item.status)}
        <View style={styles.timelineLabels}>
          <Text style={styles.timelineLabelText}>Placed</Text>
          <Text style={styles.timelineLabelText}>Packed</Text>
          <Text style={styles.timelineLabelText}>Transit</Text>
          <Text style={styles.timelineLabelText}>Arrived</Text>
        </View>

        <View style={styles.itemsList}>
          {item.items.map((prod, idx) => (
            <Text key={idx} style={styles.itemRow}>
              • {prod.quantity}kg x {prod.variety || ''} {prod.crop_type}
            </Text>
          ))}
        </View>

        <View style={styles.orderFooter}>
          <Text style={styles.totalLabel}>Total: ₹{Number(item.total_amount).toFixed(2)}</Text>
          <Text style={styles.paymentStatus}>
             Payment: <Text style={{fontWeight: 'bold', color: item.payment_status === 'released' ? colors.success : colors.textPrimary}}>
               {item.payment_status === 'held_in_escrow' ? 'Escrow Held' : item.payment_status.toUpperCase()}
             </Text>
          </Text>
        </View>

        {item.status === 'delivered' && item.payment_status === 'held_in_escrow' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.confirmBtn} onPress={() => confirmReceipt(item.id)}>
              <Ionicons name="checkmark-circle-outline" size={18} color={colors.white} />
              <Text style={styles.confirmBtnText}>Confirm Receipt</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>My Orders</Text>
        <View style={{ width: 24 }} />
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={consumerColors.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderOrder}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <Text style={styles.emptyText}>You haven't placed any orders yet.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  backBtn: { padding: 4 },
  title: { fontSize: 18, fontFamily: fonts.headingSemiBold, color: colors.textPrimary },
  listContainer: { padding: 20, paddingBottom: 100 },
  orderCard: { backgroundColor: colors.white, borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.borderLight },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  orderId: { fontSize: 16, fontFamily: fonts.headingSemiBold, color: colors.textPrimary },
  orderDate: { fontSize: 12, fontFamily: fonts.bodyMedium, color: colors.textSecondary },
  
  timelineContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10, marginBottom: 8 },
  timelineStep: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  timelineDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.borderLight, zIndex: 1 },
  timelineLine: { flex: 1, height: 2, backgroundColor: colors.borderLight, marginLeft: -2, marginRight: -2 },
  timelineLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, paddingHorizontal: 4 },
  timelineLabelText: { fontSize: 10, fontFamily: fonts.bodyMedium, color: colors.textSecondary, width: 40, textAlign: 'center', marginLeft: -15 },
  
  itemsList: { backgroundColor: consumerColors.primary50, padding: 12, borderRadius: 8, marginBottom: 12 },
  itemRow: { fontSize: 13, fontFamily: fonts.body, color: colors.textPrimary, marginBottom: 4 },
  
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderTopWidth: 1, borderTopColor: colors.borderLight, paddingTop: 12 },
  totalLabel: { fontSize: 15, fontFamily: fonts.headingSemiBold, color: consumerColors.primaryDark },
  paymentStatus: { fontSize: 12, fontFamily: fonts.bodyMedium, color: colors.textSecondary },
  
  actionButtons: { marginTop: 8 },
  confirmBtn: { flexDirection: 'row', backgroundColor: consumerColors.primary, paddingVertical: 12, borderRadius: 8, justifyContent: 'center', alignItems: 'center', gap: 6 },
  confirmBtnText: { color: colors.white, fontSize: 14, fontFamily: fonts.bodySemiBold }
});
