import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import AppLayout from '../components/AppLayout';
export default function ContactScreen() {
    return (
        <AppLayout title="Contact">
            <Text>Contact page content</Text>
            <RedButton label="Contact red" />
        </AppLayout>
    );
}
export function RedButton({ label }: { label: string }) {
    return (
        <TouchableOpacity style={[styles.button, styles.RedButtono]}>
            // Agar ese Lable likha he to, uss "label" ko define bhi karna padega as a string.
            // "Label" ki jagah "buttonstring" ya aut koi variable text bhi use kar sakte hain.
            <Text>{label}</Text>
        </TouchableOpacity>
    );
}
export function BlueButton() {
    return (
        <TouchableOpacity style={[styles.button, styles.BlueButtono]}>
            <Text>Hello, blue button</Text>
        </TouchableOpacity>
    );
}
export function GreenButton() {
    return (
        <TouchableOpacity style={[styles.button, styles.GreenButtono]}>
            <Text>Hello, green button</Text>
        </TouchableOpacity>
    );
}
const styles = StyleSheet.create({
    button: {
        padding: 10,
        borderRadius: 5,
        borderWidth: 2,
        borderColor: "pink",
    },
    RedButtono: {
        backgroundColor: "red",
    },
    BlueButtono: {
        backgroundColor: "blue",
    },
    GreenButtono: {
        backgroundColor: "green",
    },
});