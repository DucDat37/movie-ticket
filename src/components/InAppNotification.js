import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { theme } from '../theme';

export default function InAppNotification({ visible, title, body, onHide }) {
  const translateY = useRef(new Animated.Value(-120)).current;

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 80 }),
        Animated.delay(4000),
        Animated.timing(translateY, { toValue: -120, duration: 300, useNativeDriver: true }),
      ]).start(() => onHide && onHide());
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY }] }]}>
      <View style={styles.iconBox}>
        <Text style={styles.icon}>🎬</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body} numberOfLines={2}>{body}</Text>
      </View>
      <TouchableOpacity onPress={onHide} style={styles.close}>
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute', top: 52, left: 12, right: 12, zIndex: 9999,
    backgroundColor: theme.colors.primaryDark, borderRadius: 18, padding: 14,
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(251,191,36,0.2)',
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 14, elevation: 22,
  },
  iconBox: {
    width: 46, height: 46, borderRadius: 14, backgroundColor: 'rgba(217,119,6,0.35)',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
    borderWidth: 1, borderColor: 'rgba(251,191,36,0.35)',
  },
  icon: { fontSize: 22 },
  content: { flex: 1 },
  title: { color: '#fff', fontWeight: '900', fontSize: 14, marginBottom: 4 },
  body: { color: '#b8c5d4', fontSize: 12, lineHeight: 18 },
  close: { padding: 4, marginLeft: 8 },
  closeText: { color: '#6b7280', fontSize: 16, fontWeight: '700' },
});
