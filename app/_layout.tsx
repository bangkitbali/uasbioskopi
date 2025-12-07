import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "../authContext"; // Pastikan path ini benar (sesuai lokasi file authContext kamu)

// Komponen ini bertugas sebagai "Polisi Lalu Lintas"
// Dia harus ada DI DALAM AuthProvider agar bisa panggil useAuth
const InitialLayout = () => {
  const { isLoggedIn, isReady } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isReady) return; // Tunggu sampai status login siap

    const inAuthGroup = segments[0] === "(auth)";

    // Jika user Login, tapi ada di halaman Login -> Tendang ke Home
    if (isLoggedIn && inAuthGroup) {
      router.replace("/(app)");
    } 
    // Jika user Belum Login, tapi maksa masuk Home -> Tendang ke Login
    else if (!isLoggedIn && !inAuthGroup) {
      router.replace("/(auth)/login");
    }
  }, [isLoggedIn, segments, isReady]);

  return <Slot />;
};

// RootLayout adalah INDUK dari segalanya
// Dia Wajib membungkus InitialLayout dengan AuthProvider
export default function RootLayout() {
  return (
    <AuthProvider>
      <InitialLayout />
    </AuthProvider>
  );
}