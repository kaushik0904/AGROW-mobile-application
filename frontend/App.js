import React, { useCallback } from 'react';
import { View, StatusBar, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold } from '@expo-google-fonts/outfit';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';

import FarmerHomeScreen from './src/pages/home/farmer/FarmerHomeScreen';
import FarmerMarketScreen from './src/pages/market/farmer/FarmerMarketScreen';
import FarmerSocialScreen from './src/pages/social/farmer/FarmerSocialScreen';
import FarmerInsightsScreen from './src/pages/insights/farmer/FarmerInsightsScreen';
import FarmerProfileScreen from './src/pages/profile/farmer/FarmerProfileScreen';

import LoginScreen from './src/pages/auth/LoginScreen';
import SignupScreen from './src/pages/auth/SignupScreen';
import OtpLoginScreen from './src/pages/auth/OtpLoginScreen';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import { colors, consumerColors, fonts } from './src/common/theme';

SplashScreen.preventAutoHideAsync();

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const tabIcons = {
  Home: { active: 'home', inactive: 'home-outline' },
  Market: { active: 'basket', inactive: 'basket-outline' },
  Social: { active: 'people', inactive: 'people-outline' },
  Insights: { active: 'bar-chart', inactive: 'bar-chart-outline' },
  Profile: { active: 'person', inactive: 'person-outline' },
  Cart: { active: 'cart', inactive: 'cart-outline' },
};

// Create FarmerTabs
function FarmerTabs() {
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          const iconName = focused ? tabIcons[route.name].active : tabIcons[route.name].inactive;
          return (
            <View style={[focused ? styles.activeIconWrapper : null, focused && { backgroundColor: colors.primary100 }]}>
              <Ionicons name={iconName} size={focused ? 22 : 21} color={color} />
            </View>
          );
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontFamily: fonts.bodyMedium,
          fontSize: 10,
          marginTop: 2,
          marginBottom: insets.bottom > 0 ? 0 : 8,
        },
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 1,
          borderTopColor: colors.borderLight,
          height: 60 + insets.bottom,
          paddingTop: 10,
          paddingBottom: insets.bottom,
          elevation: 15,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
        },
      })}
    >
      <Tab.Screen name="Home" component={FarmerHomeScreen} />
      <Tab.Screen name="Market" component={FarmerMarketScreen} />
      <Tab.Screen name="Social" component={FarmerSocialScreen} />
      <Tab.Screen name="Insights" component={FarmerInsightsScreen} />
      <Tab.Screen name="Profile" component={FarmerProfileScreen} />
    </Tab.Navigator>
  );
}

import ConsumerHomeScreen from './src/pages/home/consumer/ConsumerHomeScreen';
import ConsumerMarketScreen from './src/pages/market/consumer/ConsumerMarketScreen';
import ConsumerProfileScreen from './src/pages/profile/consumer/ConsumerProfileScreen';
import CartScreen from './src/pages/market/consumer/CartScreen';

function ConsumerTabs() {
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          const iconName = focused ? tabIcons[route.name].active : tabIcons[route.name].inactive;
          return (
            <View style={[focused ? styles.activeIconWrapper : null, focused && { backgroundColor: consumerColors.primary100 }]}>
              <Ionicons name={iconName} size={focused ? 22 : 21} color={color} />
            </View>
          );
        },
        tabBarActiveTintColor: consumerColors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontFamily: fonts.bodyMedium,
          fontSize: 10,
          marginTop: 2,
          marginBottom: insets.bottom > 0 ? 0 : 8,
        },
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 1,
          borderTopColor: colors.borderLight,
          height: 60 + insets.bottom,
          paddingTop: 10,
          paddingBottom: insets.bottom,
          elevation: 15,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
        },
      })}
    >
      <Tab.Screen name="Home" component={ConsumerHomeScreen} />
      <Tab.Screen name="Market" component={ConsumerMarketScreen} />
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="Profile" component={ConsumerProfileScreen} />
    </Tab.Navigator>
  );
}

function MainTabs() {
  const { user } = useAuth();
  if (user?.category === 'consumer') {
    return <ConsumerTabs />;
  }
  return <FarmerTabs />;
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="OtpLogin" component={OtpLoginScreen} />
    </Stack.Navigator>
  );
}

import EditConsumerProfileScreen from './src/pages/profile/consumer/EditConsumerProfileScreen';
import EditFarmerProfileScreen from './src/pages/profile/farmer/EditFarmerProfileScreen';
import PublicProfileScreen from './src/pages/profile/PublicProfileScreen';
import AiChatScreen from './src/pages/insights/farmer/AiChatScreen';
import ProductDetailsScreen from './src/pages/market/consumer/ProductDetailsScreen';
import HubDiscoveryScreen from './src/pages/market/consumer/HubDiscoveryScreen';
import HubDetailsScreen from './src/pages/market/consumer/HubDetailsScreen';
import PaymentRequiredScreen from './src/pages/market/consumer/PaymentRequiredScreen';
import CreateHubScreen from './src/pages/market/consumer/CreateHubScreen';
import FarmerOrdersScreen from './src/pages/profile/farmer/FarmerOrdersScreen';
import ConsumerOrdersScreen from './src/pages/profile/consumer/ConsumerOrdersScreen';

const RootStackNav = createNativeStackNavigator();

function RootStack() {
  return (
    <RootStackNav.Navigator screenOptions={{ headerShown: false }}>
      <RootStackNav.Screen name="MainTabs" component={MainTabs} />
      <RootStackNav.Screen name="EditConsumerProfile" component={EditConsumerProfileScreen} />
      <RootStackNav.Screen name="EditFarmerProfile" component={EditFarmerProfileScreen} />
      <RootStackNav.Screen name="PublicProfile" component={PublicProfileScreen} />
      <RootStackNav.Screen name="AiChatScreen" component={AiChatScreen} />
      <RootStackNav.Screen name="ProductDetails" component={ProductDetailsScreen} />
      <RootStackNav.Screen name="HubDiscovery" component={HubDiscoveryScreen} />
      <RootStackNav.Screen name="HubDetails" component={HubDetailsScreen} />
      <RootStackNav.Screen name="CreateHub" component={CreateHubScreen} />
      <RootStackNav.Screen name="PaymentRequired" component={PaymentRequiredScreen} />
      <RootStackNav.Screen name="FarmerOrders" component={FarmerOrdersScreen} />
      <RootStackNav.Screen name="ConsumerOrders" component={ConsumerOrdersScreen} />
    </RootStackNav.Navigator>
  );
}

function RootNavigator() {
  const { isAuthenticated } = useAuth();
  
  return (
    <NavigationContainer>
      {isAuthenticated ? <RootStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <View style={styles.root} onLayout={onLayoutRootView}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      <SafeAreaProvider>
        <AuthProvider>
          <CartProvider>
            <RootNavigator />
          </CartProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  activeIconWrapper: {
    borderRadius: 12,
    padding: 6,
  },
});
