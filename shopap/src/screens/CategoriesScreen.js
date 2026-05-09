import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getItems } from '../storage/items';
import { CATEGORIES } from '../data/categories';

export default function CategoriesScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [viewBy, setViewBy] = useState('category'); // 'category' | 'store'

  useFocusEffect(useCallback(() => { getItems().then(setItems); }, []));

  const grouped = () => {
    const map = {};
    items.forEach(item => {
      const key = viewBy === 'category' ? item.category : item.store;
      if (!map[key]) map[key] = [];
      map[key].push(item);
    });
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]));
  };

  const getCategoryLabel = id => CATEGORIES.find(c => c.id === id)?.label || id;
  const getCategoryIcon = id => CATEGORIES.find(c => c.id === id)?.icon || 'grid-outline';

  const filteredItems = selected
    ? items.filter(i => (viewBy === 'category' ? i.category : i.store) === selected)
    : [];

  if (selected) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.backRow} onPress={() => setSelected(null)}>
          <Ionicons name="chevron-back" size={20} color="#6200ee" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.groupTitle}>
          {viewBy === 'category' ? getCategoryLabel(selected) : selected}
          {'  '}
          <Text style={styles.count}>({filteredItems.length})</Text>
        </Text>
        <FlatList
          data={filteredItems}
          keyExtractor={i => i.id}
          numColumns={2}
          contentContainerStyle={{ padding: 8 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('ItemDetail', { item })}
            >
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.image} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="image-outline" size={32} color="#ccc" />
                </View>
              )}
              {item.onSale && (
                <View style={styles.saleBadge}><Text style={styles.saleText}>SALE</Text></View>
              )}
              <View style={{ padding: 8 }}>
                <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.itemPrice}>${item.currentPrice || item.originalPrice}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggle, viewBy === 'category' && styles.toggleActive]}
          onPress={() => setViewBy('category')}
        >
          <Text style={[styles.toggleText, viewBy === 'category' && styles.toggleTextActive]}>By Category</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggle, viewBy === 'store' && styles.toggleActive]}
          onPress={() => setViewBy('store')}
        >
          <Text style={[styles.toggleText, viewBy === 'store' && styles.toggleTextActive]}>By Store</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={grouped()}
        keyExtractor={([key]) => key}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item: [key, groupItems] }) => (
          <TouchableOpacity style={styles.groupCard} onPress={() => setSelected(key)}>
            <View style={styles.groupIcon}>
              <Ionicons
                name={viewBy === 'category' ? getCategoryIcon(key) : 'storefront-outline'}
                size={24} color="#6200ee"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.groupName}>
                {viewBy === 'category' ? getCategoryLabel(key) : key}
              </Text>
              <Text style={styles.groupCount}>{groupItems.length} item{groupItems.length !== 1 ? 's' : ''}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="grid-outline" size={60} color="#ddd" />
            <Text style={styles.emptyText}>No items saved yet</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  toggleRow: {
    flexDirection: 'row', margin: 12, backgroundColor: '#e0e0e0',
    borderRadius: 10, padding: 3,
  },
  toggle: { flex: 1, padding: 8, borderRadius: 8, alignItems: 'center' },
  toggleActive: { backgroundColor: '#6200ee' },
  toggleText: { fontSize: 14, color: '#555', fontWeight: '600' },
  toggleTextActive: { color: '#fff' },
  groupCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 12, padding: 16,
    marginBottom: 8, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  groupIcon: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#f0e6ff',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  groupName: { fontSize: 15, fontWeight: '600', color: '#222' },
  groupCount: { fontSize: 12, color: '#888', marginTop: 2 },
  backRow: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  backText: { color: '#6200ee', fontSize: 16 },
  groupTitle: { fontSize: 20, fontWeight: 'bold', color: '#222', paddingHorizontal: 16, marginBottom: 4 },
  count: { fontSize: 14, color: '#888', fontWeight: 'normal' },
  card: {
    flex: 1, margin: 6, backgroundColor: '#fff',
    borderRadius: 12, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, elevation: 3,
  },
  image: { width: '100%', height: 130, resizeMode: 'cover' },
  imagePlaceholder: {
    width: '100%', height: 130, backgroundColor: '#f0f0f0',
    alignItems: 'center', justifyContent: 'center',
  },
  saleBadge: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: '#e63946', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2,
  },
  saleText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  itemName: { fontSize: 12, fontWeight: '600', color: '#222' },
  itemPrice: { fontSize: 14, fontWeight: 'bold', color: '#6200ee', marginTop: 2 },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyText: { color: '#aaa', fontSize: 16, marginTop: 12 },
});
