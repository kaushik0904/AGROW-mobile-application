import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Platform, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, shadows } from '../common/theme';
import { useAuth } from '../context/AuthContext';
import WeatherWidget from '../components/WeatherWidget';
import CropCard from '../components/CropCard';
import Button from '../components/Button';
import DateTimePicker from '@react-native-community/datetimepicker';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function MarketScreen() {
  const [activeTab, setActiveTab] = useState('listings');
  const [crops, setCrops] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Form State
  const [cropType, setCropType] = useState('');
  const [variety, setVariety] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [harvestDate, setHarvestDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateValue, setDateValue] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Edit State
  const [editingCropId, setEditingCropId] = useState(null);

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDateValue(selectedDate);
      const formatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      setHarvestDate(formatter.format(selectedDate));
    }
  };

  const insets = useSafeAreaInsets();
  const { user, token } = useAuth();
  const currentUserId = user?.id;

  const fetchCrops = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/crops`);
      const data = await response.json();
      if (response.ok) {
        setCrops(data.crops);
      } else {
        Alert.alert('Error', data.error || 'Failed to fetch crops');
      }
    } catch (error) {
      console.error('Error fetching crops:', error);
      Alert.alert('Error', 'Could not connect to the server');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCrops();
  }, [fetchCrops]);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchCrops();
  };

  const handleListCrop = async () => {
    if (!cropType || !quantity || !price) {
      Alert.alert('Error', 'Please fill in Crop Type, Quantity, and Price');
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingCropId 
        ? `${API_URL}/crops/${editingCropId}` 
        : `${API_URL}/crops`;
        
      const method = editingCropId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          crop_type: cropType,
          variety,
          quantity: parseFloat(quantity),
          price_per_kg: parseFloat(price),
          harvest_date: harvestDate
        })
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', editingCropId ? 'Crop updated successfully!' : 'Crop listed successfully!');
        // Reset form
        setEditingCropId(null);
        setCropType('');
        setVariety('');
        setQuantity('');
        setPrice('');
        setHarvestDate('');
        setDateValue(new Date());

        // Refresh listings and switch tab
        fetchCrops();
        setActiveTab('listings');
      } else {
        Alert.alert('Error', data.error || 'Failed to process request');
      }
    } catch (error) {
      console.error('Error listing crop:', error);
      Alert.alert('Error', 'Could not connect to the server');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (crop) => {
    setEditingCropId(crop.id);
    setCropType(crop.crop_type);
    setVariety(crop.variety || '');
    setQuantity(crop.quantity.toString());
    setPrice(crop.price_per_kg.toString());
    setHarvestDate(crop.harvest_date || '');
    // Try to parse existing harvest date or fallback to today
    try {
      if (crop.harvest_date) {
        // Simple attempt to parse the string like "Oct 24, 2026"
        const parsedDate = new Date(crop.harvest_date);
        if (!isNaN(parsedDate.getTime())) {
          setDateValue(parsedDate);
        }
      }
    } catch (e) {}
    
    setActiveTab('new');
  };

  const handleRemove = async (cropId) => {
    Alert.alert(
      'Remove Listing',
      'Are you sure you want to remove this crop from the market?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${API_URL}/crops/${cropId}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });
              
              if (response.ok) {
                Alert.alert('Success', 'Listing removed successfully');
                fetchCrops();
              } else {
                const data = await response.json();
                Alert.alert('Error', data.error || 'Failed to remove listing');
              }
            } catch (err) {
              console.error('Error removing crop:', err);
              Alert.alert('Error', 'Could not connect to the server');
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[colors.primary]} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>
          {activeTab === 'listings' 
            ? 'My Listings' 
            : editingCropId 
              ? 'Edit Crop Listing' 
              : 'List New Crop'}
        </Text>
      </View>

      <WeatherWidget />

      {/* Main Tabs */}
      <View style={styles.tabContainer}>
        <View style={styles.tabBar}>
          <TouchableOpacity
            onPress={() => setActiveTab('listings')}
            style={[styles.tab, activeTab === 'listings' && styles.tabActive]}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 'listings' && styles.tabTextActive]}>📦 Current Listings</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              // If switching to "New Crop" tab from "Listings", clear editing state so form is fresh
              if (editingCropId) {
                 setEditingCropId(null);
                 setCropType('');
                 setVariety('');
                 setQuantity('');
                 setPrice('');
                 setHarvestDate('');
                 setDateValue(new Date());
              }
              setActiveTab('new');
            }}
            style={[styles.tab, activeTab === 'new' && styles.tabActive]}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 'new' && styles.tabTextActive]}>
              {editingCropId ? '✏️ Edit Crop' : '➕ List New Crop'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {activeTab === 'listings' ? (
        <View style={styles.listSection}>
          {isLoading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
          ) : crops.length === 0 ? (
            <Text style={styles.emptyText}>No crops listed currently.</Text>
          ) : (
            crops.map((crop) => (
              <CropCard 
                key={crop.id} 
                crop={crop} 
                isOwner={currentUserId === crop.farmer_id}
                onEdit={() => handleEdit(crop)}
                onRemove={() => handleRemove(crop.id)}
              />
            ))
          )}
        </View>
      ) : (
        <View style={styles.formSection}>
          <View style={[styles.formCard, shadows.card]}>
            {/* Crop Type */}
            <View style={styles.field}>
              <Text style={styles.label}>CROP TYPE *</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Tomato, Mango"
                  placeholderTextColor={colors.textMuted}
                  value={cropType}
                  onChangeText={setCropType}
                />
              </View>
            </View>

            {/* Variety / Specifics */}
            <View style={styles.field}>
              <Text style={styles.label}>DETAILS</Text>
              <View style={styles.gridRow}>
                <View style={styles.gridItem}>
                  <Text style={styles.gridLabel}>Quantity (kg) *</Text>
                  <TextInput
                    style={styles.gridInput}
                    placeholder="eg : 500"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                    value={quantity}
                    onChangeText={setQuantity}
                  />
                </View>
                <View style={styles.gridItem}>
                  <Text style={styles.gridLabel}>Variety</Text>
                  <TextInput
                    style={styles.gridInput}
                    placeholder="eg : Heirloom"
                    placeholderTextColor={colors.textMuted}
                    value={variety}
                    onChangeText={setVariety}
                  />
                </View>
                <View style={styles.gridItem}>
                  <Text style={styles.gridLabel}>Price/kg (₹) *</Text>
                  <TextInput
                    style={styles.gridInput}
                    placeholder="eg :26"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                    value={price}
                    onChangeText={setPrice}
                  />
                </View>
              </View>
            </View>

            {/* Harvest Date */}
            <View style={styles.field}>
              <Text style={styles.label}>HARVEST DATE</Text>
              <TouchableOpacity
                style={styles.inputWrapper}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.8}
              >
                <TextInput
                  style={styles.input}
                  placeholder="Select harvest date"
                  placeholderTextColor={colors.textMuted}
                  value={harvestDate}
                  editable={false}
                  pointerEvents="none"
                />
                <Ionicons name="calendar-outline" size={16} color={colors.primary} style={styles.inputIcon} />
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={dateValue}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                />
              )}
            </View>

            {/* Upload */}
            <TouchableOpacity style={styles.uploadArea} activeOpacity={0.7}>
              <View style={styles.uploadIcon}>
                <Ionicons name="camera-outline" size={24} color={colors.primary} />
              </View>
              <Text style={styles.uploadText}>Upload Photos</Text>
              <Text style={styles.uploadHint}>JPG, PNG up to 5MB</Text>
            </TouchableOpacity>

            {/* Submit */}
            <Button
              onPress={handleListCrop}
              icon={isSubmitting ? null : <Ionicons name={editingCropId ? "save-outline" : "cloud-upload-outline"} size={18} color={colors.white} />}
              disabled={isSubmitting}
            >
              {isSubmitting ? (editingCropId ? 'Saving...' : 'Publishing...') : (editingCropId ? 'Save Changes' : 'Publish Listing')}
            </Button>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  scrollContent: { paddingBottom: 30 },
  header: { paddingHorizontal: 20, paddingTop: 20 },
  title: { fontSize: 24, fontFamily: fonts.heading, color: colors.primaryDark },
  tabContainer: { paddingHorizontal: 20, marginTop: 20 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.primaryDark,
    borderRadius: 16,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: colors.white },
  tabText: { fontSize: 13, fontFamily: fonts.bodySemiBold, color: 'rgba(255,255,255,0.7)' },
  tabTextActive: { color: colors.primary },
  listSection: { paddingHorizontal: 20, marginTop: 16, gap: 12 },
  emptyText: { textAlign: 'center', fontFamily: fonts.bodyMedium, color: colors.textSecondary, marginTop: 40 },
  formSection: { paddingHorizontal: 20, marginTop: 16 },
  formCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  field: { marginBottom: 20 },
  label: { fontSize: 10, fontFamily: fonts.bodySemiBold, color: colors.textSecondary, letterSpacing: 1, marginBottom: 8 },
  inputWrapper: { position: 'relative' },
  input: {
    backgroundColor: colors.surfaceWarm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 14,
    color: colors.textPrimary,
    paddingRight: 40,
  },
  inputIcon: { position: 'absolute', right: 14, top: '50%', marginTop: -8 },
  gridRow: { flexDirection: 'row', gap: 10 },
  gridItem: { flex: 1 },
  gridLabel: { fontSize: 10, color: colors.textMuted, marginBottom: 4 },
  gridInput: {
    backgroundColor: colors.surfaceWarm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 13,
    fontFamily: fonts.bodyMedium,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  uploadArea: {
    alignItems: 'center',
    paddingVertical: 24,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.primary200,
    borderRadius: 16,
    backgroundColor: 'rgba(240,253,244,0.3)',
    marginBottom: 20,
  },
  uploadIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  uploadText: { fontSize: 14, fontFamily: fonts.bodyMedium, color: colors.primary },
  uploadHint: { fontSize: 10, color: colors.textMuted, marginTop: 4 },
});
