import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { Button, Icon, Card } from "@rneui/base";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function TopUp() {
    const router = useRouter();
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [method, setMethod] = useState('Transfer Bank'); // Default method

    // Pilihan Nominal Cepat
    const quickAmounts = [50000, 100000, 200000, 500000];

    const handleTopUp = async () => {
        if (!amount || Number(amount) < 10000) {
            Alert.alert("Error", "Minimal top up Rp 10.000");
            return;
        }

        setLoading(true);
        try {
            const username = await AsyncStorage.getItem('username');

            // Siapkan Data Form (x-www-form-urlencoded)
            const formData = new URLSearchParams();
            formData.append('user_id', username || '');
            formData.append('amount', amount);
            formData.append('method', method);

            const response = await fetch('https://ubaya.cloud/react/160422148/uas/topup.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData.toString()
            });

            const json = await response.json();

            if (json.result === 'success') {
                Alert.alert("Berhasil!", `Saldo Rp ${Number(amount).toLocaleString('id-ID')} berhasil ditambahkan.`, [
                    { text: "OK", onPress: () => router.back() }
                ]);
            } else {
                Alert.alert("Gagal", json.message || "Terjadi kesalahan.");
            }

        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Gagal menghubungi server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.headerIcon}>
                    <Icon name="account-balance-wallet" size={80} color="#F1C40F" />
                    <Text style={styles.title}>Isi Saldo Bioskop</Text>
                </View>

                {/* Input Nominal */}
                <Text style={styles.label}>Nominal Top Up</Text>
                <View style={styles.inputContainer}>
                    <Text style={styles.currency}>Rp</Text>
                    <TextInput 
                        style={styles.input}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor="#555"
                        value={amount}
                        onChangeText={setAmount}
                    />
                </View>

                {/* Pilihan Cepat */}
                <View style={styles.quickContainer}>
                    {quickAmounts.map((val) => (
                        <TouchableOpacity 
                            key={val} 
                            style={styles.quickChip} 
                            onPress={() => setAmount(val.toString())}
                        >
                            <Text style={styles.quickText}>{val / 1000}k</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Metode Pembayaran */}
                <Text style={[styles.label, {marginTop: 20}]}>Metode Pembayaran</Text>
                <View style={styles.methodContainer}>
                    {['Transfer Bank', 'E-Wallet', 'Credit Card'].map((m) => (
                        <TouchableOpacity 
                            key={m}
                            style={[styles.methodChip, method === m && styles.methodActive]}
                            onPress={() => setMethod(m)}
                        >
                            <Text style={[styles.methodText, method === m && styles.methodTextActive]}>{m}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Button 
                    title={loading ? "Memproses..." : "TOP UP SEKARANG"}
                    disabled={loading}
                    buttonStyle={styles.submitButton}
                    titleStyle={{ color: 'black', fontWeight: 'bold' }}
                    onPress={handleTopUp}
                />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    scrollContent: { padding: 20 },
    headerIcon: { alignItems: 'center', marginBottom: 30, marginTop: 20 },
    title: { color: 'white', fontSize: 22, fontWeight: 'bold', marginTop: 10 },
    
    label: { color: '#888', marginBottom: 10, fontSize: 16 },
    inputContainer: { 
        flexDirection: 'row', alignItems: 'center', 
        backgroundColor: '#1E1E1E', borderRadius: 10, paddingHorizontal: 15,
        borderWidth: 1, borderColor: '#333'
    },
    currency: { color: '#F1C40F', fontSize: 24, fontWeight: 'bold', marginRight: 10 },
    input: { flex: 1, color: 'white', fontSize: 24, fontWeight: 'bold', height: 60 },
    
    quickContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
    quickChip: { 
        backgroundColor: '#333', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 20,
        borderWidth: 1, borderColor: '#444'
    },
    quickText: { color: '#DDD', fontWeight: 'bold' },

    methodContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    methodChip: { 
        paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, 
        borderWidth: 1, borderColor: '#444', backgroundColor: '#1E1E1E'
    },
    methodActive: { backgroundColor: '#F1C40F', borderColor: '#F1C40F' },
    methodText: { color: '#BBB' },
    methodTextActive: { color: 'black', fontWeight: 'bold' },

    submitButton: { 
        backgroundColor: '#F1C40F', borderRadius: 10, height: 55, marginTop: 40 
    }
});