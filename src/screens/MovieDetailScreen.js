import React, { useEffect, useState } from 'react';
import {
  View, Text, Image, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator
} from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { theme, shadows } from '../theme';

export default function MovieDetailScreen({ route, navigation }) {
  const { movie } = route.params;
  const [showtimes, setShowtimes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchShowtimes(); }, []);

  const fetchShowtimes = async () => {
    try {
      const q = query(collection(db, 'showtimes'), where('movieId', '==', movie.id));
      const snap = await getDocs(q);
      setShowtimes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const getRatingColor = (r) => (r >= 8 ? theme.colors.success : r >= 6 ? theme.colors.accent : theme.colors.danger);

  return (
    <View style={styles.wrapper}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        {/* Poster banner */}
        <View style={styles.bannerWrapper}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
          <Image source={{ uri: movie.poster }} style={styles.banner} blurRadius={2} />
          <View style={styles.bannerOverlay} />
          <Image source={{ uri: movie.poster }} style={styles.posterCenter} />
        </View>

        <View style={styles.body}>
          {/* Title & rating */}
          <Text style={styles.title}>{movie.title}</Text>

          <View style={styles.ratingRow}>
            <View style={[styles.ratingCircle, { borderColor: getRatingColor(movie.rating) }]}>
              <Text style={[styles.ratingNum, { color: getRatingColor(movie.rating) }]}>{movie.rating}</Text>
              <Text style={styles.ratingOf}>/10</Text>
            </View>
            <View style={styles.metaBlock}>
              <View style={styles.genreTag}>
                <Text style={styles.genreTagText}>{movie.genre}</Text>
              </View>
              <Text style={styles.metaText}>🕐 {movie.duration} phút</Text>
            </View>
          </View>

          {/* Stars */}
          <View style={styles.starsRow}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Text key={i} style={[styles.star, { color: i < Math.round(movie.rating / 2) ? theme.colors.accent : theme.colors.border }]}>★</Text>
            ))}
            <Text style={styles.starsLabel}>({movie.rating}/10 IMDb)</Text>
          </View>

          {/* Synopsis */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nội dung phim</Text>
            <View style={styles.synopsisCard}>
              <Text style={styles.synopsis}>{movie.synopsis}</Text>
            </View>
          </View>

          {/* Showtimes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chọn suất chiếu</Text>
            {loading ? (
              <ActivityIndicator color={theme.colors.accent} style={{ marginTop: 12 }} />
            ) : showtimes.length === 0 ? (
              <View style={styles.noShowtimeBox}>
                <Text style={styles.noShowtimeIcon}>📅</Text>
                <Text style={styles.noShowtime}>Chưa có suất chiếu</Text>
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -4 }}>
                {showtimes.map(st => {
                  const isSelected = selected?.id === st.id;
                  return (
                    <TouchableOpacity
                      key={st.id}
                      style={[styles.showtimeCard, isSelected && styles.showtimeSelected]}
                      onPress={() => setSelected(st)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.showtimeDate, isSelected && styles.wt]}>{st.date}</Text>
                      <Text style={[styles.showtimeTime, isSelected && styles.wt]}>{st.time}</Text>
                      <View style={[styles.showtimeDivider, isSelected && { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
                      <Text style={[styles.showtimeTheater, isSelected && styles.wt]} numberOfLines={2}>{st.theaterName}</Text>
                      <Text style={[styles.showtimePrice, isSelected && { color: '#bfdbfe' }]}>
                        {(st.price || 85000).toLocaleString('vi-VN')}đ/ghế
                      </Text>
                      {isSelected && (
                        <View style={styles.checkMark}><Text style={styles.checkMarkText}>✓</Text></View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Sticky bottom button */}
      <View style={styles.stickyBottom}>
        {selected && (
          <View style={styles.selectedInfo}>
            <Text style={styles.selectedLabel}>Đã chọn: {selected.time} • {selected.date}</Text>
            <Text style={styles.selectedTheater} numberOfLines={1}>{selected.theaterName}</Text>
          </View>
        )}
        <TouchableOpacity
          style={[styles.continueBtn, !selected && styles.disabled]}
          disabled={!selected}
          onPress={() => navigation.navigate('SeatSelection', { movie, showtime: selected })}
          activeOpacity={0.85}
        >
          <Text style={styles.continueBtnText}>{selected ? 'Chọn ghế ngồi →' : 'Chọn suất chiếu'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: theme.colors.bg },
  container: { flex: 1 },

  backBtn: {
    position: 'absolute', top: 48, left: 16, zIndex: 10,
    backgroundColor: 'rgba(12,18,28,0.55)', borderRadius: 22,
    width: 42, height: 42, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(251,191,36,0.25)',
  },
  backBtnText: { color: '#fbbf24', fontSize: 22, fontWeight: '700', lineHeight: 24 },
  bannerWrapper: { height: 260, position: 'relative', alignItems: 'center', justifyContent: 'flex-end' },
  banner: { position: 'absolute', width: '100%', height: '100%' },
  bannerOverlay: { position: 'absolute', width: '100%', height: '100%', backgroundColor: 'rgba(12,18,28,0.78)' },
  posterCenter: {
    width: 122, height: 178, borderRadius: theme.radius.md, marginBottom: 16,
    borderWidth: 3, borderColor: '#fbbf24', ...shadows.card,
  },

  body: { padding: 20 },
  title: { fontSize: 24, fontWeight: '900', color: theme.colors.ink, textAlign: 'center', marginBottom: 14 },

  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 10 },
  ratingCircle: { width: 64, height: 64, borderRadius: 32, borderWidth: 3, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surface },
  ratingNum: { fontSize: 20, fontWeight: '800' },
  ratingOf: { fontSize: 10, color: theme.colors.muted },
  metaBlock: { flex: 1, gap: 8 },
  genreTag: { backgroundColor: theme.colors.accentSoft, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  genreTagText: { color: theme.colors.accentHover, fontSize: 12, fontWeight: '700' },
  metaText: { color: theme.colors.muted, fontSize: 13 },

  starsRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginBottom: 20 },
  star: { fontSize: 20 },
  starsLabel: { color: theme.colors.muted, fontSize: 12, marginLeft: 6 },

  section: { marginBottom: 22 },
  sectionTitle: { fontSize: 17, fontWeight: '900', color: theme.colors.ink, marginBottom: 12, letterSpacing: 0.2 },
  synopsisCard: {
    backgroundColor: theme.colors.surface, borderRadius: theme.radius.md, padding: 18,
    borderWidth: 1, borderColor: theme.colors.border, ...shadows.soft,
  },
  synopsis: { color: theme.colors.inkSecondary, lineHeight: 24, fontSize: 15 },

  noShowtimeBox: { alignItems: 'center', padding: 24, backgroundColor: theme.colors.surface, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.border },
  noShowtimeIcon: { fontSize: 36, marginBottom: 8 },
  noShowtime: { color: theme.colors.muted, fontStyle: 'italic', fontSize: 14 },

  showtimeCard: {
    backgroundColor: theme.colors.surface, borderRadius: theme.radius.md, padding: 14,
    marginRight: 12, alignItems: 'center', minWidth: 132,
    borderWidth: 2, borderColor: theme.colors.border,
    ...shadows.soft,
  },
  showtimeSelected: { backgroundColor: theme.colors.primary, borderColor: theme.colors.accent, elevation: 6 },
  showtimeDate: { fontSize: 11, color: theme.colors.muted, marginBottom: 4, fontWeight: '700' },
  showtimeTime: { fontSize: 22, fontWeight: '900', color: theme.colors.ink },
  showtimeDivider: { width: '80%', height: 1, backgroundColor: theme.colors.border, marginVertical: 8 },
  showtimeTheater: { fontSize: 11, color: theme.colors.muted, textAlign: 'center', lineHeight: 16 },
  showtimePrice: { fontSize: 11, color: theme.colors.accentHover, fontWeight: '800', marginTop: 6 },
  wt: { color: '#fff' },
  checkMark: { position: 'absolute', top: 8, right: 8, backgroundColor: theme.colors.success, borderRadius: 10, width: 22, height: 22, alignItems: 'center', justifyContent: 'center' },
  checkMarkText: { color: '#fff', fontSize: 12, fontWeight: '800' },

  stickyBottom: {
    backgroundColor: theme.colors.surface, padding: 16, paddingBottom: 26,
    elevation: 20, shadowColor: '#000', shadowOpacity: 0.14, shadowRadius: 18,
    borderTopLeftRadius: theme.radius.lg, borderTopRightRadius: theme.radius.lg,
    borderTopWidth: 1, borderTopColor: theme.colors.border,
  },
  selectedInfo: { marginBottom: 10 },
  selectedLabel: { fontSize: 13, fontWeight: '800', color: theme.colors.accentHover },
  selectedTheater: { fontSize: 12, color: theme.colors.muted, marginTop: 2 },
  continueBtn: { backgroundColor: theme.colors.accent, borderRadius: theme.radius.md, padding: 16, alignItems: 'center' },
  disabled: { backgroundColor: theme.colors.borderStrong },
  continueBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
