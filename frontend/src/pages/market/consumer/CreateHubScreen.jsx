import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, consumerColors, fonts, shadows } from '../../../common/theme';
import { useAuth } from '../../../context/AuthContext';
import Button from '../../../components/Button';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function CreateHubScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  
  const product = route.params?.product;

  const [pledgeKg, setPledgeKg] = useState('');
  const [address, setAddress] = useState('');
  const [deadlineHours, setDeadlineHours] = useState('24');
  const [isLoading, setIsLoading] = useState(false);

  if (!product) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.errorText}>Missing product details.</Text>
        <Button onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>Go Back</Button>
      </View>
    );
  }

  const handleCreateHub = async () => {
    if (!pledgeKg || Number(pledgeKg) <= 0) {
      Alert.alert('Error', 'Please enter a valid initial pledge (kg).');
      return;
    }
    if (!address.trim()) {
      Alert.alert('Error', 'Please provide a meetup or pickup address.');
      return;
    }
    if (!deadlineHours || Number(deadlineHours) <= 0) {
      Alert.alert('Error', 'Please enter valid hours for the deadline.');
      return;
    }

    setIsLoading(true);
    try {
       const deadlineDate = new Date();
       deadlineDate.setHours(deadlineDate.getHours() + Number(deadlineHours));

       const response = await fetch(`${API_URL}/hubs/create`, {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${token}`
         },
         body: JSON.stringify({
           crop_id: product.id,
           latitude: 0, // Mocked for now
           longitude: 0, // Mocked for now
           address: address,
           deadline: deadlineDate.toISOString(),
           pledge_kg: Number(pledgeKg)
         })
       });

       const data = await response.json();
       if (response.ok) {
          Alert.alert('Hub Created!', 'Your group buy hub is now live.', [
             { text: 'View Hub', onPress: () => navigation.replace('HubDetails', { hubId: data.hub.id }) }
          ]);
       } else {
          Alert.alert('Error', data.error || 'Failed to create Hub.');
       }
    } catch (error) {
       console.error('Create Hub Error:', error);
       Alert.alert('Error', 'Could not communicate with the server.');
    } finally {
       setIsLoading(false);
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={consumerColors.primaryDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Start a Group Buy</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.productCard}>
           <Text style={styles.productTitle}>{product.variety ? `${product.variety} ${product.crop_type}` : product.crop_type}</Text>
           <Text style={styles.farmer}>Sold by {product.farmer_name}</Text>
           <View style={styles.hubRules}>
              <View style={styles.ruleItem}>
                 <Ionicons name="scale" size={18} color={consumerColors.primaryDark} />
                 <Text style={styles.ruleText}>Target: {product.hub_target_kg} kg</Text>
              </View>
              <View style={styles.ruleItem}>
                 <Ionicons name="pricetag" size={18} color={consumerColors.primaryDark} />
                 <Text style={styles.ruleText}>Discount: {product.hub_discount_percentage}% OFF</Text>
              </View>
           </View>
        </View>

        <View style={styles.formSection}>
            <Text style={styles.label}>YOUR INITIAL PLEDGE (kg)</Text>
            <Text style={styles.helperText}>How much are you buying to start the group?</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 5"
              keyboardType="numeric"
              value={pledgeKg}
              onChangeText={setPledgeKg}
            />

            <Text style={[styles.label, { marginTop: 20 }]}>MEETUP / PICKUP ADDRESS</Text>
            <Text style={styles.helperText}>Where should users go to pick up their share?</Text>
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
              placeholder="Enter neighborhood or exact address"
              multiline
              value={address}
              onChangeText={setAddress}
            />

            <Text style={[styles.label, { marginTop: 20 }]}>DEADLINE (HOURS)</Text>
            <Text style={styles.helperText}>How long should this Hub stay open to recruit buyers?</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 24"
              keyboardType="numeric"
              value={deadlineHours}
              onChangeText={setDeadlineHours}
            />
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 20) }, shadows.card]}>
        <Button 
           onPress={handleCreateHub} 
           disabled={isLoading}
           icon={!isLoading && <Ionicons name="people" size={20} color={colors.white} />}
        >
          {isLoading ? 'Creating Hub...' : 'Create Hub & Pledge'}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 10 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontFamily: fonts.headingSemiBold, color: consumerColors.primaryDark },
  errorText: { fontFamily: fonts.bodyMedium, color: colors.error },
  scrollContent: { padding: 20, paddingBottom: 120 },
  
  productCard: { backgroundColor: colors.white, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.borderLight, marginBottom: 24, ...shadows.soft },
  productTitle: { fontSize: 20, fontFamily: fonts.headingSemiBold, color: colors.textPrimary },
  farmer: { fontSize: 13, fontFamily: fonts.bodyMedium, color: colors.textSecondary, marginTop: 4, marginBottom: 12 },
  hubRules: { flexDirection: 'row', gap: 16, backgroundColor: consumerColors.primary100, padding: 12, borderRadius: 8 },
  ruleItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ruleText: { fontFamily: fonts.bodySemiBold, color: consumerColors.primaryDark, fontSize: 13 },

  formSection: {},
  label: { fontSize: 12, fontFamily: fonts.bodySemiBold, color: colors.textPrimary, letterSpacing: 0.5 },
  helperText: { fontSize: 11, fontFamily: fonts.body, color: colors.textSecondary, marginBottom: 8, marginTop: 2 },
  input: {
     backgroundColor: colors.surfaceWarm,
     borderWidth: 1,
     borderColor: colors.borderLight,
     borderRadius: 12,
     paddingHorizontal: 16,
     paddingVertical: 12,
     fontSize: 16,
     fontFamily: fonts.body,
     color: colors.textPrimary
  },

  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: colors.white, paddingHorizontal: 24, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.borderLight },
});
