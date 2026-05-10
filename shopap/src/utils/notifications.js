import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission() {
  if (!Device.isDevice) return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function sendPriceDropAlert(itemName, oldPrice, newPrice) {
  const saved = (oldPrice - newPrice).toFixed(2);
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🏷️ Price Drop on SHOPAP!',
      body: `${itemName} dropped from $${oldPrice} to $${newPrice}. You save $${saved}!`,
      sound: true,
    },
    trigger: null, // send immediately
  });
}

export async function scheduleReminder(itemName, date) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'SHOPAP Reminder',
      body: `Don't forget — you saved "${itemName}" and wanted to check on it today.`,
      sound: true,
    },
    trigger: { date },
  });
}
