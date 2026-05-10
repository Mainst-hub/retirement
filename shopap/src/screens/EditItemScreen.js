import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { updateItem } from '../storage/items';
import { CATEGORIES } from '../data/categories';
import { sendPriceDropAlert } from '../utils/notifications';

export default function EditItemScreen({ route, navigation }) {
  const { item } = route.params;

  const [name, setName] = useState(item.name || '');
  const [store, setStore] = useState(item.store || '');
  const [price, setPrice] = useState(String(item.currentPrice || item.originalPrice || ''));
  const [image, setImage] = useState(item.image || '');
  const [category, setCategory] = useState(item.category || '');
  const [notes, setNotes] = useState(item.notes || '');

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Missing Info', 'Please enter a product name.'); return; }

    const newPrice = parseFloat(price.replace(/[^0-9.]/g, '')) || 0;
    const oldPrice = parseFloat(item.currentPrice || item.originalPrice) || 0;
    const priceDropped = newPrice > 0 && newPrice < oldPrice;

    await updateItem(item.id, {
      name: name.trim(),
      store: store.trim(),
      image: image.trim(),
      category,
      notes: notes.trim(),
      currentPrice: newPrice,
      originalPrice: item.originalPrice,
    });

    if (priceDropped) {
      await sendPriceDropAlert(name.trim(), oldPrice, newPrice);
    }

    Alert.alert('Saved!', 'Your changes have been saved.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>

        <Text style={styles.sectionLabel}>Product Name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} />

        <Text style={styles.sectionLabel}>Store Name</Text>
        <TextInput style={styles.input} value={store} onChangeText={setStore} />

        <Text style={styles.sectionLabel}>Current Price</Text>
        <Text style={styles.hint}>Update this if the price has changed — we'll track the history for you.</Text>
        <TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="decimal-pad" />

        <Text style={styles.sectionLabel}>Photo Link (optional)</Text>
        <TextInput style={styles.input} value={image} onChangeText={setImage} autoCapitalize="none" />

        <Text style={styles.sectionLabel}>Category</Text>
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

        <Text style={styles.sectionLabel}>Your Notes</Text>
        <TextInput
          style={[styles.input, styles.notesInput]}
          value={notes} onChangeText={setNotes}
          multiline numberOfLines={3}
          placeholder="Any notes about this item..."
        />

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Ionicons name="save-outline" size={20} color="#fff" />
          <Text style={styles.saveBtnText}>  Save Changes</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 16, paddingBottom: 40 },
  sectionLabel: { fontSize: 15, fontWeight: '700', color: '#444', marginTop: 18, marginBottom: 4 },
  hint: { fontSize: 13, color: '#aaa', marginBottom: 6 },
  input: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14,
    fontSize: 16, color: '#222', borderWidth: 1, borderColor: '#e0e0e0',
  },
  notesInput: { height: 90, textAlignVertical: 'top' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
  },
  chipSelected: { backgroundColor: '#6200ee', borderColor: '#6200ee' },
  chipText: { fontSize: 14, color: '#555' },
  chipTextSelected: { color: '#fff', fontWeight: '600' },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#6200ee', borderRadius: 14, padding: 18, marginTop: 28,
  },
  saveBtnText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
});
