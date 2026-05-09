import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Image, RefreshControl, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getItems, deleteItem } from '../storage/items';

export default function HomeScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

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
    Alert.alert('Remove Item', `Remove "${name}" from SHOPAP?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => { await deleteItem(id); load(); } },
    ]);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ItemDetail', { item })}
    >
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.image} />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Ionicons name="image-outline" size={40} color="#ccc" />
        </View>
      )}
      {item.onSale && (
        <View style={styles.saleBadge}>
          <Text style={styles.saleText}>SALE</Text>
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
            ${item.currentPrice || item.originalPrice}
          </Text>
        </View>
        <Text style={styles.source}>via {item.source}</Text>
      </View>
      <TouchableOpacity style={styles.deleteBtn} onPress={() => confirmDelete(item.id, item.name)}>
        <Ionicons name="trash-outline" size={18} color="#ff4444" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {items.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="bag-outline" size={80} color="#ddd" />
          <Text style={styles.emptyTitle}>Your SHOPAP is empty</Text>
          <Text style={styles.emptyText}>Tap the + button to save your first item</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={i => i.id}
          renderItem={renderItem}
          numColumns={2}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddItem')}>
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  list: { padding: 8 },
  card: {
    flex: 1, margin: 6, backgroundColor: '#fff',
    borderRadius: 12, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, elevation: 3,
  },
  image: { width: '100%', height: 160, resizeMode: 'cover' },
  imagePlaceholder: {
    width: '100%', height: 160, backgroundColor: '#f0f0f0',
    alignItems: 'center', justifyContent: 'center',
  },
  saleBadge: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: '#e63946', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2,
  },
  saleText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  cardBody: { padding: 10 },
  itemName: { fontSize: 13, fontWeight: '600', color: '#222', marginBottom: 2 },
  store: { fontSize: 11, color: '#888', marginBottom: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  price: { fontSize: 15, fontWeight: 'bold', color: '#222' },
  salePrice: { color: '#e63946' },
  originalPrice: { fontSize: 12, color: '#aaa', textDecorationLine: 'line-through' },
  source: { fontSize: 10, color: '#bbb', marginTop: 4 },
  deleteBtn: { position: 'absolute', top: 8, right: 8, padding: 4 },
  fab: {
    position: 'absolute', bottom: 24, right: 24,
    backgroundColor: '#6200ee', width: 60, height: 60,
    borderRadius: 30, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#6200ee', shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
  },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#555', marginTop: 16 },
  emptyText: { fontSize: 14, color: '#aaa', textAlign: 'center', marginTop: 8 },
});
