import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { LinearGradient } from 'expo-linear-gradient';
import { theme, shadows } from '../theme';

export default function ProfileScreen() {
  const user = auth.currentUser;
  const [logoutModal, setLogoutModal] = useState(false);

  const getInitial = () => (user?.displayName || user?.email || 'U')[0].toUpperCase();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0c121c', '#1a2f4a', '#243b5c']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitial()}</Text>
        </View>
        <Text style={styles.name}>{user?.displayName || 'Người dùng'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </LinearGradient>

      <View style={styles.body}>
        <Text style={styles.sectionLabel}>Tài khoản</Text>
        <MenuItem icon="🎟️" label="Vé của tôi" />
        <MenuItem icon="🔔" label="Thông báo" />
        <MenuItem icon="🔒" label="Đổi mật khẩu" />
        <Text style={[styles.sectionLabel, { marginTop: 8 }]}>Hỗ trợ</Text>
        <MenuItem icon="📞" label="Liên hệ hỗ trợ" />

        <TouchableOpacity style={styles.logoutBtn} onPress={() => setLogoutModal(true)}>
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>

      {/* Logout confirm modal */}
      <Modal visible={logoutModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalIcon}>👋</Text>
            <Text style={styles.modalTitle}>Đăng xuất?</Text>
            <Text style={styles.modalSub}>Bạn có chắc muốn đăng xuất khỏi tài khoản không?</Text>
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setLogoutModal(false)}
              >
                <Text style={styles.cancelText}>Huỷ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={() => { setLogoutModal(false); signOut(auth); }}
              >
                <Text style={styles.confirmText}>Đăng xuất</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function MenuItem({ icon, label }) {
  return (
    <TouchableOpacity style={styles.menuItem}>
      <Text style={styles.menuIcon}>{icon}</Text>
      <Text style={styles.menuLabel}>{label}</Text>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  header: { paddingTop: 60, paddingBottom: 36, alignItems: 'center' },
  avatar: {
    width: 88, height: 88, borderRadius: 44, backgroundColor: 'rgba(217,119,6,0.25)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
    borderWidth: 3, borderColor: 'rgba(251,191,36,0.55)',
  },
  avatarText: { fontSize: 36, color: '#fbbf24', fontWeight: '900' },
  name: { color: '#fff', fontSize: 22, fontWeight: '900' },
  email: { color: '#b8c5d4', fontSize: 14, marginTop: 6, fontWeight: '500' },
  body: { padding: 20 },
  sectionLabel: { fontSize: 12, fontWeight: '800', color: theme.colors.muted, letterSpacing: 0.8, marginBottom: 10, marginLeft: 4, textTransform: 'uppercase' },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md, padding: 16, marginBottom: 10,
    borderWidth: 1, borderColor: theme.colors.border, ...shadows.soft,
  },
  menuIcon: { fontSize: 20, marginRight: 14 },
  menuLabel: { flex: 1, fontSize: 15, color: theme.colors.ink, fontWeight: '700' },
  arrow: { fontSize: 20, color: theme.colors.borderStrong },
  logoutBtn: {
    backgroundColor: theme.colors.surface, borderRadius: theme.radius.md, padding: 16,
    alignItems: 'center', marginTop: 14, borderWidth: 1.5, borderColor: theme.colors.danger,
  },
  logoutText: { color: theme.colors.danger, fontWeight: '900', fontSize: 15 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(12,18,28,0.55)', alignItems: 'center', justifyContent: 'center', padding: 32 },
  modalCard: { backgroundColor: theme.colors.surface, borderRadius: theme.radius.xl, padding: 28, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border },
  modalIcon: { fontSize: 48, marginBottom: 12 },
  modalTitle: { fontSize: 20, fontWeight: '900', color: theme.colors.ink, marginBottom: 8 },
  modalSub: { color: theme.colors.muted, fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  modalBtns: { flexDirection: 'row', gap: 12, width: '100%' },
  cancelBtn: { flex: 1, backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radius.md, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border },
  cancelText: { color: theme.colors.inkSecondary, fontWeight: '800', fontSize: 15 },
  confirmBtn: { flex: 1, backgroundColor: theme.colors.danger, borderRadius: theme.radius.md, padding: 14, alignItems: 'center' },
  confirmText: { color: '#fff', fontWeight: '900', fontSize: 15 },
});
