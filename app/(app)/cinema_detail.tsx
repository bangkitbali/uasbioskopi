import { useLocalSearchParams, useRouter, Href } from "expo-router";
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { Icon } from "@rneui/base";

export default function CinemaDetail() {
    const { branch_id, branch_name } = useLocalSearchParams();
    const router = useRouter();
    const [movies, setMovies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`https://ubaya.cloud/react/160422148/uas/get_movies_by_cinema.php?branch_id=${branch_id}`)
            .then(res => res.json())
            .then(json => {
                if (json.result === 'success') setMovies(json.data);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const renderMovie = ({ item }: { item: any }) => (
        <TouchableOpacity 
            style={styles.movieCard}
            // Klik Kartu -> Pindah ke Detail Film
            onPress={() => router.push(`/movie_detail/${item.movie_id}` as Href)}
        >
            <Image source={{ uri: item.url }} style={styles.poster} resizeMode="cover" />
            
            <View style={styles.info}>
                <Text style={styles.title}>{item.title}</Text>
                
                <View style={styles.ratingRow}>
                    <Icon name="star" size={14} color="#FFD700" />
                    <Text style={styles.rating}>{item.vote_average}</Text>
                </View>

                {/* PERBAIKAN: Tombol Beli Tiket sekarang punya fungsi onPress */}
                <TouchableOpacity 
                    style={styles.buyBtn}
                    onPress={() => router.push(`/movie_detail/${item.movie_id}` as Href)}
                >
                    <Text style={styles.buyText}>BELI TIKET</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.cinemaName}>{branch_name}</Text>
                <Text style={styles.subTitle}>Daftar Film Tayang</Text>
            </View>

            {loading ? (
                <View style={styles.center}><ActivityIndicator size="large" color="#F1C40F" /></View>
            ) : (
                <FlatList 
                    data={movies} 
                    keyExtractor={(item) => item.movie_id.toString()} 
                    renderItem={renderMovie} 
                    contentContainerStyle={{padding: 20}}
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <Icon name="sentiment-dissatisfied" color="#666" size={50} />
                            <Text style={{color:'#666', marginTop:10}}>Tidak ada film tayang di sini.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { padding: 20, backgroundColor: '#1E1E1E', borderBottomWidth: 1, borderBottomColor: '#333' },
    cinemaName: { color: '#F1C40F', fontSize: 22, fontWeight: 'bold' },
    subTitle: { color: '#888', marginTop: 5 },
    
    movieCard: { 
        flexDirection: 'row', backgroundColor: '#1E1E1E', marginBottom: 15, 
        borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#333'
    },
    poster: { width: 110, height: 160 },
    info: { flex: 1, padding: 15, justifyContent: 'center' },
    title: { color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
    ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    rating: { color: '#FFD700', marginLeft: 5, fontWeight: 'bold' },
    
    buyBtn: { 
        backgroundColor: '#F1C40F', paddingVertical: 10, borderRadius: 8, alignItems: 'center' 
    },
    buyText: { color: 'black', fontWeight: 'bold' }
});