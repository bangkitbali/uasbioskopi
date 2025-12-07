import { Href, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { 
    View, Text, StyleSheet, ScrollView, StatusBar, 
    TouchableOpacity, Image, FlatList, Alert, Modal
} from 'react-native';
import { Icon } from '@rneui/base';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Tipe Data
interface Movie { movie_id: number; title: string; vote_average: number; url: string; }
interface Branch { branch_id: number; branch_name: string; city: string; address: string; }

export default function Index() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [movies, setMovies] = useState<Movie[]>([]);
    
    // Lokasi State
    const [selectedCity, setSelectedCity] = useState('Surabaya');
    const [modalVisible, setModalVisible] = useState(false); // State untuk Popup
    const [availableCities, setAvailableCities] = useState<string[]>([]); // Daftar Kota
    const [branches, setBranches] = useState<Branch[]>([]); // Data Cabang

    // Fetch Data
    const fetchData = async () => {
        try {
            const user = await AsyncStorage.getItem('username');
            if (user) setUsername(user);

            // Get Movies
            const respMovies = await fetch('https://ubaya.cloud/react/160422148/uas/get_movies.php');
            const jsonMovies = await respMovies.json();
            if (jsonMovies.result === 'success') setMovies(jsonMovies.data);

            // Get Branches (Untuk Filter Kota)
            const respBranches = await fetch('https://ubaya.cloud/react/160422148/uas/get_branches.php');
            const jsonBranches = await respBranches.json();
            if (jsonBranches.result === 'success') {
                const dataBranches = jsonBranches.data;
                setBranches(dataBranches);
                
                // Ambil daftar kota unik
                // @ts-ignore
                const cities = [...new Set(dataBranches.map(b => b.city))]; 
                setAvailableCities(cities as string[]);
                
                // Default kota pertama jika ada
                if (cities.length > 0 && !selectedCity) setSelectedCity(cities[0] as string);
            }
        } catch (e) { console.error(e); }
    };

    useEffect(() => { fetchData(); }, []);

    // --- KOMPONEN ITEM ---
    const QuickMenu = ({ icon, title, color, route }: any) => (
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push(route)}>
            <View style={[styles.menuIconBox, { backgroundColor: color }]}>
                <Icon name={icon} type="material" color="white" size={28} />
            </View>
            <Text style={styles.menuText}>{title}</Text>
        </TouchableOpacity>
    );

    const MovieItem = ({ item }: { item: Movie }) => (
        <TouchableOpacity 
            style={styles.movieCard}
            onPress={() => router.push(`/movie_detail/${item.movie_id}` as Href)}
        >
            <Image source={{ uri: item.url }} style={styles.moviePoster} resizeMode="cover" />
            <Text style={styles.movieTitle} numberOfLines={1}>{item.title}</Text>
            <View style={styles.ratingBadge}>
                <Icon name="star" size={12} color="#FFD700" />
                <Text style={styles.ratingText}>{item.vote_average}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.mainContainer}>
            <StatusBar barStyle="light-content" backgroundColor="#121212" />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 100}}>
                
                {/* --- HEADER (FIXED: Buka Modal, Bukan Pindah Halaman) --- */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.welcomeLabel}>Lokasi Anda</Text>
                        <TouchableOpacity 
                            style={styles.locationBtn} 
                            onPress={() => setModalVisible(true)} // <-- INI PERBAIKANNYA
                        >
                            <Icon name="location-on" size={20} color="#F1C40F" />
                            <Text style={styles.locationText}>{selectedCity}</Text>
                            <Icon name="keyboard-arrow-down" size={20} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.profileHead}>
                        <Icon name="account-circle" size={40} color="#FFF" />
                        <Text style={styles.username}>Hi, {username}</Text>
                    </View>
                </View>

                {/* --- BANNER --- */}
                <View style={styles.bannerContainer}>
                    <Image 
                        source={{ uri: 'https://asset.kompas.com/crops/O4o2VjdXapn9MJKVjKkQGZ9Sgq0=/0x0:780x520/750x500/data/photo/2020/06/12/5ee35a518080b.jpg' }} 
                        style={styles.banner} resizeMode="cover"
                    />
                </View>

                {/* --- MENU UTAMA --- */}
                <View style={styles.menuContainer}>
                    <QuickMenu title="Top Up" icon="account-balance-wallet" color="#2ECC71" route="/topup" />
                    <QuickMenu title="Cinema" icon="theaters" color="#9B59B6" route="/locations" />
                    <QuickMenu title="Movies" icon="movie" color="#3498DB" route="/movie_list" />
                    <QuickMenu title="M-Food" icon="fastfood" color="#E74C3C" route="/cafe" />
                </View>

                {/* --- SEDANG TAYANG --- */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Sedang Tayang</Text>
                    <TouchableOpacity onPress={() => router.push('/movie_list' as Href)}>
                        <Text style={styles.seeAll}>Lihat Semua</Text>
                    </TouchableOpacity>
                </View>

                <FlatList 
                    horizontal
                    data={movies.slice(0, 5)}
                    keyExtractor={(item) => item.movie_id.toString()}
                    renderItem={({ item }) => <MovieItem item={item} />}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 20 }}
                />

                {/* --- PROMO SECTION --- */}
                <View style={styles.promoContainer}>
                    <Text style={styles.sectionTitle}>Promo & Deals</Text>
                    <View style={styles.promoCard}>
                        <Icon name="local-offer" color="white" size={40} />
                        <View style={{marginLeft: 15}}>
                            <Text style={styles.promoTitle}>Diskon Pelajar 50%</Text>
                            <Text style={styles.promoDesc}>Tunjukkan kartu pelajar hari Senin-Kamis.</Text>
                        </View>
                    </View>
                </View>

            </ScrollView>

            {/* --- BOTTOM NAVIGATION BAR --- */}
            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navItem} onPress={() => {}}>
                    <Icon name="home" color="#F1C40F" size={28} />
                    <Text style={[styles.navText, {color: '#F1C40F'}]}>Home</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navItem} onPress={() => router.push('/order_history')}>
                    <Icon name="receipt" color="#888" size={28} />
                    <Text style={styles.navText}>My Order</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navItem} onPress={() => router.push('/profile')}>
                    <Icon name="person" color="#888" size={28} />
                    <Text style={styles.navText}>My M.Tix</Text>
                </TouchableOpacity>
            </View>

            {/* --- MODAL POPUP PILIH KOTA (DITAMBAHKAN KEMBALI) --- */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Pilih Kota Kamu</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Icon name="close" color="white" />
                            </TouchableOpacity>
                        </View>
                        
                        {/* List Kota */}
                        {availableCities.map((city, index) => (
                            <TouchableOpacity 
                                key={index} 
                                style={styles.cityOption}
                                onPress={() => {
                                    setSelectedCity(city);
                                    setModalVisible(false);
                                }}
                            >
                                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                    <Icon name="location-city" color={selectedCity === city ? '#F1C40F' : '#888'} size={24} />
                                    <Text style={[styles.cityText, selectedCity === city && { color: '#F1C40F', fontWeight: 'bold' }]}>
                                        {city}
                                    </Text>
                                </View>
                                {selectedCity === city && <Icon name="check-circle" color="#F1C40F" size={20} />}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </Modal>

        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: '#121212' },
    
    // HEADER
    header: {
        padding: 20, paddingTop: 40, backgroundColor: '#1E1E1E',
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
    },
    welcomeLabel: { color: '#888', fontSize: 12 },
    locationBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
    locationText: { color: 'white', fontWeight: 'bold', fontSize: 18, marginHorizontal: 5 },
    profileHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    username: { color: 'white', fontWeight: 'bold', fontSize: 16 },

    // BANNER
    bannerContainer: { width: '100%', height: 250, marginBottom: 20 },
    banner: { width: '100%', height: '100%' },

    // MENU
    menuContainer: {
        flexDirection: 'row', justifyContent: 'space-around',
        paddingHorizontal: 20, marginBottom: 30
    },
    menuItem: { alignItems: 'center', flex: 1 },
    menuIconBox: {
        width: 60, height: 60, borderRadius: 20,
        justifyContent: 'center', alignItems: 'center', marginBottom: 10,
        elevation: 5
    },
    menuText: { color: 'white', fontSize: 14, fontWeight: '500' },

    // SECTION
    sectionHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 20, marginBottom: 15
    },
    sectionTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
    seeAll: { color: '#F1C40F', fontSize: 14, fontWeight: 'bold' },

    // MOVIE CARD
    movieCard: { marginRight: 20, width: 160 },
    moviePoster: { width: 160, height: 240, borderRadius: 12, marginBottom: 10 },
    movieTitle: { color: 'white', fontWeight: 'bold', fontSize: 16, textAlign: 'center' },
    ratingBadge: { 
        position: 'absolute', top: 10, right: 10, 
        backgroundColor: 'rgba(0,0,0,0.8)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
        flexDirection: 'row', alignItems: 'center' 
    },
    ratingText: { color: '#FFD700', fontSize: 12, marginLeft: 4, fontWeight: 'bold' },

    // PROMO
    promoContainer: { padding: 20, marginTop: 10 },
    promoCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#E74C3C',
        padding: 20, borderRadius: 15, marginTop: 15
    },
    promoTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    promoDesc: { color: 'white', fontSize: 14 },

    // BOTTOM NAV
    bottomNav: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: 70, backgroundColor: '#1E1E1E',
        flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
        borderTopWidth: 1, borderTopColor: '#333'
    },
    navItem: { alignItems: 'center' },
    navText: { color: '#888', fontSize: 12, marginTop: 4, fontWeight: 'bold' },

    // MODAL STYLE (PENTING AGAR POPUP MUNCUL)
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { backgroundColor: '#1E1E1E', padding: 20, borderRadius: 25, width: '80%', maxHeight: '60%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
    cityOption: { 
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#333' 
    },
    cityText: { color: '#BBB', fontSize: 16, marginLeft: 15 }
});