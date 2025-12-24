// components/AppLayout.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
export default function AppLayout({ title, children, }: { title: string; children: React.ReactNode; }) {
    const navigation = useNavigation<any>();
    return (
        <SafeAreaView style={styles.container} edges={['top', 'right', 'left']}>
            {/* Top Bar */}
            < View style={styles.topBar} >
                <TouchableOpacity onPress={() => navigation.openDrawer()}>
                    <Text style={styles.menu}>☰</Text>
                </TouchableOpacity>
                <Text style={styles.title}>{title}</Text>
            </View >
            {/* Content */}
            < View style={styles.content} > {children}</View >
            {/* Bottom Bar */}
            < View style={styles.bottomBar} >
                <TouchableOpacity onPress={() => navigation.navigate('Homeo')}><Text >Home</Text></TouchableOpacity> // .navigate('jo bhi naam') ye naam, jo idhar Homeo kar diya; ye naam AppDrawer me defined hain
                <TouchableOpacity onPress={() => navigation.navigate('Camera')}><Text >Camera</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('About')}><Text >About</Text></TouchableOpacity>
            </View >
        </SafeAreaView >
    );
}
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F6F8' },
    topBar: {
        height: 52,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        backgroundColor: '#FFFFFF',
        elevation: 4,
    },
    menu: { fontSize: 22, marginRight: 16 },
    title: { fontSize: 18, fontWeight: '600' },
    content: { flex: 1, padding: 16 },
    bottomBar: {
        height: 48,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderColor: '#DDD',
    },
});