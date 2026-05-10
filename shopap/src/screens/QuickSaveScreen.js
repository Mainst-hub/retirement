import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Image, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchProductInfo } from '../utils/fetchProductInfo';
import { saveItem } from '../storage/items';
import { CATEGORIES } from '../data/categories';

export default function QuickSaveScreen({ route, navigation }) {
  const sharedUrl = route?.params?.url || '';

  const [loading, setLoading] = useState(!!sharedUrl);
  const [name, setName] = useState('');
  const [store, setStore] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [category, setCategory] = useState('');
  const [source, setSource] = useState(route?.params?.source || 'Other');

  useEffect(() => {
    if (sharedUrl) autoFetch(sharedUrl);
  }, [sharedUrl]);

  const autoFetch = async (url) => {
    setLoading(true);
    const info = await fetchProductInfo(url);
    setName(info.name);
    setStore(info.store);
    setPrice(info.price);
    setImage(info.image);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Missing Info', 'We need a product name.'); return; }
    if (!category) { Alert.alert('Missing Info', 'Pick a category so you can find it later.'); return; }

    await saveItem({
      name: name.trim(),
      store: store.trim() || 'Unknown Store',
      link: sharedUrl,
      originalPrice: parseFloat(price) || 0,
      currentPrice: parseFloat(price) || 0,
      image: image.trim(),
      category,
      source,
      notes: '',
      onSale: false,
    });

    navigation.replace('Main');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Fetching product info...</Text>
        <Text style={styles.loadingUrl} numberOfLines={1}>{sharedUrl}</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>

        {image ? (
          <Image source={{ uri: image }} style={styles.productImage} />
        ) : (
          <View style={styles.noImage}>
            <Ionicons name="image-outline" size={50} color="#ccc" />
          </View>
        )}

        <View style={styles.banner}>
          <Ionicons name="checkmark-circle" size={18} color="#6200ee" />
          <Text style={styles.bannerText}>  We found this product — confirm and save</Text>
        </View>

        <Text style={styles.label}>Product Name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Product name" />

        <Text style={styles.label}>Store</Text>
        <TextInput style={styles.input} value={store} onChangeText={setStore} placeholder="Store name" />

        <Text style={styles.label}>Price</Text>
        <TextInput
          style={styles.input} value={price} onChangeText={setPrice}
          placeholder="0.00" keyboardType="decimal-pad"
        />

        <Text style={styles.label}>Category</Text>
        <View style={styles.chipRow}>
          {CATEGORIES.map(c => (
            <TouchableOpacity
              key={c.id}
              style={[styles.chip, category === c.id && styles.chipSelected]}
              onPress={() => setCategory(c.id)}
            >
              <Ionicons name={c.icon} size={13} color={category === c.id ? '#fff' : '#555'} />
              <Text style={[styles.chipText, category === c.id && styles.chipTextSelected]}> {c.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Ionicons name="bag-add-outline" size={20} color="#fff" />
          <Text style={styles.saveBtnText}>  Save to SHOPAP</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { paddingBottom: 40 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  loadingText: { fontSize: 18, fontWeight: '600', color: '#444', marginTop: 16 },
  loadingUrl: { fontSize: 12, color: '#aaa', marginTop: 8, maxWidth: '100%' },
  productImage: { width: '100%', height: 260, resizeMode: 'cover' },
  noImage: {
    width: '100%', height: 160, backgroundColor: '#eee',
    alignItems: 'center', justifyContent: 'center',
  },
  banner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f0e6ff', padding: 12, margin: 16, borderRadius: 10,
  },
  bannerText: { color: '#6200ee', fontWeight: '600', fontSize: 13 },
  label: { fontSize: 13, fontWeight: '600', color: '#444', marginHorizontal: 16, marginTop: 12, marginBottom: 6 },
  input: {
    backgroundColor: '#fff', borderRadius: 10, padding: 12, marginHorizontal: 16,
    fontSize: 14, color: '#222', borderWidth: 1, borderColor: '#e0e0e0',
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginHorizontal: 16 },
  chip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
  },
  chipSelected: { backgroundColor: '#6200ee', borderColor: '#6200ee' },
  chipText: { fontSize: 13, color: '#555' },
  chipTextSelected: { color: '#fff', fontWeight: '600' },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#6200ee', borderRadius: 12, padding: 16, margin: 16, marginTop: 24,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  cancelBtn: { alignItems: 'center', marginBottom: 8 },
  cancelText: { color: '#aaa', fontSize: 15 },
});
