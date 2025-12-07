import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from "react-native";
import { Button, Card, Icon } from "@rneui/base";

interface MovieDetail {
    movie_id: number;
    title: string;
    vote_average: number;
    url: string; 
    overview: string;
    release_date: string;
}

// Tipe data untuk Jadwal
interface Schedule {
    schedule_id: number;
    start_time: string; // Format: 2025-12-06 14:00:00
    end_time: string;
    ticket_price: number;
    studio_name: string;
    branch_name: string;
    city: string;
}

export default function MovieDetail() {
    const { id } = useLocalSearchParams(); 
    const router = useRouter(); 
    
    const [movie, setMovie] = useState<MovieDetail | null>(null);
    const [schedules, setSchedules] = useState<Schedule[]>([]); // State untuk jadwal
    const [loading, setLoading] = useState(true);

    // Ambil Data Detail Film & Jadwal Sekaligus
    const fetchData = async () => {
        try {
            // 1. Ambil Detail Film
            const respMovie = await fetch(`https://ubaya.cloud/react/160422148/uas/get_movie_detail.php?movie_id=${id}`);
            const jsonMovie = await respMovie.json();

            if (jsonMovie.result === 'success') {
                setMovie(jsonMovie.data);
                
                // 2. Ambil Jadwal Tayang (Hanya kalau film ketemu)
                const respSch = await fetch(`https://ubaya.cloud/react/160422148/uas/get_schedules.php?movie_id=${id}`);
                const jsonSch = await respSch.json();
                
                if (jsonSch.result === 'success') {
                    setSchedules(jsonSch.data);
                }
            } else {
                Alert.alert("Error", "Data film tidak ditemukan");
                router.back();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchData();
    }, [id]);

    // Format Rupiah
    const formatRupiah = (num: number) => "Rp " + Number(num).toLocaleString('id-ID');

    // Ambil Jam saja dari "2025-12-06 14:00:00"
    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    };

    if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#F1C40F" /></View>;
    if (!movie) return null;

    return (
        <ScrollView style={styles.container}>
            <Image source={{ uri: movie.url }} style={styles.poster} resizeMode="cover" />

            <View style={styles.content}>
                <Text style={styles.title}>{movie.title}</Text>
                
                <View style={styles.metaRow}>
                    <Icon name="star" type="font-awesome" color="#F1C40F" size={16} />
                    <Text style={styles.rating}>{movie.vote_average} / 10</Text>
                </View>

                <Card.Divider style={{ marginVertical: 15, backgroundColor: '#333' }} />

                <Text style={styles.sectionTitle}>Sinopsis</Text>
                <Text style={styles.overview}>{movie.overview}</Text>

                {/* --- BAGIAN JADWAL TAYANG --- */}
                <Text style={styles.sectionTitle}>Jadwal Tayang</Text>
                
                {schedules.length === 0 ? (
                    <Text style={styles.emptyText}>Belum ada jadwal tayang untuk film ini.</Text>
                ) : (
                    schedules.map((item, index) => (
                        <TouchableOpacity 
                            key={index}
                            style={styles.scheduleCard}
                            onPress={() => {
                                // Pindah ke halaman Pilih Kursi membawa data jadwal
                                router.push({
                                    pathname: "/seat_selection",
                                    params: { 
                                        schedule_id: item.schedule_id, 
                                        price: item.ticket_price,
                                        branch: item.branch_name,
                                        time: formatTime(item.start_time),
                                        title: movie.title
                                    }
                                });
                            }}
                        >
                            <View>
                                <Text style={styles.branchName}>{item.branch_name}</Text>
                                <Text style={styles.studioName}>{item.studio_name} • {item.city}</Text>
                            </View>
                            <View style={{alignItems: 'flex-end'}}>
                                <Text style={styles.timeText}>{formatTime(item.start_time)}</Text>
                                <Text style={styles.priceText}>{formatRupiah(item.ticket_price)}</Text>
                            </View>
                        </TouchableOpacity>
                    ))
                )}
                
                <View style={{height: 50}} /> 
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
    poster: { width: '100%', height: 450 },
    content: {
        padding: 20, marginTop: -30, backgroundColor: '#121212',
        borderTopLeftRadius: 25, borderTopRightRadius: 25, minHeight: 500,
    },
    title: { fontSize: 26, fontWeight: 'bold', color: 'white', marginBottom: 5 },
    metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
    rating: { fontSize: 16, fontWeight: 'bold', marginLeft: 8, color: '#F1C40F' },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#F1C40F', marginTop: 25 },
    overview: { fontSize: 15, lineHeight: 24, color: '#CCC', textAlign: 'justify' },
    
    // Style Kartu Jadwal
    scheduleCard: {
        backgroundColor: '#1E1E1E',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#333'
    },
    branchName: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    studioName: { color: '#888', fontSize: 12, marginTop: 2 },
    timeText: { color: '#F1C40F', fontSize: 20, fontWeight: 'bold' },
    priceText: { color: '#CCC', fontSize: 12, marginTop: 2 },
    emptyText: { color: '#666', fontStyle: 'italic', marginTop: 10 }
});