// App.tsx, wraps AuthScreen and HomeScreen in a navigator
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AuthScreen from './screens/AuthScreen';
import HomeScreen from './screens/HomeScreen';
import AppDrawer from './navigation/AppDrawer';
export type RootStackParamList = {
  Auth: undefined;
  Home: undefined;
};
const Stack = createNativeStackNavigator<RootStackParamList>();
export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Auth">
          <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Home" component={AppDrawer} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
