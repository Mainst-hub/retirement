import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getItems } from '../storage/items';

export default function SalesScreen({ navigation }) {
  const [saleItems, setSaleItems] = useState([]);

  useFocusEffect(useCallback(() => {
    getItems().then(all => setSaleItems(all.filter(i => i.onSale)));
  }, []));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="pricetag" size={20} color="#e63946" />
        <Text style={styles.headerText}> Items on Sale ({saleItems.length})</Text>
      </View>

      {saleItems.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="pricetag-outline" size={70} color="#ddd" />
          <Text style={styles.emptyTitle}>No sales yet</Text>
          <Text style={styles.emptyText}>
            When an item you saved goes on sale, it will appear here automatically.
          </Text>
        </View>
      ) : (
        <FlatList
          data={saleItems}
          keyExtractor={i => i.id}
          contentContainerStyle={{ padding: 12 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('ItemDetail', { item })}
            >
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.image} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="image-outline" size={30} color="#ccc" />
                </View>
              )}
              <View style={styles.cardBody}>
                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.store}>{item.store}</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.originalPrice}>${item.originalPrice}</Text>
                  <Text style={styles.salePrice}>${item.currentPrice}</Text>
                  <View style={styles.saveBadge}>
                    <Text style={styles.saveText}>
                      Save ${(item.originalPrice - item.currentPrice).toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#ccc" style={{ alignSelf: 'center' }} />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  headerText: { fontSize: 16, fontWeight: 'bold', color: '#222' },
  card: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12,
    marginBottom: 10, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  image: { width: 90, height: 90, resizeMode: 'cover' },
  imagePlaceholder: {
    width: 90, height: 90, backgroundColor: '#f0f0f0',
    alignItems: 'center', justifyContent: 'center',
  },
  cardBody: { flex: 1, padding: 12, justifyContent: 'center' },
  itemName: { fontSize: 14, fontWeight: '600', color: '#222', marginBottom: 2 },
  store: { fontSize: 12, color: '#888', marginBottom: 6 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  originalPrice: { fontSize: 12, color: '#aaa', textDecorationLine: 'line-through' },
  salePrice: { fontSize: 16, fontWeight: 'bold', color: '#e63946' },
  saveBadge: { backgroundColor: '#fff0f0', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  saveText: { fontSize: 11, color: '#e63946', fontWeight: '600' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#555', marginTop: 16 },
  emptyText: { fontSize: 14, color: '#aaa', textAlign: 'center', marginTop: 8, lineHeight: 20 },
});
