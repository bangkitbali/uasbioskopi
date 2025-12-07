import { Button, Icon } from "@rneui/base";
import { useRouter } from "expo-router";
import React, { useState } from "react";
// 1. TAMBAHKAN TouchableOpacity DI SINI
import { Text, TextInput, View, StyleSheet, Alert, StatusBar, TouchableOpacity } from "react-native"; 
import { useAuth } from "../../authContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Login() {
    const { login } = useAuth();
    const router = useRouter();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
       // ... (kode login biarkan saja)
        const options = {
            method: 'POST',
            headers: new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }),
            body: "user_name=" + username + "&user_password=" + password
        };
        try {
            const response = await fetch('https://ubaya.cloud/react/160422148/uas/login.php', options);
            const json = await response.json();
            if (json.result === 'success') {
                await AsyncStorage.setItem('username', username);
                login(username);
                router.replace("/(app)");
            } else {
                Alert.alert("Gagal", json.message || 'Username atau password salah');
            }
        } catch (error) {
            Alert.alert("Error", "Gagal terhubung ke server");
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#121212" />
            
            <View style={styles.headerContainer}>
                <Icon name="movie" type="material" color="#F1C40F" size={60} />
                <Text style={styles.appName}>BIOSKOP</Text>
                <Text style={styles.subtitle}>Aplikasi Tiket Nonton Paling Kece</Text>
            </View>

            <View style={styles.formContainer}>
                <Text style={styles.label}>Username</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Masukkan username..."
                    placeholderTextColor="#666"
                    onChangeText={setUsername}
                    value={username}
                    autoCapitalize="none"
                />

                <Text style={styles.label}>Password</Text>
                <TextInput
                    secureTextEntry={true}
                    style={styles.input}
                    placeholder="Masukkan password..."
                    placeholderTextColor="#666"
                    onChangeText={setPassword}
                    value={password}
                />

                <Button
                    title="MASUK SEKARANG"
                    buttonStyle={styles.loginButton}
                    titleStyle={styles.loginButtonText}
                    onPress={handleLogin}
                />

                {/* 2. TAMBAHKAN BAGIAN INI DI BAWAH TOMBOL MASUK */}
                <View style={styles.registerContainer}>
                    <Text style={styles.registerText}>Belum punya akun? </Text>
                    <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
                        <Text style={styles.registerLink}>Daftar disini</Text>
                    </TouchableOpacity>
                </View>

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    // ... (style lama biarkan sama)
    container: {
        flex: 1,
        backgroundColor: '#121212', 
        justifyContent: 'center',
        padding: 20,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    appName: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#F1C40F', 
        marginTop: 10,
        letterSpacing: 2,
    },
    subtitle: {
        color: '#888',
        fontSize: 14,
        marginTop: 5,
    },
    formContainer: {
        backgroundColor: '#1E1E1E', 
        padding: 20,
        borderRadius: 15,
        elevation: 5,
    },
    label: {
        color: '#DDD',
        marginBottom: 5,
        fontWeight: 'bold',
    },
    input: {
        backgroundColor: '#2C2C2C',
        color: 'white',
        borderRadius: 8,
        padding: 12,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#333',
    },
    loginButton: {
        backgroundColor: '#F1C40F', 
        borderRadius: 8,
        paddingVertical: 12,
        marginTop: 10,
    },
    loginButtonText: {
        color: '#121212', 
        fontWeight: 'bold',
        fontSize: 16,
    },
    // 3. TAMBAHKAN STYLE BARU INI DI BAWAH
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    registerText: {
        color: '#888',
    },
    registerLink: {
        color: '#F1C40F', // Warna Emas
        fontWeight: 'bold',
    }
});