import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Linking, AppState } from 'react-native';
import ShareMenu from 'react-native-share-menu';

import HomeScreen from './src/screens/HomeScreen';
import CategoriesScreen from './src/screens/CategoriesScreen';
import SalesScreen from './src/screens/SalesScreen';
import AddItemScreen from './src/screens/AddItemScreen';
import ItemDetailScreen from './src/screens/ItemDetailScreen';
import QuickSaveScreen from './src/screens/QuickSaveScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Home: focused ? 'bag' : 'bag-outline',
            Categories: focused ? 'grid' : 'grid-outline',
            Sales: focused ? 'pricetag' : 'pricetag-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6200ee',
        tabBarInactiveTintColor: '#aaa',
        tabBarStyle: { paddingBottom: 4, height: 58 },
        headerStyle: { backgroundColor: '#6200ee' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold', fontSize: 20 },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'SHOPAP' }} />
      <Tab.Screen name="Categories" component={CategoriesScreen} />
      <Tab.Screen name="Sales" component={SalesScreen} />
    </Tab.Navigator>
  );
}

function detectSource(url) {
  if (!url) return 'Other';
  if (url.includes('instagram.com')) return 'Instagram';
  if (url.includes('tiktok.com')) return 'TikTok';
  if (url.includes('pinterest.com')) return 'Pinterest';
  if (url.includes('facebook.com') || url.includes('fb.com')) return 'Facebook';
  if (url.includes('twitter.com') || url.includes('x.com')) return 'Twitter';
  if (url.includes('youtube.com')) return 'YouTube';
  return 'Other';
}

export default function App() {
  const navigationRef = useRef(null);

  const handleShare = (item) => {
    if (!item) return;
    const { mimeType, data } = item;
    let url = '';
    if (mimeType === 'text/plain' && typeof data === 'string') {
      const urlMatch = data.match(/https?:\/\/[^\s]+/);
      url = urlMatch ? urlMatch[0] : data;
    }
    if (url && navigationRef.current) {
      navigationRef.current.navigate('QuickSave', { url, source: detectSource(url) });
    }
  };

  useEffect(() => {
    ShareMenu.getInitialShare(handleShare);
    const subscription = ShareMenu.addNewShareListener(handleShare);
    return () => subscription.remove();
  }, []);

  // Handle deep links (shopap://save?url=...)
  useEffect(() => {
    const handleDeepLink = ({ url }) => {
      if (!url) return;
      const match = url.match(/[?&]url=([^&]+)/);
      if (match) {
        const productUrl = decodeURIComponent(match[1]);
        navigationRef.current?.navigate('QuickSave', { url: productUrl, source: detectSource(productUrl) });
      }
    };
    const sub = Linking.addEventListener('url', handleDeepLink);
    Linking.getInitialURL().then(url => { if (url) handleDeepLink({ url }); });
    return () => sub.remove();
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <StatusBar style="light" />
      <Stack.Navigator>
        <Stack.Screen name="Main" component={HomeTabs} options={{ headerShown: false }} />
        <Stack.Screen
          name="QuickSave"
          component={QuickSaveScreen}
          options={{
            title: 'Save Item',
            headerStyle: { backgroundColor: '#6200ee' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        />
        <Stack.Screen
          name="AddItem"
          component={AddItemScreen}
          options={{
            title: 'Save an Item',
            headerStyle: { backgroundColor: '#6200ee' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        />
        <Stack.Screen
          name="ItemDetail"
          component={ItemDetailScreen}
          options={{
            title: 'Item Details',
            headerStyle: { backgroundColor: '#6200ee' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
