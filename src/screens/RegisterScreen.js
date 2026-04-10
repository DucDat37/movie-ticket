import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView,
  Platform, ScrollView
} from 'react-native';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from '../components/Toast';
import { theme, shadows } from '../theme';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'error' });

  const showToast = (message, type = 'error') => {
    setToast({ visible: true, message, type });
  };

  const handleRegister = async () => {
    if (!name || !email || !password || !confirm) {
      showToast('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    if (password !== confirm) {
      showToast('Mật khẩu xác nhận không khớp');
      return;
    }
    if (password.length < 6) {
      showToast('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    setLoading(true);
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCred.user, { displayName: name });
      await setDoc(doc(db, 'users', userCred.user.uid), {
        name, email, createdAt: new Date().toISOString()
      });
      showToast('Đăng ký thành công!', 'success');
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        showToast('Email này đã được sử dụng');
      } else if (error.code === 'auth/invalid-email') {
        showToast('Email không hợp lệ');
      } else {
        showToast('Đăng ký thất bại. Vui lòng thử lại');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#0c121c', '#1a2f4a', '#2d4a6f']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast(t => ({ ...t, visible: false }))}
      />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inner}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Text style={styles.kicker}>MovieTix</Text>
          <Text style={styles.tagline}>Tạo tài khoản để lưu vé và nhận nhắc suất chiếu</Text>

          <View style={styles.card}>
            <Text style={styles.title}>Đăng ký</Text>

            <Text style={styles.fieldLabel}>Họ và tên</Text>
            <TextInput style={styles.input} placeholder="Nguyễn Văn A" placeholderTextColor={theme.colors.muted}
              value={name} onChangeText={setName} />
            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput style={styles.input} placeholder="you@email.com" placeholderTextColor={theme.colors.muted}
              value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            <Text style={styles.fieldLabel}>Mật khẩu</Text>
            <TextInput style={styles.input} placeholder="Tối thiểu 6 ký tự" placeholderTextColor={theme.colors.muted}
              value={password} onChangeText={setPassword} secureTextEntry />
            <Text style={styles.fieldLabel}>Xác nhận mật khẩu</Text>
            <TextInput style={styles.input} placeholder="Nhập lại mật khẩu" placeholderTextColor={theme.colors.muted}
              value={confirm} onChangeText={setConfirm} secureTextEntry />

            <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading} activeOpacity={0.9}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Tạo tài khoản</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.linkWrap}>
              <Text style={styles.link}>Đã có tài khoản? <Text style={styles.linkBold}>Đăng nhập</Text></Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, padding: 24, paddingTop: 56 },
  kicker: {
    fontSize: 34, fontWeight: '900', color: '#fff', letterSpacing: -0.5,
    textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 6,
  },
  tagline: { color: '#b8c5d4', fontSize: 14, marginTop: 8, marginBottom: 22, lineHeight: 20 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderRadius: theme.radius.xl,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    marginBottom: 32,
    ...shadows.card,
  },
  title: { fontSize: 22, fontWeight: '900', color: theme.colors.ink, marginBottom: 18 },
  fieldLabel: { fontSize: 12, fontWeight: '800', color: theme.colors.inkSecondary, marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.md,
    paddingHorizontal: 16, paddingVertical: 14, marginBottom: 14, color: theme.colors.ink, fontSize: 16,
    backgroundColor: theme.colors.surfaceMuted,
  },
  button: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.md,
    padding: 16, alignItems: 'center', marginTop: 8, marginBottom: 16,
  },
  buttonText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  linkWrap: { alignItems: 'center' },
  link: { textAlign: 'center', color: theme.colors.muted, fontSize: 14 },
  linkBold: { color: theme.colors.accentHover, fontWeight: '800' },
});
