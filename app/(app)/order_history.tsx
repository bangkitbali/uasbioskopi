import AsyncStorage from "@react-native-async-storage/async-storage";
import { Icon } from "@rneui/base";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function OrderHistory() {

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'ticket' | 'fnb' | 'saldo'>('ticket');
    const router = useRouter();

    interface Order {
        order_id: number;
        order_date: string;
        total_amount: number;
        status: string;
        movie_title: string;
        branch_name: string;
        start_time: string;
    }
    interface SaldoHistory {
        id: number;
        tanggal: string;
        jenis: 'TOPUP' | 'DEBIT';
        jumlah: number;
        keterangan: string;
    }
    type HistoryItem = Order | SaldoHistory;
    const [saldoHistory, setSaldoHistory] = useState<SaldoHistory[]>([]);


    const fetchSaldoHistory = async () => {
        const userId = await AsyncStorage.getItem('user_id');
        if (!userId) return;

        const res = await fetch(
            `https://ubaya.cloud/react/160422148/uas/get_saldo_history.php?user_id=${userId}`
        );

        const json = await res.json();
        if (json.result === 'success') {
            setSaldoHistory(json.data);
        }
    };


    const fetchHistory = async () => {
        try {
            const username = await AsyncStorage.getItem('username');

            if (!username) {
                Alert.alert("Error", "User tidak ditemukan, silakan login ulang.");
                return;
            }

            const response = await fetch(`https://ubaya.cloud/react/160422148/uas/get_order_history.php?user_id=${username}`);
            const json = await response.json();

            if (json.result === 'success') {
                setOrders(json.data);
            } else {
                setOrders([]);
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Gagal mengambil data riwayat");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
        fetchSaldoHistory();
    }, []);


    // Filter Data Berdasarkan Tab
    // Logika: Kalau judulnya "Pesanan F&B (Café)" berarti masuk tab FnB, selain itu masuk Tiket.
    const filteredOrders = orders.filter(item => {
        if (activeTab === 'ticket') {
            return item.movie_title !== "Pesanan F&B (Café)";
        } else {
            return item.movie_title === "Pesanan F&B (Café)";
        }
    });

    const displayedData = (): HistoryItem[] => {
        if (activeTab === 'saldo') {
            return saldoHistory;
        }

        if (activeTab === 'ticket') {
            return orders.filter(o => o.movie_title !== "Pesanan F&B (Café)");
        }

        if (activeTab === 'fnb') {
            return orders.filter(o => o.movie_title === "Pesanan F&B (Café)");
        }

        return [];
    };

    const formatRupiah = (num: number) => {
        return "Rp " + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    const getStatusColor = (status: string) => {
        if (status.toLowerCase() === 'paid' || status.toLowerCase() === 'success') return '#2ECC71';
        if (status.toLowerCase() === 'pending') return '#F1C40F';
        return '#E74C3C';
    };

    const renderItem = ({ item }: { item: Order }) => (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push({
                pathname: "/ticket_detail",
                params: { order_id: item.order_id }
            })}
        >
            <View style={styles.card}>
                <View style={styles.headerRow}>
                    <View style={{ flex: 1 }}>
                        {/* Judul Film / Makanan */}
                        <Text style={styles.movieTitle}>{item.movie_title}</Text>
                        <Text style={styles.orderId}>Order ID: #{item.order_id}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                        <Text style={styles.statusText}>{item.status}</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                {/* Detail Lokasi & Waktu (Beda Icon kalau F&B) */}
                <View style={styles.detailRow}>
                    <Icon name={activeTab === 'ticket' ? "movie" : "fastfood"} type="material" color="#888" size={16} />
                    <Text style={styles.detailText}>{item.branch_name}</Text>
                </View>

                {activeTab === 'ticket' && (
                    <View style={styles.detailRow}>
                        <Icon name="access-time" type="material" color="#888" size={16} />
                        <Text style={styles.detailText}>{item.start_time} WIB</Text>
                    </View>
                )}

                <View style={styles.detailRow}>
                    <Icon name="calendar-today" type="material" color="#888" size={16} />
                    <Text style={styles.detailText}>{item.order_date}</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.footerRow}>
                    <Text style={styles.totalLabel}>Total Bayar</Text>
                    <Text style={styles.totalAmount}>{formatRupiah(item.total_amount)}</Text>
                </View>

                <View style={{ marginTop: 10, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#333', paddingTop: 10 }}>
                    <Text style={{ color: '#F1C40F', fontSize: 12, fontWeight: 'bold' }}>
                        Ketuk untuk lihat E-Ticket & QR Code
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderSaldoItem = ({ item }: { item: SaldoHistory }) => {
        const isTopup = item.jenis === 'TOPUP';

        return (
            <View style={styles.card}>
                <View style={styles.headerRow}>
                    <View style={{ flex: 1 }}>
                        {/* JUDUL */}
                        <Text style={styles.movieTitle}>
                            {isTopup ? 'Top Up Saldo' : 'Pembelian'}
                        </Text>

                        {/* DETAIL KECIL */}
                        <Text style={styles.orderId}>
                            {isTopup
                                ? `Metode: ${item.keterangan}`
                                : item.keterangan}
                        </Text>

                        <Text style={[styles.orderId, { marginTop: 2 }]}>
                            {item.tanggal}
                        </Text>
                    </View>

                    {/* NOMINAL */}
                    <Text
                        style={{
                            color: isTopup ? '#2ECC71' : '#E74C3C',
                            fontWeight: 'bold',
                            fontSize: 16
                        }}
                    >
                        {isTopup ? '+' : '-'} Rp {item.jumlah.toLocaleString('id-ID')}
                    </Text>
                </View>
            </View>
        );
    };



    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#F1C40F" />
                <Text style={{ color: 'white', marginTop: 10 }}>Memuat Riwayat...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>

            {/* --- TAB MENU --- */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'saldo' && styles.activeTab]}
                    onPress={() => setActiveTab('saldo')}
                >
                    <Icon
                        name="account-balance-wallet"
                        color={activeTab === 'saldo' ? '#F1C40F' : '#888'}
                        size={20}
                    />
                    <Text style={[styles.tabText, activeTab === 'saldo' && styles.activeTabText]}>
                        SALDO
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'ticket' && styles.activeTab]}
                    onPress={() => setActiveTab('ticket')}
                >
                    <Icon name="movie" color={activeTab === 'ticket' ? '#F1C40F' : '#888'} size={20} />
                    <Text style={[styles.tabText, activeTab === 'ticket' && styles.activeTabText]}>TIKET FILM</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'fnb' && styles.activeTab]}
                    onPress={() => setActiveTab('fnb')}
                >
                    <Icon name="fastfood" color={activeTab === 'fnb' ? '#F1C40F' : '#888'} size={20} />
                    <Text style={[styles.tabText, activeTab === 'fnb' && styles.activeTabText]}>MAKANAN (F&B)</Text>
                </TouchableOpacity>
            </View>

            {/* List Data */}
            <FlatList<HistoryItem>
                data={displayedData()}
                keyExtractor={(item: any, index) =>
                    item.order_id ? `order-${item.order_id}` : `saldo-${item.id}-${index}`
                }
                renderItem={({ item }) =>
                    activeTab === 'saldo'
                        ? renderSaldoItem({ item: item as SaldoHistory })
                        : renderItem({ item: item as Order })
                }
                contentContainerStyle={{ padding: 15 }}
            />

        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
    centerEmpty: { alignItems: 'center', marginTop: 50 },

    // TAB STYLE
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#1E1E1E',
        elevation: 5,
    },
    tabButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        borderBottomWidth: 3,
        borderBottomColor: 'transparent',
        gap: 8
    },
    activeTab: {
        borderBottomColor: '#F1C40F', // Garis bawah Emas
    },
    tabText: {
        color: '#888',
        fontWeight: 'bold',
        fontSize: 14,
    },
    activeTabText: {
        color: '#F1C40F', // Teks jadi Emas
    },

    // Card Style
    card: {
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#333',
        elevation: 3,
    },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
    movieTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 2 },
    orderId: { color: '#666', fontSize: 12 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 5 },
    statusText: { color: 'white', fontWeight: 'bold', fontSize: 10, textTransform: 'uppercase' },
    divider: { height: 1, backgroundColor: '#333', marginVertical: 10 },
    detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5, gap: 8 },
    detailText: { color: '#BBB', fontSize: 14 },
    footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 },
    totalLabel: { color: '#888', fontSize: 14 },
    totalAmount: { color: '#F1C40F', fontSize: 18, fontWeight: 'bold' },
    emptyText: { color: '#666', fontSize: 16, marginTop: 10 }
});