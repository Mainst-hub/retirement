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

      {saleItems.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="pricetag-outline" size={80} color="#ddd" />
          <Text style={styles.emptyTitle}>No sales right now</Text>
          <Text style={styles.emptyText}>
            When an item on your list drops in price, it will show up here — and we'll send you a notification so you never miss a deal.
          </Text>
          <View style={styles.tipBox}>
            <Ionicons name="bulb-outline" size={18} color="#6200ee" />
            <Text style={styles.tipText}>
              {'  '}Tip: Open any saved item and tap "Edit" to update the price if you see it has changed.
            </Text>
          </View>
        </View>
      ) : (
        <>
          <View style={styles.header}>
            <Ionicons name="pricetag" size={20} color="#e63946" />
            <Text style={styles.headerText}> {saleItems.length} item{saleItems.length !== 1 ? 's' : ''} on sale right now!</Text>
          </View>
          <FlatList
            data={saleItems}
            keyExtractor={i => i.id}
            contentContainerStyle={{ padding: 12 }}
            renderItem={({ item }) => {
              const saved = (parseFloat(item.originalPrice) - parseFloat(item.currentPrice)).toFixed(2);
              return (
                <TouchableOpacity
                  style={styles.card}
                  onPress={() => navigation.navigate('ItemDetail', { item })}
                  activeOpacity={0.85}
                >
                  {item.image ? (
                    <Image source={{ uri: item.image }} style={styles.image} />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <Ionicons name="image-outline" size={30} color="#ccc" />
                    </View>
                  )}
                  <View style={styles.cardBody}>
                    <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                    <Text style={styles.store}>{item.store}</Text>
                    <View style={styles.priceRow}>
                      <Text style={styles.originalPrice}>${item.originalPrice}</Text>
                      <Text style={styles.salePrice}>${item.currentPrice}</Text>
                    </View>
                    <View style={styles.saveBadge}>
                      <Ionicons name="happy-outline" size={14} color="#e63946" />
                      <Text style={styles.saveText}> You save ${saved}!</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#ccc" style={{ alignSelf: 'center', marginRight: 12 }} />
                </TouchableOpacity>
              );
            }}
          />
        </>
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
  headerText: { fontSize: 17, fontWeight: 'bold', color: '#222' },
  card: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14,
    marginBottom: 10, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  image: { width: 95, height: 95, resizeMode: 'cover' },
  imagePlaceholder: {
    width: 95, height: 95, backgroundColor: '#f0f0f0',
    alignItems: 'center', justifyContent: 'center',
  },
  cardBody: { flex: 1, padding: 12, justifyContent: 'center' },
  itemName: { fontSize: 15, fontWeight: '600', color: '#222', marginBottom: 2 },
  store: { fontSize: 13, color: '#888', marginBottom: 6 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  originalPrice: { fontSize: 14, color: '#aaa', textDecorationLine: 'line-through' },
  salePrice: { fontSize: 18, fontWeight: 'bold', color: '#e63946' },
  saveBadge: { flexDirection: 'row', alignItems: 'center' },
  saveText: { fontSize: 13, color: '#e63946', fontWeight: '600' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 36 },
  emptyTitle: { fontSize: 22, fontWeight: 'bold', color: '#555', marginTop: 20 },
  emptyText: { fontSize: 16, color: '#aaa', textAlign: 'center', marginTop: 12, lineHeight: 24 },
  tipBox: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: '#f0e6ff', borderRadius: 12, padding: 14, marginTop: 24,
  },
  tipText: { fontSize: 14, color: '#6200ee', flex: 1, lineHeight: 22 },
});
