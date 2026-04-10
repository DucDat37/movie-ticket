import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Image, TextInput, ActivityIndicator, StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { theme, shadows } from '../theme';

const GENRES = ['Tất cả', 'Hành động', 'Tình cảm', 'Kinh dị', 'Khoa học viễn tưởng', 'Hài'];

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [movies, setMovies] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('Tất cả');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchMovies(); }, []);

  useEffect(() => {
    let result = movies;
    if (genre !== 'Tất cả') result = result.filter(m => m.genre === genre);
    if (search) result = result.filter(m => m.title.toLowerCase().includes(search.toLowerCase()));
    setFiltered(result);
  }, [search, genre, movies]);

  const fetchMovies = async () => {
    try {
      const snap = await getDocs(collection(db, 'movies'));
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setMovies(data);
      setFiltered(data);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const getRatingColor = (r) => (r >= 8 ? theme.colors.success : r >= 6 ? theme.colors.accent : theme.colors.danger);

  const renderMovie = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.92}
      onPress={() => navigation.navigate('MovieDetail', { movie: item })}
    >
      <View style={styles.posterWrapper}>
        <Image source={{ uri: item.poster }} style={styles.poster} />
        <View style={[styles.ratingBadge, { backgroundColor: getRatingColor(item.rating) }]}>
          <Text style={styles.ratingBadgeText}>★ {item.rating}</Text>
        </View>
      </View>
      <View style={styles.info}>
        <Text style={styles.movieTitle} numberOfLines={2}>{item.title}</Text>
        <View style={styles.genreRow}>
          <View style={styles.genreTag}>
            <Text style={styles.genreTagText}>{item.genre}</Text>
          </View>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaItem}>🕐 {item.duration} phút</Text>
        </View>
        <Text style={styles.synopsis} numberOfLines={2}>{item.synopsis}</Text>
        <TouchableOpacity
          style={styles.bookBtn}
          onPress={() => navigation.navigate('MovieDetail', { movie: item })}
          activeOpacity={0.88}
        >
          <Text style={styles.bookBtnText}>Đặt vé ngay</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primaryDark} />

      <LinearGradient
        colors={['#0c121c', '#1a2f4a', '#243b5c']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: Math.max(insets.top, 12) + 12 }]}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerTextBlock}>
            <Text style={styles.headerKicker}>Rạp của bạn</Text>
            <Text style={styles.headerTitle}>MovieTix</Text>
            <Text style={styles.headerSub}>Đặt vé nhanh — chọn phim yêu thích</Text>
          </View>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeNum}>{filtered.length}</Text>
            <Text style={styles.headerBadgeText}>phim</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Search — chồng lên mép gradient */}
      <View style={[styles.searchOuter, { marginTop: -22 }]}>
        <View style={styles.searchWrapper}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            style={styles.search}
            placeholder="Tìm theo tên phim..."
            placeholderTextColor={theme.colors.muted}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Genre filter */}
      <View style={styles.genreWrapper}>
        <FlatList
          data={GENRES}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={i => i}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 4 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.genreBtn, genre === item && styles.genreActive]}
              onPress={() => setGenre(item)}
            >
              <Text style={[styles.genreText, genre === item && styles.genreTextActive]}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Movie list */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
          <Text style={styles.loadingText}>Đang tải phim...</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🎭</Text>
          <Text style={styles.emptyTitle}>Không tìm thấy phim</Text>
          <Text style={styles.emptyText}>Thử tìm kiếm với từ khoá khác</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={i => i.id}
          renderItem={renderMovie}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          onRefresh={fetchMovies}
          refreshing={loading}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },

  header: {
    paddingBottom: 36,
    paddingHorizontal: 20,
  },
  headerRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  headerTextBlock: { flex: 1, paddingRight: 12 },
  headerKicker: { color: '#fbbf24', fontSize: 11, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 },
  headerTitle: { color: '#fff', fontSize: 30, fontWeight: '900', letterSpacing: -0.5 },
  headerSub: { color: '#b8c2d0', fontSize: 13, marginTop: 6, lineHeight: 18 },
  headerBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: theme.radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.35)',
    alignItems: 'center',
    minWidth: 64,
  },
  headerBadgeNum: { color: '#fbbf24', fontSize: 20, fontWeight: '900' },
  headerBadgeText: { color: '#9ca8b8', fontSize: 11, fontWeight: '700', marginTop: 2 },

  searchOuter: { paddingHorizontal: 16, zIndex: 2, marginBottom: 6 },
  searchWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...shadows.card,
  },
  searchIcon: { fontSize: 18, marginRight: 10, color: theme.colors.accent, fontWeight: '700' },
  search: { flex: 1, paddingVertical: 14, fontSize: 15, color: theme.colors.ink },
  clearBtn: { color: theme.colors.muted, fontSize: 15, paddingLeft: 8, fontWeight: '600' },

  genreWrapper: { backgroundColor: theme.colors.bg, paddingBottom: 10, zIndex: 1 },
  genreBtn: {
    paddingHorizontal: 18, paddingVertical: 10, borderRadius: 22,
    marginRight: 8, backgroundColor: theme.colors.surface,
    height: 40,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  genreActive: { backgroundColor: theme.colors.accent, borderColor: theme.colors.accent },
  genreText: { color: theme.colors.inkSecondary, fontSize: 13, fontWeight: '700' },
  genreTextActive: { color: '#fff' },

  card: {
    flexDirection: 'row', backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg,
    marginBottom: 16, overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...shadows.card,
  },
  posterWrapper: { position: 'relative' },
  poster: { width: 118, height: 168 },
  ratingBadge: {
    position: 'absolute', top: 8, left: 8,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
  },
  ratingBadgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },

  info: { flex: 1, padding: 14, justifyContent: 'space-between' },
  movieTitle: { fontSize: 16, fontWeight: '800', color: theme.colors.ink, lineHeight: 22 },

  genreRow: { flexDirection: 'row', marginTop: 6 },
  genreTag: { backgroundColor: theme.colors.accentSoft, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  genreTagText: { color: theme.colors.accentHover, fontSize: 11, fontWeight: '700' },

  metaRow: { flexDirection: 'row', gap: 12, marginTop: 6 },
  metaItem: { color: theme.colors.muted, fontSize: 12 },

  synopsis: { color: theme.colors.muted, fontSize: 12, lineHeight: 18, marginTop: 6 },

  bookBtn: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.sm,
    paddingVertical: 10, alignItems: 'center', marginTop: 10,
  },
  bookBtnText: { color: '#fff', fontWeight: '800', fontSize: 13, letterSpacing: 0.3 },

  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: theme.colors.muted, marginTop: 14, fontSize: 14, fontWeight: '600' },

  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  emptyIcon: { fontSize: 56, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: theme.colors.inkSecondary },
  emptyText: { color: theme.colors.muted, marginTop: 8, fontSize: 14, textAlign: 'center' },
});
