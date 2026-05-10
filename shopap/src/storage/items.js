import AsyncStorage from '@react-native-async-storage/async-storage';

const ITEMS_KEY = 'shopap_items';
const BOUGHT_KEY = 'shopap_bought';
const SETTINGS_KEY = 'shopap_settings';

// ─── Saved Items ────────────────────────────────────────────────────────────

export async function getItems() {
  const data = await AsyncStorage.getItem(ITEMS_KEY);
  return data ? JSON.parse(data) : [];
}

export async function saveItem(item) {
  const items = await getItems();
  const newItem = {
    ...item,
    id: Date.now().toString(),
    savedAt: new Date().toISOString(),
    priceHistory: item.originalPrice
      ? [{ price: parseFloat(item.originalPrice), date: new Date().toISOString() }]
      : [],
  };
  await AsyncStorage.setItem(ITEMS_KEY, JSON.stringify([newItem, ...items]));
  return newItem;
}

export async function updateItem(id, updates) {
  const items = await getItems();
  const updated = items.map(item => {
    if (item.id !== id) return item;
    const newItem = { ...item, ...updates };
    // Track price change in history
    const newPrice = parseFloat(updates.currentPrice || updates.originalPrice);
    const lastPrice = item.priceHistory?.[item.priceHistory.length - 1]?.price;
    if (newPrice && newPrice !== lastPrice) {
      newItem.priceHistory = [
        ...(item.priceHistory || []),
        { price: newPrice, date: new Date().toISOString() },
      ];
      newItem.onSale = newPrice < parseFloat(item.originalPrice);
    }
    return newItem;
  });
  await AsyncStorage.setItem(ITEMS_KEY, JSON.stringify(updated));
}

export async function deleteItem(id) {
  const items = await getItems();
  await AsyncStorage.setItem(ITEMS_KEY, JSON.stringify(items.filter(i => i.id !== id)));
}

export async function markAsBought(id) {
  const items = await getItems();
  const item = items.find(i => i.id === id);
  if (!item) return;
  const boughtItems = await getBoughtItems();
  const boughtItem = { ...item, boughtAt: new Date().toISOString() };
  await AsyncStorage.setItem(BOUGHT_KEY, JSON.stringify([boughtItem, ...boughtItems]));
  await AsyncStorage.setItem(ITEMS_KEY, JSON.stringify(items.filter(i => i.id !== id)));
}

// ─── Bought History ──────────────────────────────────────────────────────────

export async function getBoughtItems() {
  const data = await AsyncStorage.getItem(BOUGHT_KEY);
  return data ? JSON.parse(data) : [];
}

export async function deleteBoughtItem(id) {
  const items = await getBoughtItems();
  await AsyncStorage.setItem(BOUGHT_KEY, JSON.stringify(items.filter(i => i.id !== id)));
}

// ─── Settings ────────────────────────────────────────────────────────────────

export async function getSettings() {
  const data = await AsyncStorage.getItem(SETTINGS_KEY);
  return data ? JSON.parse(data) : {
    monthlyBudget: '',
    notifyPriceDrops: true,
    onboardingDone: false,
  };
}

export async function saveSettings(updates) {
  const current = await getSettings();
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...current, ...updates }));
}
