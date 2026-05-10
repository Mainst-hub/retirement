import React, { useState } from 'react';
import {
  View, Text, Image, ScrollView, TouchableOpacity,
  StyleSheet, Linking, Alert, Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { deleteItem, markAsBought } from '../storage/items';
import { CATEGORIES } from '../data/categories';

export default function ItemDetailScreen({ route, navigation }) {
  const { item } = route.params;
  const category = CATEGORIES.find(c => c.id === item.category);

  const savedDate = new Date(item.savedAt).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });

  const openLink = () => {
    if (item.link) {
      Linking.openURL(item.link);
    } else {
      Alert.alert('No link saved', 'This item was saved without a website link. You\'ll need to find it at the store directly.');
    }
  };

  const handleShare = async () => {
    const price = item.currentPrice || item.originalPrice;
    await Share.share({
      message: `Check this out — ${item.name} at ${item.store}${price ? ` for $${price}` : ''}\n${item.link || ''}`.trim(),
    });
  };

  const handleBought = () => {
    Alert.alert(
      'Did you buy this? 🛍️',
      `Great choice! Tap "Yes, I Bought It" and we\'ll move "${item.name}" to your Bought History.`,
      [
        { text: 'Not Yet', style: 'cancel' },
        {
          text: "Yes, I Bought It",
          onPress: async () => {
            await markAsBought(item.id);
            Alert.alert('Awesome!', `"${item.name}" has been moved to your Bought History.`, [
              { text: 'OK', onPress: () => navigation.goBack() },
            ]);
          },
        },
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      'Remove This Item?',
      `This will remove "${item.name}" from your list. You can always add it back later.`,
      [
        { text: 'Keep It', style: 'cancel' },
        {
          text: 'Yes, Remove It', style: 'destructive',
          onPress: async () => { await deleteItem(item.id); navigation.goBack(); },
        },
      ]
    );
  };

  const priceSaved = item.onSale
    ? (parseFloat(item.originalPrice) - parseFloat(item.currentPrice)).toFixed(2)
    : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.image} />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Ionicons name="image-outline" size={60} color="#ccc" />
          <Text style={styles.noImageText}>No photo saved</Text>
        </View>
      )}

      {item.onSale && (
        <View style={styles.saleBanner}>
          <Ionicons name="pricetag" size={18} color="#fff" />
          <Text style={styles.saleBannerText}>  This item is on sale — you save ${priceSaved}!</Text>
        </View>
      )}

      <View style={styles.body}>

        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.store}>{item.store}</Text>

        {/* Price box */}
        <View style={styles.priceBox}>
          <View>
            <Text style={styles.priceLabel}>Price</Text>
            <Text style={[styles.bigPrice, item.onSale && styles.salePriceText]}>
              ${item.currentPrice || item.originalPrice || '—'}
            </Text>
          </View>
          {item.onSale && (
            <View>
              <Text style={styles.priceLabel}>Was</Text>
              <Text style={styles.strikePrice}>${item.originalPrice}</Text>
            </View>
          )}
        </View>

        {/* Price history */}
        {item.priceHistory && item.priceHistory.length > 1 && (
          <View style={styles.historyBox}>
            <Text style={styles.historyTitle}>Price History</Text>
            {[...item.priceHistory].reverse().map((h, i) => (
              <View key={i} style={styles.historyRow}>
                <Text style={styles.historyDate}>
                  {new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </Text>
                <Text style={styles.historyPrice}>${h.price.toFixed(2)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Tags */}
        <View style={styles.metaRow}>
          {category && (
            <View style={styles.metaChip}>
              <Ionicons name={category.icon} size={14} color="#6200ee" />
              <Text style={styles.metaText}> {category.label}</Text>
            </View>
          )}
          <View style={styles.metaChip}>
            <Ionicons name="eye-outline" size={14} color="#6200ee" />
            <Text style={styles.metaText}> Seen on {item.source}</Text>
          </View>
        </View>

        {item.notes ? (
          <View style={styles.notesBox}>
            <Text style={styles.notesLabel}>Your Notes</Text>
            <Text style={styles.notesText}>{item.notes}</Text>
          </View>
        ) : null}

        <Text style={styles.savedDate}>Saved on {savedDate}</Text>

        {/* Main action */}
        <TouchableOpacity style={styles.buyBtn} onPress={openLink}>
          <Ionicons name="cart-outline" size={22} color="#fff" />
          <Text style={styles.buyBtnText}>  Go Buy It</Text>
        </TouchableOpacity>

        <Text style={styles.buyHint}>This will open the store website so you can purchase it.</Text>

        {/* I Bought It */}
        <TouchableOpacity style={styles.boughtBtn} onPress={handleBought}>
          <Ionicons name="checkmark-circle-outline" size={22} color="#fff" />
          <Text style={styles.boughtBtnText}>  I Already Bought This</Text>
        </TouchableOpacity>

        {/* Secondary actions */}
        <View style={styles.secondaryBtns}>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => navigation.navigate('EditItem', { item })}
          >
            <Ionicons name="create-outline" size={20} color="#6200ee" />
            <Text style={styles.secondaryBtnText}>Edit</Text>
          </TouchableOpacity>
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
  content: { paddingBottom: 48 },
  image: { width: '100%', height: 300, resizeMode: 'cover' },
  imagePlaceholder: {
    width: '100%', height: 200, backgroundColor: '#f0f0f0',
    alignItems: 'center', justifyContent: 'center',
  },
  noImageText: { color: '#ccc', marginTop: 8, fontSize: 15 },
  saleBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#e63946', padding: 12, justifyContent: 'center',
  },
  saleBannerText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  body: { padding: 20 },
  name: { fontSize: 24, fontWeight: 'bold', color: '#222', marginBottom: 4 },
  store: { fontSize: 16, color: '#888', marginBottom: 18 },
  priceBox: {
    flexDirection: 'row', gap: 36,
    backgroundColor: '#f5f0ff', borderRadius: 14, padding: 18, marginBottom: 18,
  },
  priceLabel: { fontSize: 13, color: '#888', marginBottom: 4 },
  bigPrice: { fontSize: 32, fontWeight: 'bold', color: '#222' },
  salePriceText: { color: '#e63946' },
  strikePrice: { fontSize: 22, color: '#aaa', textDecorationLine: 'line-through' },
  historyBox: {
    backgroundColor: '#fafafa', borderRadius: 12, padding: 14, marginBottom: 16,
    borderWidth: 1, borderColor: '#eee',
  },
  historyTitle: { fontSize: 14, fontWeight: '700', color: '#555', marginBottom: 10 },
  historyRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  historyDate: { fontSize: 14, color: '#888' },
  historyPrice: { fontSize: 14, fontWeight: '600', color: '#333' },
  metaRow: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  metaChip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f0e6ff', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
  },
  metaText: { fontSize: 14, color: '#6200ee' },
  notesBox: { backgroundColor: '#f9f9f9', borderRadius: 12, padding: 14, marginBottom: 16 },
  notesLabel: { fontSize: 13, color: '#888', marginBottom: 6, fontWeight: '600' },
  notesText: { fontSize: 16, color: '#444', lineHeight: 22 },
  savedDate: { fontSize: 13, color: '#bbb', marginBottom: 20 },
  buyBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#6200ee', borderRadius: 14, padding: 18, marginBottom: 8,
  },
  buyBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  buyHint: { fontSize: 13, color: '#aaa', textAlign: 'center', marginBottom: 14 },
  boughtBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#2d9e5f', borderRadius: 14, padding: 16, marginBottom: 20,
  },
  boughtBtnText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
  secondaryBtns: { flexDirection: 'row', gap: 10 },
  secondaryBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: '#6200ee', borderRadius: 12, padding: 13, gap: 6,
  },
  deleteBtn: { borderColor: '#e63946' },
  secondaryBtnText: { color: '#6200ee', fontWeight: '600', fontSize: 15 },
});
