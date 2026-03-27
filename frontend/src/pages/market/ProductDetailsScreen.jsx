import React, { useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, consumerColors, fonts, shadows } from '../../common/theme';
import { useCart } from '../../context/CartContext';
import Button from '../../components/Button';

export default function ProductDetailsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { addToCart } = useCart();
  
  const product = route.params?.product;
  const [selectedQty, setSelectedQty] = useState(1);

  if (!product) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontFamily: fonts.bodyMedium, color: colors.textSecondary }}>Product not found.</Text>
        <Button onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>Go Back</Button>
      </View>
    );
  }

  const handleIncrement = () => {
    if (selectedQty < product.quantity) {
      setSelectedQty(q => q + 1);
    } else {
      Alert.alert('Limit Reached', 'Cannot add more than available quantity.');
    }
  };

  const handleDecrement = () => {
    if (selectedQty > 1) {
      setSelectedQty(q => q - 1);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, selectedQty);
    Alert.alert(
      'Added to Cart',
      `${selectedQty}kg of ${product.crop_type} added to your cart.`,
      [
        { text: 'Keep Shopping', onPress: () => navigation.goBack() },
        { text: 'View Cart', onPress: () => navigation.navigate('MainTabs', { screen: 'Cart' }) }
      ]
    );
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Details</Text>
        <TouchableOpacity onPress={() => navigation.navigate('MainTabs', { screen: 'Cart' })} style={styles.cartBtn}>
          <Ionicons name="cart-outline" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: product.image_url || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&q=80' }} style={styles.image} />
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.titleRow}>
            <View>
              <Text style={styles.title}>{product.variety ? `${product.variety} ${product.crop_type}` : product.crop_type}</Text>
              <Text style={styles.farmer}>Sold by <Text style={styles.farmerBold}>{product.farmer_name}</Text></Text>
            </View>
            <Text style={styles.price}>₹{product.price_per_kg}<Text style={styles.unit}>/kg</Text></Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Product Information</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Ionicons name="leaf-outline" size={18} color={consumerColors.primary} />
              <View>
                <Text style={styles.infoLabel}>Category</Text>
                <Text style={styles.infoValue}>{product.crop_type}</Text>
              </View>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="calendar-outline" size={18} color={consumerColors.primary} />
              <View>
                <Text style={styles.infoLabel}>Harvested</Text>
                <Text style={styles.infoValue}>{product.harvest_date || 'Recently'}</Text>
              </View>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="scale-outline" size={18} color={consumerColors.primary} />
              <View>
                <Text style={styles.infoLabel}>Available Stock</Text>
                <Text style={styles.infoValue}>{product.quantity} kg</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Select Quantity</Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity onPress={handleDecrement} style={styles.qtyBtn}>
              <Ionicons name="remove" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.qtyText}>{selectedQty} kg</Text>
            <TouchableOpacity onPress={handleIncrement} style={styles.qtyBtn}>
              <Ionicons name="add" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.totalPreview}>Total: ₹{(product.price_per_kg * selectedQty).toFixed(2)}</Text>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 20) }, shadows.card]}>
        <Button onPress={handleAddToCart} icon={<Ionicons name="cart" size={20} color={colors.white} />}>
          Add to Cart
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 10 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontFamily: fonts.headingSemiBold, color: colors.textPrimary },
  cartBtn: { padding: 4 },
  scrollContent: { paddingBottom: 100 },
  imageContainer: { width: '100%', height: 280, backgroundColor: colors.surfaceWarm },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  detailsContainer: { padding: 24, backgroundColor: colors.surface, borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: -30 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontSize: 24, fontFamily: fonts.heading, color: consumerColors.primaryDark },
  farmer: { fontSize: 13, fontFamily: fonts.bodyMedium, color: colors.textSecondary, marginTop: 4 },
  farmerBold: { color: consumerColors.primary, fontFamily: fonts.bodySemiBold },
  price: { fontSize: 24, fontFamily: fonts.heading, color: consumerColors.primary },
  unit: { fontSize: 14, color: colors.textMuted },
  divider: { height: 1, backgroundColor: colors.borderLight, marginVertical: 20 },
  sectionTitle: { fontSize: 14, fontFamily: fonts.headingSemiBold, color: colors.textPrimary, marginBottom: 12 },
  infoGrid: { gap: 16 },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoLabel: { fontSize: 11, color: colors.textMuted, fontFamily: fonts.bodyMedium },
  infoValue: { fontSize: 14, color: colors.textPrimary, fontFamily: fonts.bodySemiBold, marginTop: 2 },
  quantityContainer: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', backgroundColor: colors.surfaceWarm, borderRadius: 12, padding: 4, borderWidth: 1, borderColor: colors.borderLight },
  qtyBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.white, borderRadius: 8, ...shadows.soft },
  qtyText: { fontSize: 16, fontFamily: fonts.headingSemiBold, color: colors.textPrimary, paddingHorizontal: 20 },
  totalPreview: { fontSize: 14, fontFamily: fonts.bodySemiBold, color: colors.textSecondary, marginTop: 12 },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: colors.white, paddingHorizontal: 24, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.borderLight },
});
