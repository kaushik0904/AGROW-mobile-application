import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, consumerColors, fonts, shadows } from '../../common/theme';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import Button from '../../components/Button';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { cart, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();
  const { token } = useAuth();
  
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const deliveryFee = cartTotal > 0 ? 50 : 0;
  const finalTotal = cartTotal + deliveryFee;

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    setIsCheckingOut(true);
    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: cart,
          totalAmount: finalTotal
        })
      });

      const data = await response.json();

      if (response.ok) {
        clearCart();
        Alert.alert(
          'Order Placed!',
          'Your order has been successfully placed. You can check the status in your Profile.',
          [{ text: 'Great', onPress: () => navigation.navigate('Home') }]
        );
      } else {
        Alert.alert('Checkout Failed', data.error || 'Something went wrong.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      Alert.alert('Error', 'Could not connect to the server. Please try again later.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Cart</Text>
        {cart.length > 0 && (
          <TouchableOpacity onPress={() => clearCart()}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {cart.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBg}>
            <Ionicons name="cart-outline" size={48} color={consumerColors.primary} />
          </View>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptyDesc}>Looks like you haven't added any fresh produce to your cart yet.</Text>
          <Button style={styles.shopBtn} onPress={() => navigation.navigate('Market')}>
            Start Shopping
          </Button>
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {cart.map((item) => (
              <View key={item.id} style={[styles.cartItem, shadows.soft]}>
                <Image source={{ uri: item.image_url || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200&q=80' }} style={styles.itemImage} />
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.variety ? `${item.variety} ${item.crop_type}` : item.crop_type}</Text>
                  <Text style={styles.itemPrice}>₹{item.price_per_kg}/kg</Text>
                  
                  <View style={styles.qtyControls}>
                    <TouchableOpacity onPress={() => updateQuantity(item.id, item.quantity - 1)} style={styles.qtyBtn}>
                      <Ionicons name="remove" size={16} color={colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.qtyValue}>{item.quantity}</Text>
                    <TouchableOpacity onPress={() => updateQuantity(item.id, item.quantity + 1)} style={styles.qtyBtn}>
                      <Ionicons name="add" size={16} color={colors.textPrimary} />
                    </TouchableOpacity>
                  </View>
                </View>
                
                <View style={styles.itemAction}>
                  <Text style={styles.itemTotal}>₹{(item.price_per_kg * item.quantity).toFixed(2)}</Text>
                  <TouchableOpacity onPress={() => removeFromCart(item.id)} style={styles.removeBtn}>
                    <Ionicons name="trash-outline" size={18} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {/* Order Summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Order Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>₹{cartTotal.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery Fee</Text>
                <Text style={styles.summaryValue}>₹{deliveryFee.toFixed(2)}</Text>
              </View>
              <View style={[styles.summaryRow, styles.summaryTotalRow]}>
                <Text style={styles.summaryTotalLabel}>Total</Text>
                <Text style={styles.summaryTotalValue}>₹{finalTotal.toFixed(2)}</Text>
              </View>
            </View>
          </ScrollView>

          <View style={[styles.checkoutBar, { paddingBottom: Math.max(insets.bottom, 20) }, shadows.card]}>
            <View style={styles.checkoutTotalWrap}>
              <Text style={styles.checkoutTotalLabel}>Grand Total</Text>
              <Text style={styles.checkoutTotal}>₹{finalTotal.toFixed(2)}</Text>
            </View>
            <Button style={styles.checkoutBtn} onPress={handleCheckout} disabled={isCheckingOut}>
              {isCheckingOut ? <ActivityIndicator color={colors.white} /> : 'Checkout'}
            </Button>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 16 },
  title: { fontSize: 24, fontFamily: fonts.heading, color: consumerColors.primaryDark },
  clearText: { fontSize: 13, fontFamily: fonts.bodyMedium, color: consumerColors.primary },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyIconBg: { width: 96, height: 96, borderRadius: 48, backgroundColor: consumerColors.primary50, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontFamily: fonts.headingSemiBold, color: colors.textPrimary, marginBottom: 8 },
  emptyDesc: { fontSize: 13, fontFamily: fonts.bodyMedium, color: colors.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 30 },
  shopBtn: { width: '100%' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
  cartItem: { flexDirection: 'row', backgroundColor: colors.white, borderRadius: 16, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: colors.borderLight },
  itemImage: { width: 70, height: 70, borderRadius: 12, backgroundColor: colors.surfaceWarm },
  itemDetails: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  itemName: { fontSize: 14, fontFamily: fonts.headingSemiBold, color: colors.textPrimary },
  itemPrice: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  qtyControls: { flexDirection: 'row', alignItems: 'center', marginTop: 8, backgroundColor: colors.surfaceWarm, alignSelf: 'flex-start', borderRadius: 8, borderWidth: 1, borderColor: colors.borderLight },
  qtyBtn: { width: 28, height: 28, justifyContent: 'center', alignItems: 'center' },
  qtyValue: { fontSize: 13, fontFamily: fonts.bodySemiBold, color: colors.textPrimary, paddingHorizontal: 10 },
  itemAction: { alignItems: 'flex-end', justifyContent: 'space-between' },
  itemTotal: { fontSize: 14, fontFamily: fonts.headingSemiBold, color: consumerColors.primary },
  removeBtn: { padding: 4, backgroundColor: colors.danger + '10', borderRadius: 8 },
  summaryCard: { backgroundColor: colors.card, borderRadius: 16, padding: 20, marginTop: 8, borderWidth: 1, borderColor: colors.borderLight },
  summaryTitle: { fontSize: 16, fontFamily: fonts.headingSemiBold, color: colors.textPrimary, marginBottom: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  summaryLabel: { fontSize: 13, color: colors.textSecondary, fontFamily: fonts.bodyMedium },
  summaryValue: { fontSize: 13, color: colors.textPrimary, fontFamily: fonts.bodySemiBold },
  summaryTotalRow: { marginTop: 12, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.borderLight, marginBottom: 0 },
  summaryTotalLabel: { fontSize: 15, color: colors.textPrimary, fontFamily: fonts.headingSemiBold },
  summaryTotalValue: { fontSize: 18, color: consumerColors.primary, fontFamily: fonts.heading },
  checkoutBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: colors.white, paddingHorizontal: 24, paddingTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: colors.borderLight },
  checkoutTotalWrap: {},
  checkoutTotalLabel: { fontSize: 11, color: colors.textMuted, fontFamily: fonts.bodyMedium },
  checkoutTotal: { fontSize: 20, color: consumerColors.primaryDark, fontFamily: fonts.heading },
  checkoutBtn: { flex: 1, marginLeft: 20 },
});
