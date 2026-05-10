import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Image, RefreshControl, Alert, TextInput,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getItems, deleteItem } from '../storage/items';

const SORT_OPTIONS = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Lowest Price', value: 'price_asc' },
  { label: 'Highest Price', value: 'price_desc' },
  { label: 'On Sale', value: 'sale' },
];

export default function HomeScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showSort, setShowSort] = useState(false);

  const load = async () => {
    const data = await getItems();
    setItems(data);
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const confirmDelete = (id, name) => {
    Alert.alert(
      'Remove This Item?',
      `This will remove "${name}" from your list. You can always add it back later.`,
      [
        { text: 'Keep It', style: 'cancel' },
        { text: 'Yes, Remove It', style: 'destructive', onPress: async () => { await deleteItem(id); load(); } },
      ]
    );
  };

  const sorted = [...items]
    .filter(i => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return i.name?.toLowerCase().includes(q) || i.store?.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.savedAt) - new Date(a.savedAt);
      if (sortBy === 'price_asc') return (a.currentPrice || a.originalPrice) - (b.currentPrice || b.originalPrice);
      if (sortBy === 'price_desc') return (b.currentPrice || b.originalPrice) - (a.currentPrice || a.originalPrice);
      if (sortBy === 'sale') return (b.onSale ? 1 : 0) - (a.onSale ? 1 : 0);
      return 0;
    });

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ItemDetail', { item })}
      activeOpacity={0.85}
    >
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.image} />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Ionicons name="image-outline" size={40} color="#ccc" />
          <Text style={styles.noImageText}>No photo</Text>
        </View>
      )}
      {item.onSale && (
        <View style={styles.saleBadge}>
          <Text style={styles.saleText}>ON SALE</Text>
        </View>
      )}
      <View style={styles.cardBody}>
        <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.store}>{item.store}</Text>
        <View style={styles.priceRow}>
          {item.onSale && (
            <Text style={styles.originalPrice}>${item.originalPrice}</Text>
          )}
          <Text style={[styles.price, item.onSale && styles.salePrice]}>
            ${item.currentPrice || item.originalPrice || '—'}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() => confirmDelete(item.id, item.name)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="trash-outline" size={18} color="#ff4444" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={20} color="#aaa" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search your saved items..."
            placeholderTextColor="#bbb"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={20} color="#ccc" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.sortBtn} onPress={() => setShowSort(!showSort)}>
          <Ionicons name="funnel-outline" size={20} color="#6200ee" />
        </TouchableOpacity>
      </View>

      {/* Sort picker */}
      {showSort && (
        <View style={styles.sortMenu}>
          <Text style={styles.sortMenuTitle}>Sort by:</Text>
          {SORT_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.value}
              style={styles.sortOption}
              onPress={() => { setSortBy(opt.value); setShowSort(false); }}
            >
              <Text style={[styles.sortOptionText, sortBy === opt.value && styles.sortOptionActive]}>
                {opt.label}
              </Text>
              {sortBy === opt.value && <Ionicons name="checkmark" size={18} color="#6200ee" />}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {sorted.length === 0 && items.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="bag-outline" size={90} color="#ddd" />
          <Text style={styles.emptyTitle}>Your list is empty</Text>
          <Text style={styles.emptyText}>
            Tap the purple button below to save your first item.{'\n\n'}
            Or share any product link from Instagram, TikTok, or any website and choose SHOPAP.
          </Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('AddItem')}>
            <Ionicons name="add-circle-outline" size={20} color="#fff" />
            <Text style={styles.emptyBtnText}>  Save Something</Text>
          </TouchableOpacity>
        </View>
      ) : sorted.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="search-outline" size={60} color="#ddd" />
          <Text style={styles.emptyTitle}>No results found</Text>
          <Text style={styles.emptyText}>Try a different search word.</Text>
        </View>
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={i => i.id}
          renderItem={renderItem}
          numColumns={2}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddItem')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={34} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  searchRow: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 8 },
  searchBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 12,
    borderWidth: 1, borderColor: '#e0e0e0', gap: 8,
  },
  searchInput: { flex: 1, fontSize: 16, color: '#222', paddingVertical: 11 },
  sortBtn: {
    backgroundColor: '#fff', padding: 12, borderRadius: 12,
    borderWidth: 1, borderColor: '#e0e0e0',
  },
  sortMenu: {
    backgroundColor: '#fff', marginHorizontal: 12, borderRadius: 12,
    padding: 12, marginBottom: 4,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, elevation: 4,
  },
  sortMenuTitle: { fontSize: 13, color: '#888', marginBottom: 8, fontWeight: '600' },
  sortOption: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  sortOptionText: { fontSize: 16, color: '#444' },
  sortOptionActive: { color: '#6200ee', fontWeight: '700' },
  list: { padding: 8, paddingBottom: 100 },
  card: {
    flex: 1, margin: 6, backgroundColor: '#fff',
    borderRadius: 14, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, elevation: 3,
  },
  image: { width: '100%', height: 160, resizeMode: 'cover' },
  imagePlaceholder: {
    width: '100%', height: 160, backgroundColor: '#f0f0f0',
    alignItems: 'center', justifyContent: 'center',
  },
  noImageText: { color: '#ccc', fontSize: 12, marginTop: 4 },
  saleBadge: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: '#e63946', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3,
  },
  saleText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  cardBody: { padding: 10 },
  itemName: { fontSize: 14, fontWeight: '600', color: '#222', marginBottom: 2 },
  store: { fontSize: 12, color: '#888', marginBottom: 6 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  price: { fontSize: 16, fontWeight: 'bold', color: '#222' },
  salePrice: { color: '#e63946' },
  originalPrice: { fontSize: 12, color: '#aaa', textDecorationLine: 'line-through' },
  deleteBtn: { position: 'absolute', top: 8, right: 8, padding: 4 },
  fab: {
    position: 'absolute', bottom: 24, right: 24,
    backgroundColor: '#6200ee', width: 64, height: 64,
    borderRadius: 32, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#6200ee', shadowOpacity: 0.4, shadowRadius: 10, elevation: 8,
  },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyTitle: { fontSize: 22, fontWeight: 'bold', color: '#555', marginTop: 20 },
  emptyText: { fontSize: 16, color: '#aaa', textAlign: 'center', marginTop: 12, lineHeight: 24 },
  emptyBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#6200ee', borderRadius: 12, padding: 16, marginTop: 24,
  },
  emptyBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
