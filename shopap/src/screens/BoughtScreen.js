import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Image, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getBoughtItems, deleteBoughtItem } from '../storage/items';

export default function BoughtScreen() {
  const [items, setItems] = useState([]);

  useFocusEffect(useCallback(() => {
    getBoughtItems().then(setItems);
  }, []));

  const total = items.reduce((sum, i) => sum + parseFloat(i.currentPrice || i.originalPrice || 0), 0);

  const handleRemove = (id, name) => {
    Alert.alert(
      'Remove from history?',
      `Remove "${name}" from your Bought History?`,
      [
        { text: 'Keep It', style: 'cancel' },
        {
          text: 'Yes, Remove', style: 'destructive',
          onPress: async () => { await deleteBoughtItem(id); getBoughtItems().then(setItems); },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {items.length > 0 && (
        <View style={styles.summaryBox}>
          <Text style={styles.summaryLabel}>Total spent on saved items</Text>
          <Text style={styles.summaryTotal}>${total.toFixed(2)}</Text>
          <Text style={styles.summaryCount}>{items.length} item{items.length !== 1 ? 's' : ''} purchased</Text>
        </View>
      )}

      {items.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="bag-check-outline" size={80} color="#ddd" />
          <Text style={styles.emptyTitle}>Nothing here yet</Text>
          <Text style={styles.emptyText}>
            When you buy something from your list, tap{'\n'}"I Already Bought This" on the item page{'\n'}and it will show up here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={i => i.id}
          contentContainerStyle={{ padding: 12 }}
          renderItem={({ item }) => {
            const boughtDate = new Date(item.boughtAt).toLocaleDateString('en-US', {
              month: 'long', day: 'numeric', year: 'numeric',
            });
            return (
              <View style={styles.card}>
                {item.image ? (
                  <Image source={{ uri: item.image }} style={styles.image} />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Ionicons name="bag-check-outline" size={28} color="#ccc" />
                  </View>
                )}
                <View style={styles.cardBody}>
                  <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                  <Text style={styles.store}>{item.store}</Text>
                  <Text style={styles.price}>
                    ${item.currentPrice || item.originalPrice || '—'}
                  </Text>
                  <View style={styles.boughtBadge}>
                    <Ionicons name="checkmark-circle" size={14} color="#2d9e5f" />
                    <Text style={styles.boughtDate}> Bought {boughtDate}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleRemove(item.id, item.name)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="trash-outline" size={18} color="#ccc" />
                </TouchableOpacity>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  summaryBox: {
    backgroundColor: '#2d9e5f', padding: 20, margin: 12, borderRadius: 16,
    alignItems: 'center',
  },
  summaryLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  summaryTotal: { color: '#fff', fontSize: 36, fontWeight: 'bold', marginVertical: 4 },
  summaryCount: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  card: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14,
    marginBottom: 10, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  image: { width: 90, height: 90, resizeMode: 'cover' },
  imagePlaceholder: {
    width: 90, height: 90, backgroundColor: '#f0f0f0',
    alignItems: 'center', justifyContent: 'center',
  },
  cardBody: { flex: 1, padding: 12, justifyContent: 'center' },
  itemName: { fontSize: 15, fontWeight: '600', color: '#222', marginBottom: 2 },
  store: { fontSize: 13, color: '#888', marginBottom: 4 },
  price: { fontSize: 17, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  boughtBadge: { flexDirection: 'row', alignItems: 'center' },
  boughtDate: { fontSize: 12, color: '#2d9e5f', fontWeight: '600' },
  deleteBtn: { padding: 16, justifyContent: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyTitle: { fontSize: 22, fontWeight: 'bold', color: '#555', marginTop: 20 },
  emptyText: { fontSize: 16, color: '#aaa', textAlign: 'center', marginTop: 12, lineHeight: 26 },
});
