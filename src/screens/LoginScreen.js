import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from '../components/Toast';
import { theme, shadows } from '../theme';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'error' });

  const showToast = (message, type = 'error') => {
    setToast({ visible: true, message, type });
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showToast('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        showToast('Email hoặc mật khẩu không đúng');
      } else if (error.code === 'auth/user-not-found') {
        showToast('Tài khoản không tồn tại');
      } else if (error.code === 'auth/too-many-requests') {
        showToast('Quá nhiều lần thử. Vui lòng thử lại sau');
      } else {
        showToast('Đăng nhập thất bại. Vui lòng thử lại');
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
        <View style={styles.brandBlock}>
          <Text style={styles.kicker}>MovieTix</Text>
          <Text style={styles.tagline}>Đặt vé chỉ vài chạm — không xếp hàng</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Đăng nhập</Text>
          <Text style={styles.cardHint}>Nhập email và mật khẩu đã đăng ký</Text>

          <Text style={styles.fieldLabel}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="you@email.com"
            placeholderTextColor={theme.colors.muted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Text style={styles.fieldLabel}>Mật khẩu</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor={theme.colors.muted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading} activeOpacity={0.9}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Đăng nhập</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.linkWrap}>
            <Text style={styles.link}>Chưa có tài khoản? <Text style={styles.linkBold}>Đăng ký</Text></Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, justifyContent: 'center', padding: 24 },
  brandBlock: { marginBottom: 28 },
  kicker: {
    fontSize: 38, fontWeight: '900', color: '#fff', letterSpacing: -1,
    textShadowColor: 'rgba(0,0,0,0.35)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 8,
  },
  tagline: { color: '#c4ced9', fontSize: 15, marginTop: 10, lineHeight: 22, maxWidth: 280 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderRadius: theme.radius.xl,
    padding: 26,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    ...shadows.card,
  },
  title: { fontSize: 24, fontWeight: '900', color: theme.colors.ink, marginBottom: 6 },
  cardHint: { fontSize: 13, color: theme.colors.muted, marginBottom: 20 },
  fieldLabel: { fontSize: 12, fontWeight: '800', color: theme.colors.inkSecondary, marginBottom: 6, letterSpacing: 0.3 },
  input: {
    borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.md,
    paddingHorizontal: 16, paddingVertical: 14, marginBottom: 16, color: theme.colors.ink, fontSize: 16,
    backgroundColor: theme.colors.surfaceMuted,
  },
  button: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.md,
    padding: 16, alignItems: 'center', marginTop: 6, marginBottom: 18,
  },
  buttonText: { color: '#fff', fontWeight: '800', fontSize: 16, letterSpacing: 0.4 },
  linkWrap: { alignItems: 'center' },
  link: { textAlign: 'center', color: theme.colors.muted, fontSize: 14 },
  linkBold: { color: theme.colors.accentHover, fontWeight: '800' },
});
