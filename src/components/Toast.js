import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { theme } from '../theme';

export default function Toast({ visible, message, type = 'error', onHide }) {
  const opacity = new Animated.Value(0);

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.delay(2500),
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start(() => onHide && onHide());
    }
  }, [visible]);

  if (!visible) return null;

  const bg = type === 'success' ? theme.colors.success : type === 'warning' ? theme.colors.accent : theme.colors.danger;
  const icon = type === 'success' ? '✓' : type === 'warning' ? '⚠' : '✕';

  return (
    <Animated.View style={[styles.container, { opacity, backgroundColor: bg }]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute', top: 56, left: 18, right: 18,
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 14, padding: 16, zIndex: 9999,
    elevation: 20, shadowColor: '#0c121c', shadowOpacity: 0.35, shadowRadius: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  icon: { color: '#fff', fontSize: 17, fontWeight: '900', marginRight: 12 },
  message: { color: '#fff', fontSize: 14, fontWeight: '700', flex: 1, lineHeight: 20 },
});
