import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Image, TouchableOpacity, Alert, Platform } from "react-native";
import { Button, Icon, Card } from "@rneui/base";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

// Tipe data Makanan
interface Product {
    product_id: number;
    product_name: string; // Sesuaikan dengan database (misal: 'name')
    price: number;
    url: string; // URL gambar makanan (jika ada)
    description?: string;
}

// Tipe data Keranjang
interface CartItem {
    qty: number;
    price: number;
}

export default function Cafe() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    // State Keranjang: { 1: {qty: 2, price: 50000}, ... }
    const [cart, setCart] = useState<{ [key: number]: CartItem }>({});

    const fetchProducts = async () => {
        try {
            const response = await fetch('https://ubaya.cloud/react/160422148/uas/get_products.php');
            const json = await response.json();
            if (json.result === 'success') {
                setProducts(json.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // Fungsi Tambah/Kurang Qty
    const updateQty = (item: Product, delta: number) => {
        setCart(prev => {
            const currentQty = prev[item.product_id]?.qty || 0;
            const newQty = currentQty + delta;

            if (newQty <= 0) {
                // Hapus dari keranjang jika 0
                const newCart = { ...prev };
                delete newCart[item.product_id];
                return newCart;
            }

            return {
                ...prev,
                [item.product_id]: { qty: newQty, price: item.price }
            };
        });
    };

    // Hitung Total Bayar
    const totalAmount = Object.values(cart).reduce((sum, item) => sum + (item.qty * item.price), 0);
    const totalQty = Object.values(cart).reduce((sum, item) => sum + item.qty, 0);

    // Fungsi Checkout
    const handleCheckout = async () => {
        if (totalAmount === 0) return;

        // Ubah format cart object ke array untuk dikirim ke PHP
        // Format: [{ "product_id": 1, "qty": 2, "price": 25000 }]
        const productArray = Object.keys(cart).map(key => ({
            product_id: Number(key),
            qty: cart[Number(key)].qty,
            price: cart[Number(key)].price
        }));

        try {
            const username = await AsyncStorage.getItem('username');
            const orderData = {
                user_id: username,
                total_amount: totalAmount,
                products: productArray
                // seats & schedule_id tidak dikirim (karena cuma beli makan)
            };

            const response = await fetch('https://ubaya.cloud/react/160422148/uas/create_order.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            const textResponse = await response.text();
            // Parsing manual biar aman
            const json = JSON.parse(textResponse.trim());
            console.log("RESPONSE:", json);

            

            if (json.result === 'success') {
                setTimeout(() => {
                    if (Platform.OS === "web") {
                        window.alert(
                            "Yummy! 🍔\nPesanan makanan berhasil dibuat.\nSilakan ambil di kasir."
                        );
                        router.replace("/order_history");
                    } else {
                        Alert.alert(
                            "Yummy! 🍔",
                            "Pesanan makanan berhasil dibuat.\nSilakan ambil di kasir.",
                            [
                                {
                                    text: "OK",
                                    onPress: () => router.replace("/(app)/order_history")
                                }
                            ]
                        );
                    }
                }, 100);
            }


        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Gagal koneksi ke server");
        }
    };

    const renderItem = ({ item }: { item: Product }) => {
        const qty = cart[item.product_id]?.qty || 0;

        return (
            <View style={styles.card}>
                {/* Gambar Makanan (Fallback jika url kosong) */}
                <Image
                    source={{ uri: item.url || 'https://cdn-icons-png.flaticon.com/512/2921/2921822.png' }}
                    style={styles.image}
                />

                <View style={styles.info}>
                    <Text style={styles.name}>{item.product_name}</Text>
                    <Text style={styles.desc} numberOfLines={2}>{item.description || 'Enak dan menyegarkan!'}</Text>
                    <Text style={styles.price}>Rp {item.price.toLocaleString('id-ID')}</Text>
                </View>

                {/* Kontrol Jumlah (+/-) */}
                <View style={styles.qtyContainer}>
                    {qty > 0 && (
                        <>
                            <TouchableOpacity onPress={() => updateQty(item, -1)} style={styles.qtyBtn}>
                                <Icon name="remove" color="white" size={16} />
                            </TouchableOpacity>
                            <Text style={styles.qtyText}>{qty}</Text>
                        </>
                    )}
                    <TouchableOpacity onPress={() => updateQty(item, 1)} style={[styles.qtyBtn, { backgroundColor: '#F1C40F' }]}>
                        <Icon name="add" color="black" size={16} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#F1C40F" /></View>;

    return (
        <View style={styles.container}>
            <FlatList
                data={products}
                keyExtractor={(item) => item.product_id.toString()}
                renderItem={renderItem}
                contentContainerStyle={{ padding: 15, paddingBottom: 100 }}
            />
            {/* FLOATING CART (Muncul kalau ada item) */}
            {totalQty > 0 && (
                <View style={styles.floatingCart}>
                    <View>
                        <Text style={styles.cartLabel}>{totalQty} Item Dipilih</Text>
                        <Text style={styles.cartTotal}>Rp {totalAmount.toLocaleString('id-ID')}</Text>
                    </View>
                    <Button
                        title="PESAN SEKARANG"
                        buttonStyle={styles.checkoutBtn}
                        titleStyle={{ color: 'black', fontWeight: 'bold' }}
                        onPress={handleCheckout}
                    />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
    card: {
        backgroundColor: '#1E1E1E', borderRadius: 12, marginBottom: 15,
        flexDirection: 'row', padding: 10, alignItems: 'center',
        borderWidth: 1, borderColor: '#333'
    },
    image: { width: 80, height: 80, borderRadius: 10, backgroundColor: '#333' },
    info: { flex: 1, marginLeft: 15 },
    name: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    desc: { color: '#888', fontSize: 12, marginTop: 2, marginBottom: 5 },
    price: { color: '#F1C40F', fontWeight: 'bold', fontSize: 14 },

    qtyContainer: { alignItems: 'center', justifyContent: 'center', gap: 8 },
    qtyBtn: {
        width: 30, height: 30, borderRadius: 15, backgroundColor: '#444',
        justifyContent: 'center', alignItems: 'center'
    },
    qtyText: { color: 'white', fontWeight: 'bold', fontSize: 16 },

    // Floating Cart Style
    floatingCart: {
        position: 'absolute', bottom: 20, left: 20, right: 20,
        backgroundColor: '#333', borderRadius: 15, padding: 15,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        elevation: 10, shadowColor: 'black', shadowOpacity: 0.5, shadowRadius: 5
    },
    cartLabel: { color: '#AAA', fontSize: 12 },
    cartTotal: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
    checkoutBtn: { backgroundColor: '#F1C40F', borderRadius: 10, paddingHorizontal: 20 }
});