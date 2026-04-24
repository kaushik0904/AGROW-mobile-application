import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { colors, fonts, shadows } from '../../../common/theme';
import { useAuth } from '../../../context/AuthContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function FarmerOrdersScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { token } = useAuth();
  
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/orders/farmer`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error('Error fetching farmer orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [])
  );

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        Alert.alert('Success', `Order status updated to ${newStatus}`);
        fetchOrders();
      } else {
        Alert.alert('Error', 'Failed to update order status');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error while updating status');
    }
  };

  const renderOrder = ({ item }) => {
    const totalQty = item.items.reduce((acc, curr) => acc + Number(curr.quantity), 0);
    const totalPrice = item.items.reduce((acc, curr) => acc + (Number(curr.quantity) * Number(curr.price_at_purchase)), 0);

    return (
      <View style={[styles.orderCard, shadows.soft]}>
        <View style={styles.orderHeader}>
          <Text style={styles.orderId}>Order #{item.id}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.customerInfo}>
          <Ionicons name="person-circle-outline" size={20} color={colors.textSecondary} />
          <Text style={styles.customerName}>{item.consumer_name} ({item.consumer_phone})</Text>
        </View>

        <View style={styles.itemsList}>
          {item.items.map((prod, idx) => (
            <Text key={idx} style={styles.itemRow}>
              • {prod.quantity}kg x {prod.variety || ''} {prod.crop_type}
            </Text>
          ))}
        </View>

        <View style={styles.orderFooter}>
          <Text style={styles.totalLabel}>Total: ₹{totalPrice.toFixed(2)}</Text>
          <Text style={styles.paymentStatus}>Payment: <Text style={{fontWeight: 'bold'}}>{item.payment_status}</Text></Text>
        </View>

        <View style={styles.actionButtons}>
          {item.status === 'pending' && (
            <TouchableOpacity style={styles.actionBtn} onPress={() => updateOrderStatus(item.id, 'processing')}>
              <Text style={styles.actionBtnText}>Accept & Process</Text>
            </TouchableOpacity>
          )}
          {item.status === 'processing' && (
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.amber500 }]} onPress={() => updateOrderStatus(item.id, 'out_for_delivery')}>
              <Text style={styles.actionBtnText}>Out for Delivery</Text>
            </TouchableOpacity>
          )}
          {item.status === 'out_for_delivery' && (
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.teal500 }]} onPress={() => updateOrderStatus(item.id, 'delivered')}>
              <Text style={styles.actionBtnText}>Mark Delivered</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Manage Orders</Text>
        <View style={{ width: 24 }} />
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderOrder}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No orders received yet.</Text>
          }
        />
      )}
    </View>
  );
}

const getStatusColor = (status) => {
  switch(status) {
    case 'pending': return colors.amber500;
    case 'processing': return colors.blue500;
    case 'out_for_delivery': return colors.indigo600;
    case 'delivered': return colors.teal500;
    default: return colors.textSecondary;
  }
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  backBtn: { padding: 4 },
  title: { fontSize: 18, fontFamily: fonts.headingSemiBold, color: colors.textPrimary },
  listContainer: { padding: 20, paddingBottom: 100 },
  orderCard: { backgroundColor: colors.white, borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.borderLight },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  orderId: { fontSize: 16, fontFamily: fonts.headingSemiBold, color: colors.textPrimary },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontFamily: fonts.bodySemiBold },
  customerInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  customerName: { fontSize: 14, fontFamily: fonts.bodyMedium, color: colors.textSecondary },
  itemsList: { backgroundColor: colors.surfaceWarm, padding: 12, borderRadius: 8, marginBottom: 12 },
  itemRow: { fontSize: 13, fontFamily: fonts.body, color: colors.textPrimary, marginBottom: 4 },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderTopWidth: 1, borderTopColor: colors.borderLight, paddingTop: 12 },
  totalLabel: { fontSize: 15, fontFamily: fonts.headingSemiBold, color: colors.primary },
  paymentStatus: { fontSize: 12, fontFamily: fonts.bodyMedium, color: colors.textSecondary },
  actionButtons: { flexDirection: 'row', justifyContent: 'flex-end' },
  actionBtn: { backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  actionBtnText: { color: colors.white, fontSize: 13, fontFamily: fonts.bodySemiBold },
  emptyText: { textAlign: 'center', color: colors.textSecondary, marginTop: 40, fontFamily: fonts.bodyMedium }
});
