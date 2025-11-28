import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useAppTheme } from '../hooks/useAppTheme';
import { Ionicons } from '@expo/vector-icons';


import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import AddDataScreen from '../screens/AddDataScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ChatbotScreen from '../screens/ChatbotScreen';
import ReportScreen from '../screens/ReportScreen';

export type RootStackParamList = {
    Login: undefined;
    Main: undefined;
    Report: undefined;
};

export type MainTabParamList = {
    Home: undefined;
    AddData: undefined;
    Chatbot: undefined;
    Profile: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainNavigator = () => {
    const theme = useAppTheme();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerStyle: { backgroundColor: theme.background },
                headerTintColor: theme.text,
                tabBarStyle: {
                    backgroundColor: theme.card,
                    borderTopColor: 'transparent',
                    elevation: 5,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 5,
                },
                tabBarActiveTintColor: theme.primary,
                tabBarInactiveTintColor: theme.secondary,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: keyof typeof Ionicons.glyphMap = 'home';

                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'AddData') {
                        iconName = focused ? 'add-circle' : 'add-circle-outline';
                    } else if (route.name === 'Chatbot') {
                        iconName = focused ? 'chatbubble' : 'chatbubble-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Dashboard' }} />
            <Tab.Screen name="AddData" component={AddDataScreen} options={{ title: 'Log Health' }} />
            <Tab.Screen name="Chatbot" component={ChatbotScreen} options={{ title: 'AI Assistant' }} />
            <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Settings' }} />
        </Tab.Navigator>
    );
};

export const AppNavigator = () => {
    const theme = useAppTheme();
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerStyle: { backgroundColor: theme.background },
                    headerTintColor: theme.text,
                    cardStyle: { backgroundColor: theme.background },
                }}
            >
                {!isAuthenticated ? (
                    <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
                ) : (
                    <>
                        <Stack.Screen name="Main" component={MainNavigator} options={{ headerShown: false }} />
                        <Stack.Screen name="Report" component={ReportScreen} options={{ title: 'Health Report' }} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};
