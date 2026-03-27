import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { consumerColors, fonts, colors, shadows } from '../../../common/theme';
import { useAuth } from '../../../context/AuthContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function EditConsumerProfileScreen({ navigation, route }) {
  const { userProfile } = route.params || {};
  const insets = useSafeAreaInsets();
  const { token, updateUser } = useAuth();
  const themeColors = consumerColors;

  const [name, setName] = useState(userProfile?.name || '');
  const [location, setLocation] = useState(userProfile?.location || '');
  const profileImage = userProfile?.profile_image || null;
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: name.trim(),
          farm_name: '',
          farm_size: '',
          location: location.trim(),
          profile_image: profileImage
        })
      });

      const data = await response.json();
      if (response.ok) {
        updateUser({ name: name.trim() });
        Alert.alert('Success', 'Profile updated successfully', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Error', data.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      Alert.alert('Error', 'Could not connect to the server');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.screen} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.formContainer, { paddingBottom: insets.bottom + 20 }]} showsVerticalScrollIndicator={false}>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter your full name"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Delivery Address</Text>
          <TextInput
            style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]}
            value={location}
            onChangeText={setLocation}
            multiline={true}
            placeholder="Enter full delivery address"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        <TouchableOpacity 
          style={[styles.saveBtn, { backgroundColor: themeColors.primary }, shadows.soft]} 
          onPress={handleSave} 
          disabled={isSaving}
          activeOpacity={0.8}
        >
          {isSaving ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.saveBtnText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: colors.borderLight, backgroundColor: colors.white },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontFamily: fonts.headingSemiBold, color: colors.textPrimary },
  formContainer: { padding: 24 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontFamily: fonts.bodyMedium, color: colors.textSecondary, marginBottom: 8 },
  input: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.borderLight, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, fontFamily: fonts.body, color: colors.textPrimary },
  saveBtn: { borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 10 },
  saveBtnText: { color: colors.white, fontSize: 16, fontFamily: fonts.bodySemiBold },
});
