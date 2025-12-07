import { Stack } from "expo-router";

export default function AuthLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            {/* Halaman Login */}
            <Stack.Screen name="login" />
            
            {/* TAMBAHKAN INI: Halaman Register */}
            <Stack.Screen name="register" />
        </Stack>
    );
}