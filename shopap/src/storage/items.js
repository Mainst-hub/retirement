import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'shopap_items';

export async function getItems() {
  const data = await AsyncStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export async function saveItem(item) {
  const items = await getItems();
  const newItem = {
    ...item,
    id: Date.now().toString(),
    savedAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([newItem, ...items]));
  return newItem;
}

export async function deleteItem(id) {
  const items = await getItems();
  const updated = items.filter(i => i.id !== id);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export async function updateItemPrice(id, newPrice) {
  const items = await getItems();
  const updated = items.map(i =>
    i.id === id ? { ...i, currentPrice: newPrice, onSale: newPrice < i.originalPrice } : i
  );
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}
