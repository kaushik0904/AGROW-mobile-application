import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, shadows } from '../../common/theme';

export default function AiChatScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const contextData = route.params?.contextData || 'How can I assist you with your farm today?';
  const imageUri = route.params?.imageUri || null;
  
  const initialMessages = [];
  if (imageUri) {
    initialMessages.push({ id: 1, sender: 'user', image: imageUri, text: contextData });
    initialMessages.push({ id: 2, sender: 'ai', text: "I'm analyzing the image you uploaded. One moment please..." });
  } else {
    initialMessages.push({ id: 1, sender: 'ai', text: `Hello! Let's discuss: "${contextData}". \n\nHow can I help you regarding this?` });
  }

  const [messages, setMessages] = useState(initialMessages);
  const [inputText, setInputText] = useState('');

  const sendMessage = () => {
    if (!inputText.trim()) return;
    
    // Add user message
    const userMsg = { id: Date.now(), sender: 'user', text: inputText };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    // Mock AI response
    setTimeout(() => {
      setMessages(prev => [
        ...prev, 
        { id: Date.now() + 1, sender: 'ai', text: "I'm analyzing your request based on the current market data and your crop profile. One moment please..." }
      ]);
    }, 1000);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.screen} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Agronomist Chat</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Chat Area */}
      <ScrollView 
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg) => (
          <View key={msg.id} style={[styles.messageBubble, msg.sender === 'user' ? styles.userBubble : styles.aiBubble]}>
            {msg.sender === 'ai' && (
              <Ionicons name="logo-android" size={16} color={colors.primaryDark} style={styles.aiIcon} />
            )}
            <View>
              {msg.image && (
                <Image source={{ uri: msg.image }} style={styles.chatImage} />
              )}
              {msg.text ? (
                <Text style={[styles.messageText, msg.sender === 'user' && { color: colors.white }]}>
                  {msg.text}
                </Text>
              ) : null}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Input Area */}
      <View style={[styles.inputContainer, { paddingBottom: insets.bottom || 20 }]}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Ask a question..."
            placeholderTextColor={colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendBtn, !inputText.trim() && { opacity: 0.5 }]} 
            onPress={sendMessage}
            disabled={!inputText.trim()}
          >
            <Ionicons name="send" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.white
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontFamily: fonts.headingSemiBold, color: colors.textPrimary },
  chatContent: { padding: 20, gap: 16 },
  messageBubble: { maxWidth: '85%', padding: 14, borderRadius: 18 },
  userBubble: { 
    backgroundColor: colors.primary, 
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  aiBubble: { 
    backgroundColor: colors.white,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    ...shadows.soft,
    flexDirection: 'row',
  },
  aiIcon: { marginRight: 8, marginTop: 2 },
  messageText: { fontSize: 14, fontFamily: fonts.bodyMedium, color: colors.textPrimary, lineHeight: 20 },
  inputContainer: { 
    paddingHorizontal: 20, 
    paddingTop: 12, 
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.surface,
    borderRadius: 24,
    paddingRight: 6,
    paddingLeft: 16,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.textPrimary,
    paddingTop: 10,
    paddingBottom: 10,
  },
  sendBtn: {
    backgroundColor: colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 8,
  }
});
