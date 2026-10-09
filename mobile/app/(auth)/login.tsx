import { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '~/contexts/AuthContext';

export default function LoginScreen() {
  const { signIn, signInWithGoogle, isLoading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);

    const result = await signIn(email, password);
    console.log(result);

    if (!result.success) {
      Alert.alert('Login Failed', result.error || 'An error occurred');
    }
    // If successful, the AuthProvider will handle navigation

    setIsLoading(false);
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);

    const result = await signInWithGoogle();

    if (!result.success) {
      Alert.alert('Login Failed', result.error || 'Google login failed');
    }

    setIsLoading(false);
  };

  if (authLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 justify-center p-5">
      <Text className="font-bold" style={{ fontSize: 32, marginBottom: 40, textAlign: 'center' }}>
        Sign In
      </Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 15,
          marginBottom: 15,
          borderRadius: 8,
          fontSize: 16,
        }}
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 15,
          marginBottom: 20,
          borderRadius: 8,
          fontSize: 16,
        }}
      />

      <TouchableOpacity
        onPress={handleLogin}
        disabled={isLoading}
        style={{
          backgroundColor: isLoading ? '#ccc' : '#007bff',
          padding: 15,
          borderRadius: 8,
          marginBottom: 15,
        }}>
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={{ color: 'white', textAlign: 'center', fontSize: 16, fontWeight: 'bold' }}>
            Sign In
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleGoogleLogin}
        disabled={isLoading}
        style={{
          backgroundColor: isLoading ? '#ccc' : '#db4437',
          padding: 15,
          borderRadius: 8,
          marginBottom: 20,
        }}>
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={{ color: 'white', textAlign: 'center', fontSize: 16, fontWeight: 'bold' }}>
            Sign In with Google
          </Text>
        )}
      </TouchableOpacity>

      <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
        <Text>Não tem uma conta? </Text>
        {/* <Link href="/(auth)/signup" style={{ color: '#007bff', fontWeight: 'bold' }}>
          Sign Up
        </Link> */}
      </View>
    </View>
  );
}
