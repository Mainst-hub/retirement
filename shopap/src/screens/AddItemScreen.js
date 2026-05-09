import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { saveItem } from '../storage/items';
import { CATEGORIES, SOURCES } from '../data/categories';

export default function AddItemScreen({ navigation }) {
  const [name, setName] = useState('');
  const [store, setStore] = useState('');
  const [link, setLink] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [category, setCategory] = useState('');
  const [source, setSource] = useState('');
  const [notes, setNotes] = useState('');

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Missing Info', 'Please enter a product name.'); return; }
    if (!price.trim()) { Alert.alert('Missing Info', 'Please enter a price.'); return; }
    if (!category) { Alert.alert('Missing Info', 'Please select a category.'); return; }

    await saveItem({
      name: name.trim(),
      store: store.trim() || 'Unknown Store',
      link: link.trim(),
      originalPrice: parseFloat(price.replace(/[^0-9.]/g, '')),
      currentPrice: parseFloat(price.replace(/[^0-9.]/g, '')),
      image: image.trim(),
      category,
      source: source || 'Other',
      notes: notes.trim(),
      onSale: false,
    });

    Alert.alert('Saved!', `"${name}" has been added to your SHOPAP.`, [
      { text: 'Add Another', onPress: () => { setName(''); setStore(''); setLink(''); setPrice(''); setImage(''); setCategory(''); setSource(''); setNotes(''); } },
      { text: 'Done', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>

        <Text style={styles.sectionLabel}>Product Name *</Text>
        <TextInput style={styles.input} placeholder="e.g. Nike Air Max 270" value={name} onChangeText={setName} />

        <Text style={styles.sectionLabel}>Store / Vendor</Text>
        <TextInput style={styles.input} placeholder="e.g. Nike, Saks Fifth Avenue, Lowes" value={store} onChangeText={setStore} />

        <Text style={styles.sectionLabel}>Price *</Text>
        <TextInput style={styles.input} placeholder="e.g. 129.99" value={price} onChangeText={setPrice} keyboardType="decimal-pad" />

        <Text style={styles.sectionLabel}>Product Link (URL)</Text>
        <TextInput style={styles.input} placeholder="Paste the product link here" value={link} onChangeText={setLink} autoCapitalize="none" keyboardType="url" />

        <Text style={styles.sectionLabel}>Image URL (optional)</Text>
        <TextInput style={styles.input} placeholder="Paste an image link" value={image} onChangeText={setImage} autoCapitalize="none" keyboardType="url" />

        <Text style={styles.sectionLabel}>Category *</Text>
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

        <Text style={styles.sectionLabel}>Where did you see it?</Text>
        <View style={styles.chipRow}>
          {SOURCES.map(s => (
            <TouchableOpacity
              key={s}
              style={[styles.chip, source === s && styles.chipSelected]}
              onPress={() => setSource(s)}
            >
              <Text style={[styles.chipText, source === s && styles.chipTextSelected]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Notes</Text>
        <TextInput
          style={[styles.input, styles.notesInput]}
          placeholder="Any notes about this item..."
          value={notes} onChangeText={setNotes}
          multiline numberOfLines={3}
        />

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Ionicons name="bag-add-outline" size={20} color="#fff" />
          <Text style={styles.saveBtnText}>  Save to SHOPAP</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 16, paddingBottom: 40 },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: '#444', marginTop: 16, marginBottom: 6 },
  input: {
    backgroundColor: '#fff', borderRadius: 10, padding: 12,
    fontSize: 14, color: '#222', borderWidth: 1, borderColor: '#e0e0e0',
  },
  notesInput: { height: 80, textAlignVertical: 'top' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
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
    backgroundColor: '#6200ee', borderRadius: 12, padding: 16, marginTop: 24,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
