import { useAuth } from "../../authContext";
import { Redirect, Stack } from "expo-router";
import React from "react";
import { Text, View, ActivityIndicator } from "react-native";

export default function AppLayout() {
    const { isLoggedIn, isReady } = useAuth();

    // 1. Tampilan Loading yang lebih rapi
    if (!isReady) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={{ marginTop: 10 }}>Memuat Aplikasi...</Text>
            </View>
        );
    }

    // 2. Cek Login
    if (!isLoggedIn) return <Redirect href="/(auth)/login" />;

    return (
        // Di dalam <Stack screenOptions={{ ... }}> ganti jadi:
        <Stack screenOptions={{
            headerStyle: { backgroundColor: '#1E1E1E' }, // Header Gelap
            headerTintColor: '#F1C40F', // Tulisan/Panah Back warna Emas
            headerTitleStyle: { fontWeight: 'bold' }
        }}>

            {/* --- 1. BERANDA (Home) --- */}
            {/* headerShown: false agar Header biru "Bioskop XII" buatanmu di index.tsx yang muncul */}
            <Stack.Screen name="index" options={{ headerShown: false, title: 'Home' }} />

            {/* --- 2. DAFTAR FILM (Yang baru kita buat) --- */}
            <Stack.Screen name="movie_list" options={{ title: 'Sedang Tayang' }} />

            {/* --- 3. DETAIL FILM (Penting!) --- */}
            {/* Penulisannya begini karena nanti kita butuh ID filmnya */}
            <Stack.Screen name="movie_detail/[id]" options={{ title: 'Detail Film' }} />

            {/* --- 4. RIWAYAT TIKET --- */}
            <Stack.Screen name="order_history" options={{ title: 'Riwayat Pesanan' }} />

            {/* --- 5. PILIH KURSI (Persiapan masa depan) --- */}
            {/* Nanti dinyalakan saat kita masuk fitur booking */}
            <Stack.Screen name="seat_selection" options={{ title: 'Pilih Kursi' }} />

            <Stack.Screen name="topup" options={{ title: 'Isi Saldo' }} />
            <Stack.Screen name="locations" options={{ title: 'Lokasi Bioskopi' }} />
            <Stack.Screen name="cafe" options={{ title: 'Bioskopi Café' }} />
            <Stack.Screen name="ticket_detail" options={{ title: 'E-Ticket' }} />
            <Stack.Screen name="cinema_detail" options={{ title: 'Jadwal Bioskop' }} />

        </Stack>
    );
}