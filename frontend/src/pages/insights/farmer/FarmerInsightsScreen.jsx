import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput, Keyboard, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors, fonts, shadows } from '../../../common/theme';
import AiAlertBanner from '../../../components/AiAlertBanner';

const priceData = [
  { month: 'Jul', value: 65 },
  { month: 'Aug', value: 45 },
  { month: 'Sep', value: 80 },
  { month: 'Oct', value: 55 },
  { month: 'Nov', value: 90 },
  { month: 'Dec', value: 70 },
];

const recommendations = [
  { id: 1, type: 'bullish', crop: 'Tomatoes', text: 'Sell tomatoes in the local market this week — model predicts a short-term price increase of 8% due to festival demand.', confidence: 87 },
  { id: 2, type: 'bearish', crop: 'Onions', text: 'Hold onion inventory for 2 more weeks. Prices expected to recover after current supply glut eases.', confidence: 72 },
];

export default function InsightsScreen({ navigation }) {
  const maxValue = Math.max(...priceData.map((d) => d.value));
  const insets = useSafeAreaInsets();
  const [isScanning, setIsScanning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [attachedImage, setAttachedImage] = useState(null);
  const [showAttachMenu, setShowAttachMenu] = useState(false);

  const handleAttachImage = async (fromCamera) => {
    setShowAttachMenu(false);
    
    if (fromCamera) {
      const { granted } = await ImagePicker.requestCameraPermissionsAsync();
      if (!granted) { alert("Camera access is required."); return; }
    } else {
      const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!granted) { alert("Gallery access is required."); return; }
    }

    const options = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    };

    const result = fromCamera 
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);

    if (!result.canceled) {
      setAttachedImage(result.assets[0].uri);
    }
  };

  const handleDiscuss = (recText) => {
    navigation.navigate('AiChatScreen', { contextData: recText });
  };

  const submitSearch = () => {
    if (searchQuery.trim() || attachedImage) {
      navigation.navigate('AiChatScreen', { 
        contextData: searchQuery.trim() || 'Please analyze this attached image.', 
        imageUri: attachedImage 
      });
      setSearchQuery('');
      setAttachedImage(null);
      Keyboard.dismiss();
    }
  };

  const handleMicPress = () => {
    alert('Listening... (Voice-to-text mock enabled)');
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top }]} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>AI Insights</Text>
        <Text style={styles.subtitle}>Market intelligence powered by AI</Text>
      </View>

      {/* Claude-style AI Search Card */}
      <View style={[styles.searchContainer, { zIndex: 100 }]}>
        <View style={[styles.claudeCard, shadows.card]}>
          {attachedImage && (
            <View style={styles.attachedImageContainer}>
              <Image source={{ uri: attachedImage }} style={styles.attachedImageObj} />
              <TouchableOpacity style={styles.removeImageBtn} onPress={() => setAttachedImage(null)}>
                <Ionicons name="close-circle" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
          )}

          <TextInput
            style={styles.claudeInput}
            placeholder="How can I help you today?"
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            multiline={true}
          />
          
          <View style={styles.claudeBottomRow}>
            {/* Left Box (Plus button) with attach menu */}
            <View style={{ position: 'relative' }}>
              <TouchableOpacity style={styles.iconBtn} onPress={() => setShowAttachMenu(!showAttachMenu)}>
                <Ionicons name="add" size={28} color={colors.textSecondary} />
              </TouchableOpacity>

              {showAttachMenu && (
                <View style={[styles.attachMenu, shadows.soft]}>
                  <TouchableOpacity style={styles.attachMenuItem} onPress={() => handleAttachImage(false)}>
                    <Ionicons name="image-outline" size={20} color={colors.textSecondary} />
                    <Text style={styles.attachMenuText}>Add files or photos</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.attachMenuItem} onPress={() => handleAttachImage(true)}>
                    <Ionicons name="camera-outline" size={20} color={colors.textSecondary} />
                    <Text style={styles.attachMenuText}>Take a photo</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Right Box (Submit) */}
            <View style={styles.claudeRightActions}>
              <TouchableOpacity style={styles.iconBtn} onPress={handleMicPress}>
                <Ionicons name="mic-outline" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.submitBtn, (searchQuery.trim() || attachedImage) ? styles.submitBtnActive : {}]} 
                onPress={submitSearch}
              >
                <Ionicons name="arrow-up" size={20} color={(searchQuery.trim() || attachedImage) ? colors.white : colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* Alert Banner */}
      <View style={{ paddingHorizontal: 20, marginTop: 15 }}>
        <AiAlertBanner 
          type="warning" 
          title="Weather AI Alert: Heavy Rain" 
          message="Expected tomorrow afternoon. Delay pesticide spraying to avoid wash-off and monitor fields for waterlogging."
        />
      </View>

      {/* Camera Scan CTA */}
      <View style={[styles.section, { zIndex: 1 }]}>
        <TouchableOpacity style={[styles.scanCard, shadows.soft]} onPress={() => handleAttachImage(true)} activeOpacity={0.8}>
          <View style={styles.scanIconWrapper}>
            <Ionicons name="scan" size={24} color={colors.white} />
          </View>
          <View style={styles.scanTextWrapper}>
            <Text style={styles.scanTitle}>Diagnose Crop Disease</Text>
            <Text style={styles.scanSubtitle}>Take a photo for instant AI analysis</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
        
        {isScanning && (
          <View style={styles.scanningAlert}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.scanningText}>AI is analyzing your crop image...</Text>
          </View>
        )}
      </View>

      {/* Price Trend Chart */}
      <View style={styles.section}>
        <View style={[styles.chartCard, shadows.card]}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={styles.chartTitle}>6-Month Price Trend</Text>
              <Text style={styles.chartSubtitle}>Tomatoes — Nashik Region</Text>
            </View>
            <View style={styles.trendBadge}>
              <Ionicons name="trending-up" size={14} color="#16a34a" />
              <Text style={styles.trendText}>+8%</Text>
            </View>
          </View>

          <View style={styles.chartArea}>
            {priceData.map((item, i) => (
              <View key={item.month} style={styles.barCol}>
                <Text style={styles.barValue}>₹{item.value}</Text>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: `${(item.value / maxValue) * 100}%`,
                        backgroundColor: i === priceData.length - 2 ? colors.primary : i === priceData.length - 1 ? colors.primaryLight : 'rgba(22,101,52,0.35)',
                      },
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{item.month}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* AI Recommendations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>PERSONALIZED RECOMMENDATIONS</Text>
        {recommendations.map((rec) => (
          <View key={rec.id} style={[styles.recCard, shadows.soft]}>
            <View style={styles.recTop}>
              <View style={[styles.recIcon, { backgroundColor: rec.type === 'bullish' ? colors.emerald100 : colors.amber100 }]}>
                <Ionicons
                  name={rec.type === 'bullish' ? 'trending-up' : 'trending-down'}
                  size={20}
                  color={rec.type === 'bullish' ? '#16a34a' : colors.amber600}
                />
              </View>
              <View style={styles.recContent}>
                <View style={styles.recTitleRow}>
                  <Text style={styles.recCrop}>{rec.crop}</Text>
                  <View style={[styles.recTypeBadge, { backgroundColor: rec.type === 'bullish' ? colors.emerald100 : colors.amber100 }]}>
                    <Text style={[styles.recTypeText, { color: rec.type === 'bullish' ? '#15803d' : colors.amber700 }]}>
                      {rec.type === 'bullish' ? '📈 Sell' : '⏳ Hold'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.recText}>{rec.text}</Text>

                {/* Confidence */}
                <View style={styles.confRow}>
                  <Ionicons name="bulb-outline" size={12} color={colors.textMuted} />
                  <Text style={styles.confLabel}>Confidence:</Text>
                  <View style={styles.confTrack}>
                    <View
                      style={[
                        styles.confFill,
                        {
                          width: `${rec.confidence}%`,
                          backgroundColor: rec.type === 'bullish' ? '#22c55e' : colors.amber500,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.confValue}>{rec.confidence}%</Text>
                </View>
              </View>
            </View>

            <View style={styles.recActions}>
              <TouchableOpacity style={styles.recActionBtn} activeOpacity={0.7}>
                <Ionicons name="checkmark-circle-outline" size={16} color={colors.primary} />
                <Text style={[styles.recActionText, { color: colors.primary }]}>Mark as Read</Text>
              </TouchableOpacity>
              <View style={styles.recDivider} />
              <TouchableOpacity style={styles.recActionBtn} activeOpacity={0.7} onPress={() => handleDiscuss(rec.text)}>
                <Ionicons name="chatbubbles-outline" size={16} color={colors.secondary} />
                <Text style={[styles.recActionText, { color: colors.secondaryDark }]}>Ask AI</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  scrollContent: { paddingBottom: 30 },
  header: { paddingHorizontal: 20, paddingTop: 20 },
  title: { fontSize: 24, fontFamily: fonts.heading, color: colors.primaryDark },
  subtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  
  searchContainer: { paddingHorizontal: 20, marginTop: 15 },
  claudeCard: { backgroundColor: colors.white, borderRadius: 16, padding: 12, borderWidth: 1, borderColor: colors.borderLight },
  claudeInput: { fontSize: 16, fontFamily: fonts.bodyMedium, color: colors.textPrimary, minHeight: 40, maxHeight: 120, marginBottom: 8, paddingHorizontal: 4, textAlignVertical: 'top' },
  claudeBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 },
  iconBtn: { padding: 4, justifyContent: 'center', alignItems: 'center' },
  claudeRightActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  submitBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.gray100, justifyContent: 'center', alignItems: 'center' },
  submitBtnActive: { backgroundColor: '#ea580c' }, // Claude-like orange primary
  attachMenu: { position: 'absolute', bottom: 40, left: 0, backgroundColor: colors.white, borderRadius: 12, borderWidth: 1, borderColor: colors.borderLight, paddingVertical: 8, width: 220, zIndex: 100 },
  attachMenuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, gap: 12 },
  attachMenuText: { fontSize: 14, fontFamily: fonts.bodyMedium, color: colors.textPrimary },
  attachedImageContainer: { width: 80, height: 80, marginBottom: 12, marginLeft: 4, position: 'relative' },
  attachedImageObj: { width: '100%', height: '100%', borderRadius: 8, borderWidth: 1, borderColor: colors.borderLight },
  removeImageBtn: { position: 'absolute', top: -10, right: -10, backgroundColor: colors.surface, borderRadius: 12, elevation: 2 },

  section: { paddingHorizontal: 20, marginTop: 20 },
  sectionTitle: { fontSize: 11, fontFamily: fonts.bodySemiBold, color: colors.textSecondary, letterSpacing: 1, marginBottom: 12 },
  
  scanCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: colors.primaryLight },
  scanIconWrapper: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  scanTextWrapper: { flex: 1 },
  scanTitle: { fontSize: 16, fontFamily: fonts.headingSemiBold, color: colors.textPrimary },
  scanSubtitle: { fontSize: 12, fontFamily: fonts.bodyMedium, color: colors.textSecondary, marginTop: 2 },
  scanningAlert: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12, paddingHorizontal: 8 },
  scanningText: { fontSize: 13, fontFamily: fonts.bodyMedium, color: colors.primary },

  chartCard: { backgroundColor: colors.card, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: colors.borderLight },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  chartTitle: { fontSize: 15, fontFamily: fonts.headingSemiBold, color: colors.textPrimary },
  chartSubtitle: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  trendBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.emerald50, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  trendText: { fontSize: 12, fontFamily: fonts.bodySemiBold, color: '#16a34a' },
  chartArea: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 130, gap: 8 },
  barCol: { flex: 1, alignItems: 'center', gap: 4 },
  barValue: { fontSize: 9, fontFamily: fonts.bodySemiBold, color: colors.textPrimary },
  barTrack: { flex: 1, width: '100%', justifyContent: 'flex-end' },
  bar: { width: '100%', borderTopLeftRadius: 6, borderTopRightRadius: 6, minHeight: 8 },
  barLabel: { fontSize: 10, fontFamily: fonts.bodyMedium, color: colors.textMuted },
  
  recCard: { backgroundColor: colors.card, borderRadius: 18, borderWidth: 1, borderColor: colors.borderLight, overflow: 'hidden', marginBottom: 14 },
  recTop: { flexDirection: 'row', padding: 18, gap: 12 },
  recIcon: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  recContent: { flex: 1 },
  recTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  recCrop: { fontSize: 15, fontFamily: fonts.headingSemiBold, color: colors.textPrimary },
  recTypeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  recTypeText: { fontSize: 9, fontFamily: fonts.bodySemiBold, textTransform: 'uppercase' },
  recText: { fontSize: 13, color: colors.textSecondary, marginTop: 8, lineHeight: 19 },
  confRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
  confLabel: { fontSize: 10, color: colors.textMuted },
  confTrack: { flex: 1, height: 5, backgroundColor: colors.gray100, borderRadius: 10, overflow: 'hidden' },
  confFill: { height: '100%', borderRadius: 10 },
  confValue: { fontSize: 10, fontFamily: fonts.bodySemiBold, color: colors.textPrimary },
  recActions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.borderLight },
  recActionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12 },
  recActionText: { fontSize: 13, fontFamily: fonts.bodyMedium },
  recDivider: { width: 1, backgroundColor: colors.borderLight },
});
