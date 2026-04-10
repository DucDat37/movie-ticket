import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  ActivityIndicator, TouchableOpacity, Modal, Image
} from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { theme, shadows } from '../theme';

export default function TicketsScreen() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => { fetchTickets(); }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      const q = query(collection(db, 'tickets'), where('userId', '==', user.uid));
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => new Date(b.bookedAt) - new Date(a.bookedAt));
      setTickets(data);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const renderTicket = ({ item }) => (
    <TouchableOpacity style={styles.ticket} onPress={() => setSelected(item)} activeOpacity={0.85}>
      {/* Left: movie info */}
      <View style={styles.ticketLeft}>
        <Image source={{ uri: item.moviePoster }} style={styles.ticketPoster} />
        <View style={styles.ticketInfo}>
          <Text style={styles.movieTitle} numberOfLines={2}>{item.movieTitle}</Text>
          <Text style={styles.theater} numberOfLines={1}>🏛️ {item.theaterName}</Text>
          <Text style={styles.datetime}>📅 {item.date} • {item.time}</Text>
          <Text style={styles.seats}>💺 Ghế: <Text style={styles.seatsBold}>{item.seats.join(', ')}</Text></Text>
          <View style={[styles.statusBadge, item.status === 'confirmed' ? styles.confirmed : styles.cancelled]}>
            <Text style={styles.statusText}>{item.status === 'confirmed' ? '✓ Đã xác nhận' : '✕ Đã huỷ'}</Text>
          </View>
        </View>
      </View>

      {/* Right: code + price */}
      <View style={styles.ticketRight}>
        <View style={styles.qrBox}>
          <Text style={styles.qrIcon}>▦</Text>
          <Text style={styles.ticketCode}>{item.id.slice(0, 6).toUpperCase()}</Text>
        </View>
        <Text style={styles.price}>{item.totalPrice.toLocaleString('vi-VN')}đ</Text>
        <Text style={styles.tapDetail}>Xem chi tiết</Text>
      </View>

      {/* Perforated edge */}
      <View style={styles.perfTop} />
      <View style={styles.perfBottom} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Vé của tôi</Text>
          <Text style={styles.headerSub}>{tickets.length} vé đã đặt</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={fetchTickets}>
          <Text style={styles.refreshIcon}>↻</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
          <Text style={styles.loadingText}>Đang tải vé...</Text>
        </View>
      ) : tickets.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🎟️</Text>
          <Text style={styles.emptyTitle}>Chưa có vé nào</Text>
          <Text style={styles.emptyText}>Đặt vé ngay để xem phim yêu thích!</Text>
        </View>
      ) : (
        <FlatList
          data={tickets}
          keyExtractor={i => i.id}
          renderItem={renderTicket}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          onRefresh={fetchTickets}
          refreshing={loading}
        />
      )}

      {/* Ticket detail modal */}
      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {/* Handle */}
            <View style={styles.handle} />

            <Text style={styles.modalMovieTitle}>{selected?.movieTitle}</Text>

            {/* QR area */}
            <View style={styles.modalQRArea}>
              <Text style={styles.modalQRIcon}>▦</Text>
              <Text style={styles.modalTicketCode}>{selected?.id.slice(0, 8).toUpperCase()}</Text>
              <Text style={styles.modalQRHint}>Xuất trình mã này tại quầy</Text>
            </View>

            {/* Details */}
            <View style={styles.modalDetails}>
              <ModalRow label="Rạp chiếu" value={selected?.theaterName} />
              <ModalRow label="Ngày" value={selected?.date} />
              <ModalRow label="Giờ" value={selected?.time} />
              <ModalRow label="Ghế" value={selected?.seats?.join(', ')} highlight />
              <ModalRow label="Tổng tiền" value={`${selected?.totalPrice?.toLocaleString('vi-VN')}đ`} highlight />
            </View>

            <TouchableOpacity style={styles.modalClose} onPress={() => setSelected(null)}>
              <Text style={styles.modalCloseText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function ModalRow({ label, value, highlight }) {
  return (
    <View style={styles.modalRow}>
      <Text style={styles.modalLabel}>{label}</Text>
      <Text style={[styles.modalValue, highlight && styles.modalHighlight]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },

  header: {
    backgroundColor: theme.colors.primaryDark, paddingTop: 52, paddingBottom: 22,
    paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  headerTitle: { color: '#fff', fontSize: 26, fontWeight: '900', letterSpacing: -0.3 },
  headerSub: { color: '#b8c5d4', fontSize: 13, marginTop: 4, fontWeight: '600' },
  refreshBtn: { backgroundColor: 'rgba(251,191,36,0.15)', borderRadius: 12, width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(251,191,36,0.25)' },
  refreshIcon: { color: '#fbbf24', fontSize: 22, fontWeight: '700' },

  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: theme.colors.muted, marginTop: 14, fontSize: 14, fontWeight: '600' },

  ticket: {
    backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, marginBottom: 16,
    flexDirection: 'row', overflow: 'hidden', position: 'relative',
    borderWidth: 1, borderColor: theme.colors.border, ...shadows.card,
  },
  ticketLeft: { flex: 1, flexDirection: 'row' },
  ticketPoster: { width: 82, height: 124 },
  ticketInfo: { flex: 1, padding: 12, justifyContent: 'space-between' },
  movieTitle: { fontSize: 15, fontWeight: '900', color: theme.colors.ink, marginBottom: 4 },
  theater: { color: theme.colors.muted, fontSize: 12, marginBottom: 2 },
  datetime: { color: theme.colors.muted, fontSize: 12, marginBottom: 2 },
  seats: { color: theme.colors.muted, fontSize: 12, marginBottom: 6 },
  seatsBold: { color: theme.colors.accentHover, fontWeight: '800' },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  confirmed: { backgroundColor: theme.colors.successSoft },
  cancelled: { backgroundColor: theme.colors.dangerSoft },
  statusText: { fontSize: 11, fontWeight: '800', color: '#166534' },

  ticketRight: {
    width: 90, backgroundColor: theme.colors.surfaceMuted, alignItems: 'center',
    justifyContent: 'center', padding: 10, borderLeftWidth: 1.5,
    borderLeftColor: theme.colors.border, borderStyle: 'dashed',
  },
  qrBox: { alignItems: 'center', marginBottom: 8 },
  qrIcon: { fontSize: 34, color: theme.colors.accentHover },
  ticketCode: { fontSize: 11, fontWeight: '900', color: theme.colors.ink, letterSpacing: 1, marginTop: 2 },
  price: { fontSize: 12, color: theme.colors.accentHover, fontWeight: '900', textAlign: 'center', marginBottom: 4 },
  tapDetail: { fontSize: 10, color: theme.colors.muted },

  perfTop: { position: 'absolute', top: -8, right: 80, width: 16, height: 16, borderRadius: 8, backgroundColor: theme.colors.bg },
  perfBottom: { position: 'absolute', bottom: -8, right: 80, width: 16, height: 16, borderRadius: 8, backgroundColor: theme.colors.bg },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '900', color: theme.colors.inkSecondary, marginBottom: 8 },
  emptyText: { color: theme.colors.muted, fontSize: 14, textAlign: 'center', lineHeight: 20 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(12,18,28,0.55)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: theme.colors.surface, borderTopLeftRadius: theme.radius.xl, borderTopRightRadius: theme.radius.xl, padding: 24, paddingBottom: 40, borderTopWidth: 1, borderColor: theme.colors.border },
  handle: { width: 44, height: 4, backgroundColor: theme.colors.border, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  modalMovieTitle: { fontSize: 20, fontWeight: '900', color: theme.colors.ink, textAlign: 'center', marginBottom: 20 },

  modalQRArea: { backgroundColor: theme.colors.accentSoft, borderRadius: theme.radius.md, padding: 22, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: theme.colors.border },
  modalQRIcon: { fontSize: 72, color: theme.colors.accentHover },
  modalTicketCode: { fontSize: 28, fontWeight: '900', color: theme.colors.accentHover, letterSpacing: 4, marginTop: 8 },
  modalQRHint: { color: theme.colors.muted, fontSize: 12, marginTop: 8 },

  modalDetails: { backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radius.md, padding: 14, marginBottom: 20 },
  modalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  modalLabel: { color: theme.colors.muted, fontSize: 13 },
  modalValue: { color: theme.colors.ink, fontSize: 13, fontWeight: '800', maxWidth: '55%', textAlign: 'right' },
  modalHighlight: { color: theme.colors.accentHover },

  modalClose: { backgroundColor: theme.colors.accent, borderRadius: theme.radius.md, padding: 15, alignItems: 'center' },
  modalCloseText: { color: '#fff', fontWeight: '900', fontSize: 15 },
});
