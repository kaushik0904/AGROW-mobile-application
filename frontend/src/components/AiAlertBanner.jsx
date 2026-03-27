import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '../common/theme';

export default function AiAlertBanner({ type = 'warning', title, message }) {
  const isDanger = type === 'danger';
  const bgColor = isDanger ? colors.rose50 : colors.amber50;
  const iconColor = isDanger ? colors.rose600 : colors.amber600;
  const textColor = isDanger ? colors.rose700 : colors.amber800;
  const borderColor = isDanger ? colors.rose200 : colors.amber200;
  const iconName = isDanger ? 'warning' : 'alert-circle';

  return (
    <View style={[styles.container, { backgroundColor: bgColor, borderColor }]}>
      <View style={styles.iconContainer}>
        <Ionicons name={iconName} size={24} color={iconColor} />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: textColor }]}>{title}</Text>
        <Text style={[styles.message, { color: textColor }]}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  iconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontFamily: fonts.headingSemiBold,
    marginBottom: 4,
  },
  message: {
    fontSize: 13,
    fontFamily: fonts.bodyMedium,
    lineHeight: 18,
  },
});
