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
  const [fetchFailed, setFetchFailed] = useState(false);
  const [name, setName] = useState('');
  const [store, setStore] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [category, setCategory] = useState('');
  const [source] = useState(route?.params?.source || 'Other');

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
    setFetchFailed(!info.name);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('One thing missing', 'Please enter the name of the product.');
      return;
    }
    if (!category) {
      Alert.alert('One thing missing', 'Please pick a category so you can find this item later.');
      return;
    }

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

    Alert.alert(
      'Saved! ✓',
      `"${name}" has been added to your list.`,
      [{ text: 'Great!', onPress: () => navigation.replace('Main') }]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingTitle}>Looking up this product...</Text>
        <Text style={styles.loadingSubtext}>
          We're finding the name, photo, and price for you.{'\n'}Just a moment!
        </Text>
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
            <Text style={styles.noImageText}>No photo found</Text>
          </View>
        )}

        <View style={styles.banner}>
          {fetchFailed ? (
            <>
              <Ionicons name="alert-circle-outline" size={18} color="#e67e22" />
              <Text style={[styles.bannerText, { color: '#e67e22' }]}>
                {'  '}We couldn't read this page. Please fill in the details below.
              </Text>
            </>
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={18} color="#6200ee" />
              <Text style={styles.bannerText}>
                {'  '}We found the product details — just check them over and save!
              </Text>
            </>
          )}
        </View>

        <Text style={styles.label}>Product Name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="What is this item called?" />

        <Text style={styles.label}>Store Name</Text>
        <TextInput style={styles.input} value={store} onChangeText={setStore} placeholder="Which store sells this?" />

        <Text style={styles.label}>Price</Text>
        <TextInput
          style={styles.input} value={price} onChangeText={setPrice}
          placeholder="How much does it cost?" keyboardType="decimal-pad"
        />

        <Text style={styles.label}>What kind of item is this?</Text>
        <Text style={styles.hint}>Pick one so you can easily find it later.</Text>
        <View style={styles.chipRow}>
          {CATEGORIES.map(c => (
            <TouchableOpacity
              key={c.id}
              style={[styles.chip, category === c.id && styles.chipSelected]}
              onPress={() => setCategory(c.id)}
            >
              <Ionicons name={c.icon} size={14} color={category === c.id ? '#fff' : '#555'} />
              <Text style={[styles.chipText, category === c.id && styles.chipTextSelected]}> {c.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Ionicons name="bag-add-outline" size={22} color="#fff" />
          <Text style={styles.saveBtnText}>  Save to My List</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Cancel — don't save this</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { paddingBottom: 48 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  loadingTitle: { fontSize: 20, fontWeight: '700', color: '#444', marginTop: 20 },
  loadingSubtext: { fontSize: 16, color: '#aaa', textAlign: 'center', marginTop: 10, lineHeight: 24 },
  productImage: { width: '100%', height: 260, resizeMode: 'cover' },
  noImage: {
    width: '100%', height: 160, backgroundColor: '#eee',
    alignItems: 'center', justifyContent: 'center',
  },
  noImageText: { color: '#bbb', marginTop: 8, fontSize: 14 },
  banner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f0e6ff', padding: 14, margin: 16, borderRadius: 12,
  },
  bannerText: { color: '#6200ee', fontWeight: '600', fontSize: 14, flex: 1 },
  label: { fontSize: 15, fontWeight: '700', color: '#444', marginHorizontal: 16, marginTop: 14, marginBottom: 4 },
  hint: { fontSize: 13, color: '#aaa', marginHorizontal: 16, marginBottom: 6 },
  input: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14, marginHorizontal: 16,
    fontSize: 16, color: '#222', borderWidth: 1, borderColor: '#e0e0e0',
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginHorizontal: 16 },
  chip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 9,
  },
  chipSelected: { backgroundColor: '#6200ee', borderColor: '#6200ee' },
  chipText: { fontSize: 14, color: '#555' },
  chipTextSelected: { color: '#fff', fontWeight: '600' },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#6200ee', borderRadius: 14, padding: 18, margin: 16, marginTop: 24,
  },
  saveBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  cancelBtn: { alignItems: 'center', marginBottom: 8 },
  cancelText: { color: '#aaa', fontSize: 15 },
});
