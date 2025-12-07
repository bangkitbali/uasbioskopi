import { Icon } from "@rneui/base";
import { useRouter, Href } from "expo-router";
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Image, TouchableOpacity, Alert } from "react-native";

interface Movie {
    movie_id: number;
    title: string;
    vote_average: number;
    url: string;
    overview: string;
}

export default function MovieList() {
    const router = useRouter();
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchMovies = async () => {
        try {
            const response = await fetch('https://ubaya.cloud/react/160422148/uas/get_movies.php');
            const json = await response.json();
            if (json.result === 'success') {
                setMovies(json.data);
            }
        } catch (error) { Alert.alert("Error", "Koneksi Error"); } 
        finally { setLoading(false); }
    };

    useEffect(() => { fetchMovies(); }, []);

    if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#F1C40F" /></View>;

    const renderItem = ({ item }: { item: Movie }) => (
        <TouchableOpacity 
            onPress={() => router.push(`/movie_detail/${item.movie_id}` as Href)}
            style={styles.itemContainer}
        >
            <View style={styles.card}>
                <Image source={{ uri: item.url }} style={styles.poster} resizeMode="cover" />
                
                {/* Rating Badge (Floating) */}
                <View style={styles.ratingBadge}>
                    <Icon name="star" type="font-awesome" color="#FFD700" size={10} />
                    <Text style={styles.ratingText}>{item.vote_average}</Text>
                </View>

                <View style={styles.textInfo}>
                    <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={movies}
                keyExtractor={(item) => item.movie_id.toString()}
                renderItem={renderItem}
                numColumns={2}
                contentContainerStyle={{ padding: 10 }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212', // Background Hitam
    },
    center: {
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: '#121212'
    },
    itemContainer: {
        flex: 1,
        margin: 8,
    },
    card: {
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 3,
        borderWidth: 1,
        borderColor: '#333',
    },
    poster: {
        width: '100%',
        height: 220,
    },
    ratingBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.7)',
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    ratingText: {
        color: '#FFD700',
        fontWeight: 'bold',
        fontSize: 12,
        marginLeft: 4,
    },
    textInfo: {
        padding: 10,
    },
    title: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
        textAlign: 'center',
    }
});