import { Button, Icon } from "@rneui/base";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Text, TextInput, View, StyleSheet, Alert, StatusBar, ScrollView, TouchableOpacity } from "react-native";

export default function Register() {
    const router = useRouter();

    const [userId, setUserId] = useState('');
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!userId || !userName || !password) {
            Alert.alert("Error", "Semua kolom harus diisi!");
            return;
        }

        setLoading(true);
        try {
            const formData = new URLSearchParams();
            formData.append('user_id', userId);
            formData.append('user_name', userName);
            formData.append('user_password', password);

            const response = await fetch('https://ubaya.cloud/react/160422148/uas/register.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData.toString()
            });

            const json = await response.json();

            if (json.result === 'success') {
                Alert.alert("Sukses", json.message, [
                    { text: "Login Sekarang", onPress: () => router.replace("/(auth)/login") }
                ]);
            } else {
                Alert.alert("Gagal", json.message);
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Gagal koneksi ke server");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#121212" />
            
            <View style={styles.headerContainer}>
                <Icon name="person-add" type="material" color="#F1C40F" size={60} />
                <Text style={styles.title}>Buat Akun Baru</Text>
                <Text style={styles.subtitle}>Bergabunglah dengan Bioskop XII</Text>
            </View>

            <View style={styles.formContainer}>
                <Text style={styles.label}>User ID (Unik)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Contoh: budi123"
                    placeholderTextColor="#666"
                    onChangeText={setUserId}
                    value={userId}
                    autoCapitalize="none"
                />

                <Text style={styles.label}>Username (Untuk Login)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Contoh: Budi Santoso"
                    placeholderTextColor="#666"
                    onChangeText={setUserName}
                    value={userName}
                />

                <Text style={styles.label}>Password</Text>
                <TextInput
                    secureTextEntry={true}
                    style={styles.input}
                    placeholder="Rahasia..."
                    placeholderTextColor="#666"
                    onChangeText={setPassword}
                    value={password}
                />

                <Button
                    title={loading ? "Mendaftar..." : "DAFTAR SEKARANG"}
                    disabled={loading}
                    buttonStyle={styles.regButton}
                    titleStyle={{ color: 'black', fontWeight: 'bold' }}
                    onPress={handleRegister}
                />

                <View style={styles.loginLink}>
                    <Text style={{color: '#888'}}>Sudah punya akun? </Text>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Text style={{color: '#F1C40F', fontWeight: 'bold'}}>Login disini</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, backgroundColor: '#121212', padding: 20, justifyContent: 'center' },
    headerContainer: { alignItems: 'center', marginBottom: 30 },
    title: { fontSize: 28, fontWeight: 'bold', color: 'white', marginTop: 10 },
    subtitle: { color: '#888', marginTop: 5 },
    formContainer: { backgroundColor: '#1E1E1E', padding: 20, borderRadius: 15, elevation: 5 },
    label: { color: '#DDD', marginBottom: 5, fontWeight: 'bold', marginTop: 10 },
    input: { backgroundColor: '#2C2C2C', color: 'white', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#333' },
    regButton: { backgroundColor: '#F1C40F', borderRadius: 8, paddingVertical: 12, marginTop: 25 },
    loginLink: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 }
});