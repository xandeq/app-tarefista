import React, { useState } from "react";
import { View, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity } from "react-native";
import { Text, TextInput, Button, Snackbar } from "react-native-paper";
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types'; // Importe as tipagens
import { StackNavigationProp } from "@react-navigation/stack";

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [visible, setVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const navigation = useNavigation<LoginScreenNavigationProp>();

  const loginUser = async () => {
    if (email.trim() === "" || password.trim() === "") {
      setError("Email and password cannot be empty");
      setVisible(true);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `https://tarefista-api-81ceecfa6b1c.herokuapp.com/api/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );
      if (response.ok) {
        setLoading(false);
        navigation.navigate("Main");
      } else {
        const errorMessage = await response.text();
        setError(errorMessage);
        setVisible(true);
      }
    } catch (error: any) {
      setError("Error logging in: " + error.message);
      setVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateToRegister = () => {
    navigation.navigate("Register");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Login</Text>
        <TextInput
          mode="outlined"
          label="Email"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          theme={{ colors: { primary: "#FF6F61" } }}
        />
        <TextInput
          mode="outlined"
          label="Password"
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          theme={{ colors: { primary: "#FF6F61" } }}
        />
        <Button
          mode="contained"
          onPress={loginUser}
          loading={loading}
          disabled={loading}
          style={styles.button}
          buttonColor="#FF6F61"
        >
          Login
        </Button>
        <Snackbar
          visible={visible}
          onDismiss={() => setVisible(false)}
          duration={3000}
          style={styles.snackbar}
        >
          {error}
        </Snackbar>
        <TouchableOpacity onPress={handleNavigateToRegister} style={styles.registerButton}>
          <Text style={styles.registerButtonText}>Registrar</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF6F61",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    marginBottom: 20,
    borderRadius: 8,
  },
  button: {
    width: "100%",
    paddingVertical: 10,
    borderRadius: 8,
  },
  snackbar: {
    backgroundColor: "#FF6F61",
  },
  registerButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "blue",
    borderRadius: 5,
  },
  registerButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default LoginScreen;
