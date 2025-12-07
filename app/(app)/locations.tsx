import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Image, TouchableOpacity } from "react-native";
import { Icon } from "@rneui/base";
import { useLocalSearchParams, useRouter } from "expo-router";

interface Branch { branch_id: number; branch_name: string; city: string; address: string; }

export default function Locations() {
    const router = useRouter();
    const params = useLocalSearchParams();
    // 1. Ambil kota dari parameter (dikirim dari Home), default kosong
    const initialCity = params.city as string || '';

    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);
    // 2. State Filter Kota
    const [filterCity, setFilterCity] = useState(initialCity);
    const [availableCities, setAvailableCities] = useState<string[]>([]);

    const fetchBranches = async () => {
        try {
            const response = await fetch('https://ubaya.cloud/react/160422148/uas/get_branches.php');
            const json = await response.json();

            if (json.result === 'success') {
                const data = json.data;
                setBranches(data);
                // @ts-ignore
                const cities = [...new Set(data.map(b => b.city.trim()))];
                setAvailableCities(cities as string[]);
                
                // Kalau tidak ada parameter kota, pakai kota pertama
                if (!filterCity && cities.length > 0) setFilterCity(cities[0] as string);
            }
        } catch (error) { console.error(error); } 
        finally { setLoading(false); }
    };

    useEffect(() => { fetchBranches(); }, []);

    // 3. Filter List
    const filteredData = branches.filter(b => 
        b.city.trim().toLowerCase() === filterCity.trim().toLowerCase()
    );

    // 4. Komponen Item (CinemaItem) - Diupdate agar bisa diklik ke Detail
    const renderItem = ({ item }: { item: Branch }) => (
        <TouchableOpacity 
            style={styles.card}
            onPress={() => router.push({
                pathname: '/cinema_detail',
                params: { branch_id: item.branch_id, branch_name: item.branch_name }
            })}
        >
            <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1000&auto=format&fit=crop' }} 
                style={styles.image} 
            />
            <View style={styles.content}>
                <View style={styles.row}>
                    <Icon name="location-city" type="material" color="#F1C40F" size={20} />
                    <Text style={styles.city}>{item.city}</Text>
                </View>
                <Text style={styles.name}>{item.branch_name}</Text>
                <View style={styles.addressContainer}>
                    <Icon name="place" type="material" color="#888" size={16} style={{marginTop: 2}} />
                    <Text style={styles.address}>{item.address}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#F1C40F" /></View>;

    return (
        <View style={styles.container}>
            
            {/* 5. Tab Filter Kota di Atas */}
            <View style={styles.tabs}>
                {availableCities.map(city => (
                    <TouchableOpacity 
                        key={city} 
                        style={[styles.tabItem, filterCity.toLowerCase() === city.toLowerCase() && styles.activeTab]}
                        onPress={() => setFilterCity(city)}
                    >
                        <Text style={[styles.tabText, filterCity.toLowerCase() === city.toLowerCase() && styles.activeTabText]}>
                            {city}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <FlatList
                data={filteredData}
                keyExtractor={(item) => item.branch_id.toString()}
                renderItem={renderItem}
                contentContainerStyle={{ padding: 15 }}
                ListEmptyComponent={<Text style={{color:'white', textAlign:'center', marginTop:20}}>Tidak ada bioskop.</Text>}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
    
    // Tabs Style (Baru)
    tabs: { flexDirection: 'row', backgroundColor: '#1E1E1E', padding: 10 },
    tabItem: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20, marginRight: 10, borderWidth: 1, borderColor: '#333' },
    activeTab: { backgroundColor: '#F1C40F', borderColor: '#F1C40F' },
    tabText: { color: '#888', fontWeight: 'bold' },
    activeTabText: { color: 'black' },

    // Card Style (Sama)
    card: { backgroundColor: '#1E1E1E', borderRadius: 15, marginBottom: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#333', elevation: 5 },
    image: { width: '100%', height: 150, opacity: 0.8 },
    content: { padding: 15 },
    row: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
    city: { color: '#F1C40F', fontWeight: 'bold', marginLeft: 5, textTransform: 'uppercase', letterSpacing: 1, fontSize: 12 },
    name: { color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
    addressContainer: { flexDirection: 'row', alignItems: 'flex-start' },
    address: { color: '#AAA', marginLeft: 5, fontSize: 14, flex: 1 }
});