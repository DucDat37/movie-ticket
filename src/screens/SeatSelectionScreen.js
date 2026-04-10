import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator
} from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import Toast from '../components/Toast';
import { theme } from '../theme';

const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const COLS = 8;

export default function SeatSelectionScreen({ route, navigation }) {
  const { movie, showtime } = route.params;
  const [bookedSeats, setBookedSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'error' });

  useEffect(() => { fetchBookedSeats(); }, []);

  const fetchBookedSeats = async () => {
    try {
      const snap = await getDoc(doc(db, 'showtimes', showtime.id));
      if (snap.exists()) setBookedSeats(snap.data().bookedSeats || []);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleSeat = (seat) => {
    if (bookedSeats.includes(seat)) return;
    setSelectedSeats(prev =>
      prev.includes(seat) ? prev.filter(s => s !== seat) : [...prev, seat]
    );
  };

  const getSeatStatus = (seat) => {
    if (bookedSeats.includes(seat)) return 'booked';
    if (selectedSeats.includes(seat)) return 'selected';
    return 'available';
  };

  const totalPrice = selectedSeats.length * (showtime.price || 85000);

  const handleContinue = () => {
    if (selectedSeats.length === 0) {
      setToast({ visible: true, message: 'Vui lòng chọn ít nhất 1 ghế', type: 'warning' });
      return;
    }
    navigation.navigate('BookingConfirm', { movie, showtime, selectedSeats, totalPrice });
  };

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
        <Text style={styles.loadingText}>Đang tải sơ đồ ghế...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast(t => ({ ...t, visible: false }))}
      />

      {/* Movie info bar */}
      <View style={styles.infoBar}>
        <Text style={styles.infoTitle} numberOfLines={1}>{movie.title}</Text>
        <Text style={styles.infoSub}>{showtime.date} • {showtime.time} • {showtime.theaterName}</Text>
      </View>

      {/* Screen */}
      <View style={styles.screenWrap}>
        <View style={styles.screen} />
        <Text style={styles.screenLabel}>MÀN HÌNH</Text>
      </View>

      {/* Seat map */}
      <ScrollView contentContainerStyle={styles.seatsContainer} showsVerticalScrollIndicator={false}>
        {ROWS.map(row => (
          <View key={row} style={styles.rowContainer}>
            <Text style={styles.rowLabel}>{row}</Text>
            <View style={styles.seatRow}>
              {Array.from({ length: COLS }, (_, i) => {
                const seat = `${row}${i + 1}`;
                const status = getSeatStatus(seat);
                return (
                  <TouchableOpacity
                    key={seat}
                    style={[styles.seat, styles[`seat_${status}`]]}
                    onPress={() => toggleSeat(seat)}
                    disabled={status === 'booked'}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.seatText, status === 'booked' && styles.seatTextBooked]}>
                      {i + 1}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={styles.rowLabel}>{row}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Legend */}
      <View style={styles.legend}>
        {[
          { status: 'seat_available', label: 'Trống' },
          { status: 'seat_selected', label: 'Đang chọn' },
          { status: 'seat_booked', label: 'Đã đặt' },
        ].map(item => (
          <View key={item.label} style={styles.legendItem}>
            <View style={[styles.legendDot, styles[item.status]]} />
            <Text style={styles.legendText}>{item.label}</Text>
          </View>
        ))}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerInfo}>
          <Text style={styles.footerSeats}>
            {selectedSeats.length > 0 ? `Ghế: ${selectedSeats.join(', ')}` : 'Chưa chọn ghế'}
          </Text>
          <Text style={styles.footerPrice}>
            {totalPrice > 0 ? `${totalPrice.toLocaleString('vi-VN')}đ` : '—'}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.continueBtn, selectedSeats.length === 0 && styles.continueBtnDisabled]}
          onPress={handleContinue}
          activeOpacity={0.85}
        >
          <Text style={styles.continueBtnText}>
            {selectedSeats.length > 0 ? `Đặt ${selectedSeats.length} ghế →` : 'Chọn ghế'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.primaryDark },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.primaryDark },
  loadingText: { color: '#9ca3af', marginTop: 14, fontWeight: '600' },

  infoBar: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: 'rgba(251,191,36,0.12)',
  },
  infoTitle: { color: '#f8fafc', fontSize: 16, fontWeight: '900' },
  infoSub: { color: '#9ca3af', fontSize: 12, marginTop: 4 },

  screenWrap: { alignItems: 'center', paddingVertical: 18 },
  screen: {
    width: '78%', height: 5, backgroundColor: theme.colors.accent,
    borderRadius: 3, marginBottom: 8,
    shadowColor: theme.colors.accent, shadowOpacity: 0.55, shadowRadius: 16, elevation: 10,
  },
  screenLabel: { color: '#6b7280', fontSize: 11, letterSpacing: 4, fontWeight: '800' },

  seatsContainer: { paddingHorizontal: 12, paddingBottom: 8 },
  rowContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, justifyContent: 'center' },
  rowLabel: { width: 18, color: '#6b7280', fontWeight: '800', fontSize: 12, textAlign: 'center' },
  seatRow: { flexDirection: 'row', gap: 6, marginHorizontal: 8 },
  seat: { width: 34, height: 30, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  seat_available: { backgroundColor: '#1a2740', borderWidth: 1, borderColor: 'rgba(217,119,6,0.45)' },
  seat_selected: { backgroundColor: theme.colors.accent, borderWidth: 1, borderColor: '#fbbf24' },
  seat_booked: { backgroundColor: '#151b26', borderWidth: 1, borderColor: '#2d3544' },
  seatText: { fontSize: 10, fontWeight: '800', color: '#fcd34d' },
  seatTextBooked: { color: '#3d4554' },

  legend: { flexDirection: 'row', justifyContent: 'center', gap: 24, paddingVertical: 12, backgroundColor: theme.colors.primaryDark },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 18, height: 14, borderRadius: 4 },
  legendText: { fontSize: 12, color: '#9ca3af' },

  footer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#111827', padding: 16, paddingBottom: 26,
    borderTopWidth: 1, borderTopColor: 'rgba(251,191,36,0.15)',
  },
  footerInfo: { flex: 1, marginRight: 12 },
  footerSeats: { color: '#9ca3af', fontSize: 12, marginBottom: 2 },
  footerPrice: { color: '#fbbf24', fontSize: 19, fontWeight: '900' },
  continueBtn: { backgroundColor: theme.colors.accent, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 20 },
  continueBtnDisabled: { backgroundColor: '#374151' },
  continueBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
});
