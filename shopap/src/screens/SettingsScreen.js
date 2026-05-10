import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Switch, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getSettings, saveSettings } from '../storage/items';
import { requestNotificationPermission } from '../utils/notifications';

export default function SettingsScreen() {
  const [budget, setBudget] = useState('');
  const [notifyDrops, setNotifyDrops] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getSettings().then(s => {
      setBudget(s.monthlyBudget || '');
      setNotifyDrops(s.notifyPriceDrops !== false);
    });
  }, []);

  const handleSave = async () => {
    if (notifyDrops) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        Alert.alert(
          'Notifications Blocked',
          'To get price drop alerts, please allow notifications for SHOPAP in your phone\'s Settings app.',
        );
      }
    }
    await saveSettings({
      monthlyBudget: budget,
      notifyPriceDrops: notifyDrops,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="wallet-outline" size={22} color="#6200ee" />
          <Text style={styles.sectionTitle}>Monthly Budget</Text>
        </View>
        <Text style={styles.sectionDesc}>
          Set how much you'd like to spend each month. SHOPAP will show you how close you are to your limit.
        </Text>
        <View style={styles.budgetRow}>
          <Text style={styles.dollarSign}>$</Text>
          <TextInput
            style={styles.budgetInput}
            value={budget}
            onChangeText={setBudget}
            placeholder="e.g. 200"
            keyboardType="decimal-pad"
            placeholderTextColor="#bbb"
          />
          <Text style={styles.perMonth}>/ month</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="notifications-outline" size={22} color="#6200ee" />
          <Text style={styles.sectionTitle}>Price Drop Alerts</Text>
        </View>
        <Text style={styles.sectionDesc}>
          When an item on your list goes on sale, we'll send you a notification right away so you don't miss it.
        </Text>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>
            {notifyDrops ? 'Alerts are ON' : 'Alerts are OFF'}
          </Text>
          <Switch
            value={notifyDrops}
            onValueChange={setNotifyDrops}
            trackColor={{ false: '#ccc', true: '#c4a6ff' }}
            thumbColor={notifyDrops ? '#6200ee' : '#f0f0f0'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="information-circle-outline" size={22} color="#6200ee" />
          <Text style={styles.sectionTitle}>How to Use SHOPAP</Text>
        </View>
        <View style={styles.tipRow}>
          <Text style={styles.tipNum}>1</Text>
          <Text style={styles.tipText}>See something you like? Hit Share in any app and pick SHOPAP.</Text>
        </View>
        <View style={styles.tipRow}>
          <Text style={styles.tipNum}>2</Text>
          <Text style={styles.tipText}>We automatically find the name, photo, and price for you.</Text>
        </View>
        <View style={styles.tipRow}>
          <Text style={styles.tipNum}>3</Text>
          <Text style={styles.tipText}>When you're ready to buy, open the item and tap "Go Buy It."</Text>
        </View>
        <View style={styles.tipRow}>
          <Text style={styles.tipNum}>4</Text>
          <Text style={styles.tipText}>After buying, tap "I Already Bought This" to move it to your history.</Text>
        </View>
      </View>

      <TouchableOpacity style={[styles.saveBtn, saved && styles.saveBtnDone]} onPress={handleSave}>
        <Ionicons name={saved ? 'checkmark-circle' : 'save-outline'} size={20} color="#fff" />
        <Text style={styles.saveBtnText}>{saved ? '  Saved!' : '  Save Settings'}</Text>
      </TouchableOpacity>

      <Text style={styles.version}>SHOPAP v1.0</Text>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 16, paddingBottom: 48 },
  section: {
    backgroundColor: '#fff', borderRadius: 16, padding: 18,
    marginBottom: 14,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#222' },
  sectionDesc: { fontSize: 15, color: '#777', lineHeight: 22, marginBottom: 14 },
  budgetRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dollarSign: { fontSize: 22, color: '#555', fontWeight: '600' },
  budgetInput: {
    flex: 1, backgroundColor: '#f5f5f5', borderRadius: 10, padding: 12,
    fontSize: 20, color: '#222', fontWeight: '600', borderWidth: 1, borderColor: '#e0e0e0',
  },
  perMonth: { fontSize: 16, color: '#888' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  toggleLabel: { fontSize: 16, color: '#444', fontWeight: '600' },
  tipRow: { flexDirection: 'row', gap: 12, marginBottom: 14, alignItems: 'flex-start' },
  tipNum: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#6200ee', color: '#fff',
    fontSize: 14, fontWeight: 'bold',
    textAlign: 'center', lineHeight: 28,
    overflow: 'hidden',
  },
  tipText: { flex: 1, fontSize: 15, color: '#555', lineHeight: 22 },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#6200ee', borderRadius: 14, padding: 18, marginTop: 6,
  },
  saveBtnDone: { backgroundColor: '#2d9e5f' },
  saveBtnText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
  version: { textAlign: 'center', color: '#ccc', fontSize: 13, marginTop: 20 },
});
