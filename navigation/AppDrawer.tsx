// navigation/AppDrawer.tsx
import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import HomeScreen from '../screens/HomeScreen';
import NewsScreen from '../screens/NewsScreen';
import AboutScreen from '../screens/AboutScreen';
import ContactScreen from '../screens/ContactScreen';

const Drawer = createDrawerNavigator();

export default function AppDrawer() {
    return (
        <Drawer.Navigator screenOptions={{ headerShown: false, drawerStyle: { width: 240 } }}>
            <Drawer.Screen name="Home" component={HomeScreen} />
            <Drawer.Screen name="News" component={NewsScreen} />
            <Drawer.Screen name="About" component={AboutScreen} />
            <Drawer.Screen name="Contact" component={ContactScreen} />
        </Drawer.Navigator>
    );
}