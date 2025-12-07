import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image } from "react-native";
import { Card, Icon, Divider, Button } from "@rneui/base";

export default function TicketDetail() {
    const { order_id } = useLocalSearchParams();
    const router = useRouter();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchDetail = async () => {
        try {
            const response = await fetch(`https://ubaya.cloud/react/160422148/uas/get_order_detail.php?order_id=${order_id}`);
            const json = await response.json();
            if (json.result === 'success') {
                setData(json.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDetail(); }, []);

    if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#F1C40F" /></View>;
    if (!data) return <View style={styles.center}><Text style={{color:'white'}}>Data tidak ditemukan</Text></View>;

    const { header, seats, foods } = data;

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.pageTitle}>Bukti Pesanan</Text>
            
            <Card containerStyle={styles.ticketCard}>
                {/* 1. Header E-Ticket */}
                <View style={styles.header}>
                    <Text style={styles.movieTitle}>{header.title || 'Pesanan Makanan'}</Text>
                    <Text style={styles.cinema}>{header.branch_name}</Text>
                    <Text style={styles.date}>{header.order_date}</Text>
                </View>

                <Divider style={{ marginVertical: 15 }} />

                {/* 2. QR Code (Dummy Image) */}
                <View style={styles.qrContainer}>
                    <Image 
                        source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=ORDER-${header.order_id}` }} 
                        style={{ width: 150, height: 150 }} 
                    />
                    <Text style={styles.orderId}>ID: #{header.order_id}</Text>
                    <Text style={styles.scanHint}>Tunjukkan QR ini ke petugas</Text>
                </View>

                <Divider style={{ marginVertical: 15 }} />

                {/* 3. Detail Kursi (Jika Ada) */}
                {seats.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.label}>KURSI</Text>
                        <View style={styles.seatContainer}>
                            {seats.map((seat: string, index: number) => (
                                <View key={index} style={styles.seatBadge}>
                                    <Text style={styles.seatText}>{seat}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* 4. Detail Makanan (Jika Ada) */}
                {foods.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.label}>MAKANAN & MINUMAN</Text>
                        {foods.map((food: any, index: number) => (
                            <View key={index} style={styles.foodRow}>
                                <Text style={styles.foodName}>{food.product_name}</Text>
                                <Text style={styles.foodQty}>x{food.qty}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* 5. Status */}
                <View style={styles.footer}>
                    <Icon name="check-circle" color="#2ECC71" />
                    <Text style={styles.paidStatus}>LUNAS (PAID)</Text>
                </View>
            </Card>

            <Button 
                title="Kembali ke Menu"
                type="outline"
                buttonStyle={{ borderColor: '#F1C40F', marginTop: 20 }}
                titleStyle={{ color: '#F1C40F' }}
                onPress={() => router.replace("/(app)")}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, backgroundColor: '#121212', padding: 20 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
    pageTitle: { color: 'white', fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
    
    ticketCard: {
        borderRadius: 20, padding: 20, backgroundColor: '#FFF',
        borderWidth: 0, elevation: 10
    },
    header: { alignItems: 'center' },
    movieTitle: { fontSize: 22, fontWeight: 'bold', color: '#333', textAlign: 'center' },
    cinema: { fontSize: 16, color: '#666', marginTop: 5 },
    date: { fontSize: 14, color: '#888', marginTop: 2 },

    qrContainer: { alignItems: 'center' },
    orderId: { fontSize: 18, fontWeight: 'bold', marginTop: 10, letterSpacing: 2 },
    scanHint: { color: '#888', fontSize: 12, marginTop: 5 },

    section: { marginBottom: 15 },
    label: { fontSize: 12, color: '#888', fontWeight: 'bold', marginBottom: 8 },
    
    seatContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    seatBadge: { backgroundColor: '#F1C40F', paddingVertical: 5, paddingHorizontal: 15, borderRadius: 5 },
    seatText: { fontWeight: 'bold', color: 'black' },

    foodRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
    foodName: { fontSize: 16, color: '#333' },
    foodQty: { fontSize: 16, fontWeight: 'bold', color: '#333' },

    footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10, gap: 5 },
    paidStatus: { color: '#2ECC71', fontWeight: 'bold', fontSize: 18 }
});