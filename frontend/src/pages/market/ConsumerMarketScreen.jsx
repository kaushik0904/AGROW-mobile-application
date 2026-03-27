import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors, consumerColors, fonts, shadows } from '../../common/theme';
import CropCard from '../../components/CropCard';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function ConsumerMarketScreen() {
  const [crops, setCrops] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();

  // If navigated from Home with a category
  useEffect(() => {
    if (route.params?.category) {
      setSearchQuery(route.params.category);
    }
  }, [route.params?.category]);

  const fetchCrops = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/crops`);
      const data = await response.json();
      if (response.ok) {
        setCrops(data.crops);
      }
    } catch (error) {
      console.error('Error fetching crops:', error);
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

  const filteredCrops = crops.filter(crop => 
    crop.crop_type.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (crop.category && crop.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (crop.variety && crop.variety.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Marketplace</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search vegetables, fruits..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

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
          ) : filteredCrops.length === 0 ? (
            <Text style={styles.emptyText}>No crops found. Try a different search.</Text>
          ) : (
            filteredCrops.map((crop) => (
              <TouchableOpacity 
                key={crop.id} 
                activeOpacity={0.7} 
                onPress={() => navigation.navigate('ProductDetails', { product: crop })}
              >
                <CropCard 
                  crop={crop} 
                  isOwner={false}
                />
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10 },
  title: { fontSize: 24, fontFamily: fonts.heading, color: consumerColors.primaryDark },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: fonts.bodyMedium,
    color: colors.textPrimary,
  },
  clearBtn: { padding: 4 },
  scrollContent: { paddingBottom: 30 },
  listSection: { paddingHorizontal: 20, gap: 12 },
  emptyText: { textAlign: 'center', fontFamily: fonts.bodyMedium, color: colors.textSecondary, marginTop: 40 },
});
