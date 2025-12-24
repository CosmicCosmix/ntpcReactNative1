// navigation/AppDrawer.tsx
import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import HomeScreen from '../screens/HomeScreen';
import NewsScreen from '../screens/NewsScreen';
import AboutScreen from '../screens/AboutScreen';
import ContactScreen from '../screens/ContactScreen';
import CameraScreen from '../screens/CameraScreen';
const Drawer = createDrawerNavigator();
export default function AppDrawer() {
    return (
        <Drawer.Navigator screenOptions={{ headerShown: false, drawerStyle: { width: 240 } }}>
            <Drawer.Screen name="Homeo" component={HomeScreen} />
            {/* jo pehle rakhega as Drawer.Screen, wo pehle dikhega jab AppDrawer (which btw is MainApp, or in simple terms,is the wrapper for the app after the AuthScreen) khulega */}
            <Drawer.Screen name="News" component={NewsScreen} />
            <Drawer.Screen name="About" component={AboutScreen} />
            <Drawer.Screen name="Contact" component={ContactScreen} />
            <Drawer.Screen name="Camera" component={CameraScreen} />
        </Drawer.Navigator>
    );
}