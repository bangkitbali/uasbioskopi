import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from "react-native";
import { Button, Icon } from "@rneui/base";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SeatSelection() {
    const router = useRouter();
    const params = useLocalSearchParams();

    // Ambil data yang dikirim dari halaman detail
    const { schedule_id, price, branch, time, title } = params;

    const [bookedSeats, setBookedSeats] = useState<string[]>([]); // Kursi yg sudah laku
    const [selectedSeats, setSelectedSeats] = useState<string[]>([]); // Kursi yg kita pilih
    const [loading, setLoading] = useState(true);

    // Konfigurasi Denah Kursi (Bisa ditambah sampai G/H atau 1-8)
    const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
    const cols = [1, 2, 3, 4, 5];

    // 1. Ambil Data Kursi yang SUDAH LAKU dari Server
    const fetchBookedSeats = async () => {
        try {
            const response = await fetch(`https://ubaya.cloud/react/160422148/uas/get_booked_seats.php?schedule_id=${schedule_id}`);
            const json = await response.json();

            if (json.result === 'success') {
                setBookedSeats(json.data); // Contoh: ["A1", "B3"]
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookedSeats();
    }, []);

    // 2. Logic Klik Kursi
    const handleSeatPress = (seatId: string) => {
        if (bookedSeats.includes(seatId)) return; // Kalau sudah laku, abaikan

        if (selectedSeats.includes(seatId)) {
            // Kalau sudah dipilih, batalkan (hapus dari array)
            setSelectedSeats(selectedSeats.filter(id => id !== seatId));
        } else {
            // Kalau belum, tambahkan ke array
            setSelectedSeats([...selectedSeats, seatId]);
        }
    };

    // 3. Logic BAYAR (Create Order) - VERSI ANTI GAGAL
    const handleCheckout = async () => {
        if (selectedSeats.length === 0) {
            Alert.alert("Pilih Kursi", "Minimal pilih 1 kursi dulu dong!");
            return;
        }

        try {
            const username = await AsyncStorage.getItem('username');
            const totalAmount = selectedSeats.length * Number(price);

            const orderData = {
                user_id: username,
                schedule_id: schedule_id,
                total_amount: totalAmount,
                seats: selectedSeats,
                ticket_price: price
            };

            console.log("Mengirim Data:", orderData); // Cek data yang dikirim

            const response = await fetch('https://ubaya.cloud/react/160422148/uas/create_order.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            });

            // --- BAGIAN PENTING: BACA SEBAGAI TEXT DULU ---
            const textResponse = await response.text();
            console.log("Respon Mentah Server:", textResponse);

            // Bersihkan spasi kosong di awal/akhir (TRIM)
            const cleanText = textResponse.trim();

            // Baru kita ubah jadi JSON manual
            let json;
            try {
                json = JSON.parse(cleanText);
            } catch (e) {
                console.error("Gagal convert ke JSON:", e);
                Alert.alert("Error Server", "Server mengirim data aneh:\n" + cleanText.substring(0, 50));
                return;
            }

            // Cek status sukses
            if (json.result === 'success') {
                Alert.alert("Berhasil!", "Tiket berhasil dibeli. Cek Riwayat ya!", [
                    { text: "OK", onPress: () => router.replace("/(app)/order_history") }
                ]);
            } else {
                Alert.alert("Gagal", json.message || "Transaksi gagal.");
            }

        } catch (error) {
            Alert.alert("Error Fatal", "Gagal menghubungi server.");
            console.error(error);
        }
    };

    // Fungsi Render Satu Kursi
    const renderSeat = (seatId: string) => {
        const isBooked = bookedSeats.includes(seatId);
        const isSelected = selectedSeats.includes(seatId);

        let backgroundColor = '#333'; // Default (Kosong - Abu Gelap)
        let borderColor = '#555';

        if (isBooked) {
            backgroundColor = '#E74C3C'; // Merah (Sudah Laku)
            borderColor = '#C0392B';
        } else if (isSelected) {
            backgroundColor = '#F1C40F'; // Emas (Kita Pilih)
            borderColor = '#F39C12';
        }

        return (
            <TouchableOpacity
                key={seatId}
                style={[styles.seat, { backgroundColor, borderColor }]}
                onPress={() => handleSeatPress(seatId)}
                disabled={isBooked}
            >
                <Text style={styles.seatText}>{seatId}</Text>
            </TouchableOpacity>
        );
    };

    if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#F1C40F" /></View>;

    return (
        <View style={styles.container}>
            <View style={styles.headerInfo}>
                <Text style={styles.movieTitle}>{title}</Text>
                <Text style={styles.subInfo}>{branch} • {time}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* LAYAR BIOSKOP */}
                <View style={styles.screenContainer}>
                    <View style={styles.screen} />
                    <Text style={styles.screenText}>LAYAR BIOSKOP</Text>
                </View>

                {/* GRID KURSI */}
                <View style={styles.grid}>
                    {rows.map(row => (
                        <View key={row} style={styles.row}>
                            {cols.map(col => renderSeat(`${row}${col}`))}
                        </View>
                    ))}
                </View>

                {/* LEGENDA WARNA */}
                <View style={styles.legendContainer}>
                    <View style={styles.legendItem}>
                        <View style={[styles.seatLegend, { backgroundColor: '#333' }]} />
                        <Text style={styles.legendText}>Kosong</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.seatLegend, { backgroundColor: '#F1C40F' }]} />
                        <Text style={styles.legendText}>Dipilih</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.seatLegend, { backgroundColor: '#E74C3C' }]} />
                        <Text style={styles.legendText}>Terisi</Text>
                    </View>
                </View>
            </ScrollView>

            {/* FOOTER TOTAL BAYAR */}
            <View style={styles.footer}>
                <View>
                    <Text style={styles.totalLabel}>Total Bayar</Text>
                    <Text style={styles.totalPrice}>
                        Rp {(selectedSeats.length * Number(price)).toLocaleString('id-ID')}
                    </Text>
                    <Text style={styles.seatCount}>{selectedSeats.length} Kursi Dipilih</Text>
                </View>
                <Button
                    title="BAYAR SEKARANG"
                    buttonStyle={styles.payButton}
                    titleStyle={{ fontWeight: 'bold', color: 'black' }}
                    onPress={handleCheckout}
                    disabled={selectedSeats.length === 0}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
    headerInfo: { padding: 20, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#333' },
    movieTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
    subInfo: { color: '#888', marginTop: 5 },

    scrollContainer: { padding: 20, alignItems: 'center' },

    // Style Layar
    screenContainer: { alignItems: 'center', marginBottom: 30, width: '100%' },
    screen: {
        width: '80%', height: 10, backgroundColor: '#EEE',
        borderRadius: 10, shadowColor: '#FFF', shadowOpacity: 0.8, elevation: 10
    },
    screenText: { color: '#666', marginTop: 10, fontSize: 12, letterSpacing: 2 },

    // Style Grid Kursi
    grid: { marginVertical: 10 },
    row: { flexDirection: 'row', marginBottom: 10 },
    seat: {
        width: 40, height: 40, margin: 5, borderRadius: 8,
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 1,
    },
    seatText: { color: 'white', fontSize: 10, fontWeight: 'bold' },

    // Legend
    legendContainer: { flexDirection: 'row', marginTop: 20, justifyContent: 'space-between', width: '80%' },
    legendItem: { flexDirection: 'row', alignItems: 'center' },
    seatLegend: { width: 20, height: 20, borderRadius: 4, marginRight: 8 },
    legendText: { color: '#BBB', fontSize: 12 },

    // Footer
    footer: {
        padding: 20, backgroundColor: '#1E1E1E',
        borderTopWidth: 1, borderTopColor: '#333',
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
    },
    totalLabel: { color: '#888', fontSize: 12 },
    totalPrice: { color: '#F1C40F', fontSize: 20, fontWeight: 'bold' },
    seatCount: { color: '#666', fontSize: 12 },
    payButton: { backgroundColor: '#F1C40F', borderRadius: 10, paddingHorizontal: 20, height: 50 },
});