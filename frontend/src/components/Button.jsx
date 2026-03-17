import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts } from '../common/theme';

export default function Button({ children, variant = 'primary', onPress, style, textStyle, icon }) {
  if (variant === 'primary') {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={[styles.wrapper, style]}>
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          {icon}
          <Text style={[styles.primaryText, textStyle]}>{children}</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  const variantStyles = {
    secondary: { bg: colors.primary50, text: colors.primary },
    outline: { bg: 'transparent', text: colors.primary, border: colors.primary },
    danger: { bg: colors.red50, text: colors.danger },
    ghost: { bg: 'transparent', text: colors.textSecondary },
  };

  const v = variantStyles[variant] || variantStyles.ghost;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.button,
        { backgroundColor: v.bg },
        v.border && { borderWidth: 2, borderColor: v.border },
        style,
      ]}
    >
      {icon}
      <Text style={[styles.text, { color: v.text }, textStyle]}>{children}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: { borderRadius: 14, overflow: 'hidden' },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    gap: 8,
  },
  primaryText: {
    color: colors.white,
    fontSize: 15,
    fontFamily: fonts.bodySemiBold,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    gap: 8,
  },
  text: {
    fontSize: 15,
    fontFamily: fonts.bodySemiBold,
  },
});
