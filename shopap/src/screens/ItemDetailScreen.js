import React, { useState } from 'react';
import {
  View, Text, Image, ScrollView, TouchableOpacity,
  StyleSheet, Linking, Alert, Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { deleteItem } from '../storage/items';
import { CATEGORIES } from '../data/categories';

export default function ItemDetailScreen({ route, navigation }) {
  const { item } = route.params;
  const [deleted, setDeleted] = useState(false);

  const category = CATEGORIES.find(c => c.id === item.category);

  const openLink = () => {
    if (item.link) Linking.openURL(item.link);
    else Alert.alert('No link', 'No product link was saved for this item.');
  };

  const handleShare = async () => {
    await Share.share({
      message: `Check out ${item.name} at ${item.store} - $${item.currentPrice || item.originalPrice}\n${item.link || ''}`,
    });
  };

  const handleDelete = () => {
    Alert.alert('Remove Item', `Remove "${item.name}" from SHOPAP?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive', onPress: async () => {
          await deleteItem(item.id);
          navigation.goBack();
        }
      },
    ]);
  };

  const savedDate = new Date(item.savedAt).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.image} />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Ionicons name="image-outline" size={60} color="#ccc" />
          <Text style={styles.noImageText}>No image saved</Text>
        </View>
      )}

      {item.onSale && (
        <View style={styles.saleBanner}>
          <Ionicons name="pricetag" size={16} color="#fff" />
          <Text style={styles.saleBannerText}>  This item is on SALE!</Text>
        </View>
      )}

      <View style={styles.body}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.store}>{item.store}</Text>

        <View style={styles.priceBox}>
          <View>
            <Text style={styles.priceLabel}>Current Price</Text>
            <Text style={[styles.bigPrice, item.onSale && styles.salePrice]}>
              ${item.currentPrice || item.originalPrice}
            </Text>
          </View>
          {item.onSale && (
            <View>
              <Text style={styles.priceLabel}>Original Price</Text>
              <Text style={styles.strikePrice}>${item.originalPrice}</Text>
            </View>
          )}
        </View>

        <View style={styles.metaRow}>
          {category && (
            <View style={styles.metaChip}>
              <Ionicons name={category.icon} size={14} color="#6200ee" />
              <Text style={styles.metaText}> {category.label}</Text>
            </View>
          )}
          <View style={styles.metaChip}>
            <Ionicons name="logo-instagram" size={14} color="#6200ee" />
            <Text style={styles.metaText}> {item.source}</Text>
          </View>
        </View>

        {item.notes ? (
          <View style={styles.notesBox}>
            <Text style={styles.notesLabel}>Notes</Text>
            <Text style={styles.notesText}>{item.notes}</Text>
          </View>
        ) : null}

        <Text style={styles.savedDate}>Saved on {savedDate}</Text>

        <TouchableOpacity style={styles.buyBtn} onPress={openLink}>
          <Ionicons name="cart-outline" size={20} color="#fff" />
          <Text style={styles.buyBtnText}>  Go Buy It</Text>
        </TouchableOpacity>

        <View style={styles.secondaryBtns}>
          <TouchableOpacity style={styles.secondaryBtn} onPress={handleShare}>
            <Ionicons name="share-outline" size={20} color="#6200ee" />
            <Text style={styles.secondaryBtnText}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.secondaryBtn, styles.deleteBtn]} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={20} color="#e63946" />
            <Text style={[styles.secondaryBtnText, { color: '#e63946' }]}>Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { paddingBottom: 40 },
  image: { width: '100%', height: 300, resizeMode: 'cover' },
  imagePlaceholder: {
    width: '100%', height: 200, backgroundColor: '#f0f0f0',
    alignItems: 'center', justifyContent: 'center',
  },
  noImageText: { color: '#ccc', marginTop: 8 },
  saleBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#e63946', padding: 10, justifyContent: 'center',
  },
  saleBannerText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  body: { padding: 20 },
  name: { fontSize: 22, fontWeight: 'bold', color: '#222', marginBottom: 4 },
  store: { fontSize: 15, color: '#888', marginBottom: 16 },
  priceBox: {
    flexDirection: 'row', gap: 32,
    backgroundColor: '#f5f0ff', borderRadius: 12, padding: 16, marginBottom: 16,
  },
  priceLabel: { fontSize: 11, color: '#888', marginBottom: 4 },
  bigPrice: { fontSize: 28, fontWeight: 'bold', color: '#222' },
  salePrice: { color: '#e63946' },
  strikePrice: { fontSize: 20, color: '#aaa', textDecorationLine: 'line-through' },
  metaRow: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  metaChip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f0e6ff', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
  },
  metaText: { fontSize: 13, color: '#6200ee' },
  notesBox: { backgroundColor: '#f9f9f9', borderRadius: 10, padding: 14, marginBottom: 16 },
  notesLabel: { fontSize: 12, color: '#888', marginBottom: 4 },
  notesText: { fontSize: 14, color: '#444' },
  savedDate: { fontSize: 12, color: '#bbb', marginBottom: 20 },
  buyBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#6200ee', borderRadius: 12, padding: 16, marginBottom: 12,
  },
  buyBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  secondaryBtns: { flexDirection: 'row', gap: 12 },
  secondaryBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#6200ee', borderRadius: 12, padding: 12,
  },
  deleteBtn: { borderColor: '#e63946' },
  secondaryBtnText: { color: '#6200ee', fontWeight: '600', marginLeft: 6 },
});
