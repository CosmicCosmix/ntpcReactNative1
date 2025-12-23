// screens/HomeScreen.tsx
import React from 'react';
import { Text } from 'react-native';
import AppLayout from '../components/AppLayout';
import { RedButton, BlueButton } from '../screens/ContactScreen.tsx';
export default function HomeScreena() {
    return (
        <AppLayout title="Home">
            <Text>This is Home Page.</Text>
            <RedButton label="Home red" />
            <BlueButton />
        </AppLayout>
    );
}