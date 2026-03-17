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

import HomeScreen from './src/pages/HomeScreen';
import MarketScreen from './src/pages/MarketScreen';
import SocialScreen from './src/pages/SocialScreen';
import InsightsScreen from './src/pages/InsightsScreen';
import ProfileScreen from './src/pages/ProfileScreen';

import LoginScreen from './src/pages/auth/LoginScreen';
import SignupScreen from './src/pages/auth/SignupScreen';
import OtpLoginScreen from './src/pages/auth/OtpLoginScreen';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { colors, fonts } from './src/common/theme';

SplashScreen.preventAutoHideAsync();

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const tabIcons = {
  Home: { active: 'home', inactive: 'home-outline' },
  Market: { active: 'basket', inactive: 'basket-outline' },
  Social: { active: 'people', inactive: 'people-outline' },
  Insights: { active: 'bar-chart', inactive: 'bar-chart-outline' },
  Profile: { active: 'person', inactive: 'person-outline' },
};

function MainTabs() {
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          const iconName = focused ? tabIcons[route.name].active : tabIcons[route.name].inactive;
          return (
            <View style={focused ? styles.activeIconWrapper : null}>
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
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Market" component={MarketScreen} />
      <Tab.Screen name="Social" component={SocialScreen} />
      <Tab.Screen name="Insights" component={InsightsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
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

import EditProfileScreen from './src/pages/EditProfileScreen';
import PublicProfileScreen from './src/pages/PublicProfileScreen';

const RootStackNav = createNativeStackNavigator();

function RootStack() {
  return (
    <RootStackNav.Navigator screenOptions={{ headerShown: false }}>
      <RootStackNav.Screen name="MainTabs" component={MainTabs} />
      <RootStackNav.Screen name="EditProfile" component={EditProfileScreen} />
      <RootStackNav.Screen name="PublicProfile" component={PublicProfileScreen} />
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
          <RootNavigator />
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
    backgroundColor: colors.primary100,
    borderRadius: 12,
    padding: 6,
  },
});
