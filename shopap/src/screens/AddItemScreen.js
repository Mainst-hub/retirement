import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { saveItem } from '../storage/items';
import { CATEGORIES, SOURCES } from '../data/categories';

export default function AddItemScreen({ navigation }) {
  const [mode, setMode] = useState('online'); // 'online' | 'person'
  const [name, setName] = useState('');
  const [store, setStore] = useState('');
  const [link, setLink] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [category, setCategory] = useState('');
  const [source, setSource] = useState('');
  const [notes, setNotes] = useState('');

  const reset = () => {
    setName(''); setStore(''); setLink(''); setPrice('');
    setImage(''); setCategory(''); setSource(''); setNotes('');
  };

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('One thing missing', 'Please enter the name of the product.'); return; }
    if (!price.trim()) { Alert.alert('One thing missing', 'Please enter the price so we can track it for you.'); return; }
    if (!category) { Alert.alert('One thing missing', 'Please pick a category so you can find this item later.'); return; }

    await saveItem({
      name: name.trim(),
      store: store.trim() || 'Unknown Store',
      link: link.trim(),
      originalPrice: parseFloat(price.replace(/[^0-9.]/g, '')),
      currentPrice: parseFloat(price.replace(/[^0-9.]/g, '')),
      image: image.trim(),
      category,
      source: source || (mode === 'person' ? 'Saw In Person' : 'Other'),
      notes: notes.trim(),
      onSale: false,
    });

    Alert.alert(
      'Saved! ✓',
      `"${name}" has been added to your list.`,
      [
        { text: 'Save Another Item', onPress: reset },
        { text: 'Done', onPress: () => navigation.goBack() },
      ]
    );
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>

        {/* Online vs In Person toggle */}
        <Text style={styles.topQuestion}>Where did you find this item?</Text>
        <View style={styles.modeToggle}>
          <TouchableOpacity
            style={[styles.modeBtn, mode === 'online' && styles.modeBtnActive]}
            onPress={() => setMode('online')}
          >
            <Ionicons name="globe-outline" size={18} color={mode === 'online' ? '#fff' : '#555'} />
            <Text style={[styles.modeBtnText, mode === 'online' && styles.modeBtnTextActive]}>  Online</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeBtn, mode === 'person' && styles.modeBtnActive]}
            onPress={() => setMode('person')}
          >
            <Ionicons name="walk-outline" size={18} color={mode === 'person' ? '#fff' : '#555'} />
            <Text style={[styles.modeBtnText, mode === 'person' && styles.modeBtnTextActive]}>  In a Store</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Product Name</Text>
        <Text style={styles.hint}>What is this item called?</Text>
        <TextInput style={styles.input} placeholder="e.g. Nike Air Max, Blue Sofa, Drill Set" value={name} onChangeText={setName} />

        <Text style={styles.label}>Store or Brand</Text>
        <Text style={styles.hint}>Where did you see it?</Text>
        <TextInput style={styles.input} placeholder="e.g. Nike, Saks Fifth Avenue, Lowes, Target" value={store} onChangeText={setStore} />

        <Text style={styles.label}>Price</Text>
        <Text style={styles.hint}>How much does it cost?</Text>
        <TextInput style={styles.input} placeholder="e.g. 49.99" value={price} onChangeText={setPrice} keyboardType="decimal-pad" />

        {mode === 'online' && (
          <>
            <Text style={styles.label}>Website Link (optional)</Text>
            <Text style={styles.hint}>Paste the link from the store's website if you have it.</Text>
            <TextInput style={styles.input} placeholder="Paste the link here" value={link} onChangeText={setLink} autoCapitalize="none" keyboardType="url" />

            <Text style={styles.label}>Photo Link (optional)</Text>
            <Text style={styles.hint}>Paste a link to a photo of the item if you have one.</Text>
            <TextInput style={styles.input} placeholder="Paste a photo link here" value={image} onChangeText={setImage} autoCapitalize="none" keyboardType="url" />

            <Text style={styles.label}>Where did you see it?</Text>
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
          </>
        )}

        <Text style={styles.label}>What kind of item is this?</Text>
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

        <Text style={styles.label}>Notes (optional)</Text>
        <Text style={styles.hint}>Anything you want to remember about this item?</Text>
        <TextInput
          style={[styles.input, styles.notesInput]}
          placeholder="e.g. Wanted the blue one, size 10"
          value={notes} onChangeText={setNotes}
          multiline numberOfLines={3}
        />

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Ionicons name="bag-add-outline" size={22} color="#fff" />
          <Text style={styles.saveBtnText}>  Save to My List</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 16, paddingBottom: 48 },
  topQuestion: { fontSize: 17, fontWeight: '700', color: '#333', marginBottom: 10 },
  modeToggle: {
    flexDirection: 'row', backgroundColor: '#e0e0e0',
    borderRadius: 12, padding: 4, marginBottom: 8,
  },
  modeBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    padding: 12, borderRadius: 10,
  },
  modeBtnActive: { backgroundColor: '#6200ee' },
  modeBtnText: { fontSize: 15, color: '#555', fontWeight: '600' },
  modeBtnTextActive: { color: '#fff' },
  label: { fontSize: 15, fontWeight: '700', color: '#444', marginTop: 18, marginBottom: 2 },
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
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 9,
  },
  chipSelected: { backgroundColor: '#6200ee', borderColor: '#6200ee' },
  chipText: { fontSize: 14, color: '#555' },
  chipTextSelected: { color: '#fff', fontWeight: '600' },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#6200ee', borderRadius: 14, padding: 18, marginTop: 28,
  },
  saveBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
