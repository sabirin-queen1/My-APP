import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HouseholdDashboard from '../screens/HouseholdDashboard';
import SearchWorkerScreen from '../screens/SearchWorkerScreen';
import WorkerProfileScreen from '../screens/WorkerProfileScreen';
import ContractScreen from '../screens/ContractScreen';
import ReviewScreen from '../screens/ReviewScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import WorkerDashboard from '../screens/WorkerDashboard';
import WorkerJobsScreen from '../screens/WorkerJobsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const COLORS = { primary: '#6C4EF2', gray: '#9ca3af', bg: '#f8f7fe' };

function HouseholdTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray,
        tabBarStyle: { backgroundColor: 'white', borderTopColor: '#e5e7eb', height: 64, paddingBottom: 8 },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = { Home: 'home', Search: 'search', Contracts: 'document-text', Reviews: 'star', Profile: 'person' };
          return <Ionicons name={focused ? icons[route.name] : `${icons[route.name]}-outline`} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HouseholdDashboard} />
      <Tab.Screen name="Search" component={SearchWorkerScreen} />
      <Tab.Screen name="Contracts" component={ContractScreen} />
      <Tab.Screen name="Reviews" component={ReviewScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function WorkerTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray,
        tabBarStyle: { backgroundColor: 'white', borderTopColor: '#e5e7eb', height: 64, paddingBottom: 8 },
        tabBarIcon: ({ focused, color }) => {
          const icons = { Home: 'home', Jobs: 'briefcase', Contracts: 'document-text', Profile: 'person' };
          return <Ionicons name={focused ? icons[route.name] : `${icons[route.name]}-outline`} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={WorkerDashboard} />
      <Tab.Screen name="Jobs" component={WorkerJobsScreen} />
      <Tab.Screen name="Contracts" component={ContractScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={role === 'worker' ? WorkerTabs : HouseholdTabs} />
            <Stack.Screen name="WorkerProfile" component={WorkerProfileScreen} />
            <Stack.Screen name="ContractDetail" component={ContractScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="ReviewWorker" component={ReviewScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
