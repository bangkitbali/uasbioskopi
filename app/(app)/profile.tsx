import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Button, Icon } from "@rneui/base";
import { useAuth } from "../../authContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function Profile() {
    const { logout } = useAuth();
    const router = useRouter();
    const [username, setUsername] = useState('');

    useEffect(() => {
        AsyncStorage.getItem('username').then(u => setUsername(u || 'User'));
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.avatar}>
                    <Icon name="person" size={60} color="#FFF" />
                </View>
                <Text style={styles.name}>{username}</Text>
                <Text style={styles.membership}>M.Tix Member</Text>
            </View>

            <View style={styles.menuContainer}>
                <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/order_history')}>
                    <Icon name="history" color="#F1C40F" />
                    <Text style={styles.menuText}>Riwayat Transaksi</Text>
                    <Icon name="chevron-right" color="#666" />
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/topup')}>
                    <Icon name="account-balance-wallet" color="#2ECC71" />
                    <Text style={styles.menuText}>Top Up Saldo</Text>
                    <Icon name="chevron-right" color="#666" />
                </TouchableOpacity>
            </View>

            <Button 
                title="LOGOUT" 
                buttonStyle={styles.logoutBtn}
                titleStyle={{ fontWeight: 'bold' }}
                onPress={logout}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212', padding: 20 },
    header: { alignItems: 'center', marginBottom: 40, marginTop: 20 },
    avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
    name: { color: 'white', fontSize: 24, fontWeight: 'bold' },
    membership: { color: '#F1C40F', fontSize: 16, marginTop: 5 },
    menuContainer: { backgroundColor: '#1E1E1E', borderRadius: 15, padding: 10 },
    menuItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#333', justifyContent: 'space-between' },
    menuText: { color: 'white', fontSize: 16, flex: 1, marginLeft: 15 },
    logoutBtn: { backgroundColor: '#E74C3C', borderRadius: 10, paddingVertical: 15, marginTop: 30 }
});