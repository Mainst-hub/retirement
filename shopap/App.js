import React, { useEffect, useRef, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Linking, TouchableOpacity } from 'react-native';
import ShareMenu from 'react-native-share-menu';

import HomeScreen from './src/screens/HomeScreen';
import CategoriesScreen from './src/screens/CategoriesScreen';
import SalesScreen from './src/screens/SalesScreen';
import BoughtScreen from './src/screens/BoughtScreen';
import AddItemScreen from './src/screens/AddItemScreen';
import EditItemScreen from './src/screens/EditItemScreen';
import ItemDetailScreen from './src/screens/ItemDetailScreen';
import QuickSaveScreen from './src/screens/QuickSaveScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import { getSettings } from './src/storage/items';
import { requestNotificationPermission } from './src/utils/notifications';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const PURPLE = '#6200ee';
const HEADER = { backgroundColor: PURPLE };
const HEADER_TINT = '#fff';
const HEADER_TITLE = { fontWeight: 'bold', fontSize: 20 };

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            'My List': focused ? 'bag' : 'bag-outline',
            'Browse': focused ? 'grid' : 'grid-outline',
            'Sales': focused ? 'pricetag' : 'pricetag-outline',
            'Bought': focused ? 'bag-check' : 'bag-check-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
        tabBarActiveTintColor: PURPLE,
        tabBarInactiveTintColor: '#aaa',
        tabBarStyle: { paddingBottom: 4, height: 60 },
        tabBarLabelStyle: { fontSize: 12 },
        headerStyle: HEADER,
        headerTintColor: HEADER_TINT,
        headerTitleStyle: HEADER_TITLE,
      })}
    >
      <Tab.Screen
        name="My List"
        component={HomeScreen}
        options={({ navigation }) => ({
          title: 'SHOPAP',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate('Settings')}
              style={{ marginRight: 16 }}
            >
              <Ionicons name="settings-outline" size={24} color="#fff" />
            </TouchableOpacity>
          ),
        })}
      />
      <Tab.Screen
        name="Browse"
        component={CategoriesScreen}
        options={{ title: 'Browse' }}
      />
      <Tab.Screen
        name="Sales"
        component={SalesScreen}
        options={{ title: 'On Sale' }}
      />
      <Tab.Screen
        name="Bought"
        component={BoughtScreen}
        options={{ title: 'I Bought It' }}
      />
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
  const [onboardingDone, setOnboardingDone] = useState(null);

  useEffect(() => {
    getSettings().then(s => setOnboardingDone(!!s.onboardingDone));
    requestNotificationPermission();
  }, []);

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

  useEffect(() => {
    const handleDeepLink = ({ url }) => {
      if (!url) return;
      const match = url.match(/[?&]url=([^&]+)/);
      if (match) {
        const productUrl = decodeURIComponent(match[1]);
        navigationRef.current?.navigate('QuickSave', {
          url: productUrl, source: detectSource(productUrl),
        });
      }
    };
    const sub = Linking.addEventListener('url', handleDeepLink);
    Linking.getInitialURL().then(url => { if (url) handleDeepLink({ url }); });
    return () => sub.remove();
  }, []);

  if (onboardingDone === null) return null; // loading

  if (!onboardingDone) {
    return <OnboardingScreen onDone={() => setOnboardingDone(true)} />;
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <StatusBar style="light" />
      <Stack.Navigator>
        <Stack.Screen name="Main" component={HomeTabs} options={{ headerShown: false }} />
        <Stack.Screen
          name="QuickSave" component={QuickSaveScreen}
          options={{ title: 'Save This Item', headerStyle: HEADER, headerTintColor: HEADER_TINT, headerTitleStyle: HEADER_TITLE }}
        />
        <Stack.Screen
          name="AddItem" component={AddItemScreen}
          options={{ title: 'Save Something New', headerStyle: HEADER, headerTintColor: HEADER_TINT, headerTitleStyle: HEADER_TITLE }}
        />
        <Stack.Screen
          name="ItemDetail" component={ItemDetailScreen}
          options={{ title: 'Item Details', headerStyle: HEADER, headerTintColor: HEADER_TINT, headerTitleStyle: HEADER_TITLE }}
        />
        <Stack.Screen
          name="EditItem" component={EditItemScreen}
          options={{ title: 'Edit This Item', headerStyle: HEADER, headerTintColor: HEADER_TINT, headerTitleStyle: HEADER_TITLE }}
        />
        <Stack.Screen
          name="Settings" component={SettingsScreen}
          options={{ title: 'Settings', headerStyle: HEADER, headerTintColor: HEADER_TINT, headerTitleStyle: HEADER_TITLE }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
