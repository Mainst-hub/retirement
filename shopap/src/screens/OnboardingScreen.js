import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Dimensions, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { saveSettings } from '../storage/items';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    icon: 'bag-heart-outline',
    title: 'Welcome to SHOPAP',
    body: 'SHOPAP is your personal shopping list.\n\nSave things you want to buy — from any store, any website, or any app — all in one place.',
    color: '#6200ee',
  },
  {
    icon: 'share-outline',
    title: 'Share from any app',
    body: 'When you see something you like on Instagram, TikTok, or any website, tap the Share button and choose SHOPAP.\n\nWe do the rest — no typing needed.',
    color: '#7c3aed',
  },
  {
    icon: 'sparkles-outline',
    title: 'We fill in the details',
    body: 'SHOPAP automatically finds the product name, photo, and price for you.\n\nJust pick a category and tap Save. Done!',
    color: '#9333ea',
  },
  {
    icon: 'pricetag-outline',
    title: 'Never miss a sale',
    body: 'When the price drops on something you saved, SHOPAP lets you know right away.\n\nYou\'ll always know the best time to buy.',
    color: '#a855f7',
  },
  {
    icon: 'cart-outline',
    title: 'Ready to buy?',
    body: 'When you\'re ready to buy something, just tap "Go Buy It" and we\'ll take you straight to the store.\n\nYou can also mark things as bought to keep track of what you\'ve purchased.',
    color: '#6200ee',
  },
];

export default function OnboardingScreen({ onDone }) {
  const [step, setStep] = useState(0);
  const slide = SLIDES[step];
  const isLast = step === SLIDES.length - 1;

  const finish = async () => {
    await saveSettings({ onboardingDone: true });
    onDone();
  };

  return (
    <View style={[styles.container, { backgroundColor: slide.color }]}>
      <TouchableOpacity style={styles.skipBtn} onPress={finish}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name={slide.icon} size={70} color={slide.color} />
        </View>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.body}>{slide.body}</Text>
      </View>

      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
        ))}
      </View>

      <TouchableOpacity
        style={styles.nextBtn}
        onPress={isLast ? finish : () => setStep(step + 1)}
      >
        <Text style={styles.nextText}>{isLast ? "Let's Get Started!" : 'Next'}</Text>
        {!isLast && <Ionicons name="arrow-forward" size={20} color={slide.color} />}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  skipBtn: { position: 'absolute', top: 56, right: 24, zIndex: 10 },
  skipText: { color: 'rgba(255,255,255,0.7)', fontSize: 16 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  iconCircle: {
    width: 130, height: 130, borderRadius: 65,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
    marginBottom: 36,
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12, elevation: 6,
  },
  title: {
    fontSize: 28, fontWeight: 'bold', color: '#fff',
    textAlign: 'center', marginBottom: 20,
  },
  body: {
    fontSize: 18, color: 'rgba(255,255,255,0.92)',
    textAlign: 'center', lineHeight: 28,
  },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 24 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.4)' },
  dotActive: { backgroundColor: '#fff', width: 24 },
  nextBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#fff', marginHorizontal: 24, marginBottom: 48,
    borderRadius: 16, padding: 18,
  },
  nextText: { fontSize: 18, fontWeight: 'bold', color: '#6200ee' },
});
