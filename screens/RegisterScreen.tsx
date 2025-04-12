import React, { useState } from "react";
import { View, StyleSheet, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { Text, TextInput, Button, Snackbar } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../types";
import Toast from "react-native-toast-message";
import { StackNavigationProp } from "@react-navigation/stack";
import API_BASE_URL from "../config/apiConfig";

type RegisterScreenNavigationProp = StackNavigationProp<RootStackParamList, "Register">;

const RegisterScreen: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [displayName, setDisplayName] = useState<string>("");
  const [photoURL, setPhotoURL] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [visible, setVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const navigation = useNavigation<RegisterScreenNavigationProp>();

  const registerUser = async () => {
    if (email.trim() === "" || password.trim() === "") {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Email and password cannot be empty",
      });
      setError("Email and password cannot be empty");
      setVisible(true);
      return;
    }
    setLoading(true);
    setPhotoURL("https://via.placeholder.com/150");
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, displayName, photoURL }),
      });
      if (response.ok) {
        const data = await response.json();
        const userId = data.userId;
        await syncTasksAfterRegistration(userId);
        setLoading(false);
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "User registered successfully",
        });
        navigation.navigate("Login");
      } else {
        const errorMessage = await response.text();
        let mainMessage, detailMessage;
        try {
          const errorData = JSON.parse(errorMessage);
          mainMessage = errorData.message;
          detailMessage = errorData.error?.message;
          
          // Translate messages to Portuguese
          if (detailMessage === "The email address is already in use by another account.") {
            detailMessage = "Este email já está cadastrado. Por favor, use outro email ou faça login.";
          }
        } catch (e) {
          mainMessage = "Erro no Cadastro";
          detailMessage = "Erro ao realizar cadastro. Por favor, tente novamente.";
        }
        
        Alert.alert(
          mainMessage,
          detailMessage,
          [
            {
              text: "OK",
              style: "default",
              onPress: () => setVisible(false)
            }
          ]
        );
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Error registering user: " + error.message,
      });
      setError("Error registering user: " + error.message);
      setVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Cadastre-se</Text>
        <TextInput mode='outlined' label='Seu nome' style={styles.input} value={displayName} onChangeText={setDisplayName} theme={{ colors: { primary: "#FF6F61" } }} />
        <TextInput mode='outlined' label='Email' style={styles.input} value={email} onChangeText={setEmail} keyboardType='email-address' autoCapitalize='none' theme={{ colors: { primary: "#FF6F61" } }} />
        <TextInput mode='outlined' label='Password' style={styles.input} value={password} onChangeText={setPassword} secureTextEntry theme={{ colors: { primary: "#FF6F61" } }} />
        <Button 
          mode='contained' 
          onPress={registerUser} 
          loading={loading} 
          disabled={loading} 
          style={styles.button} 
          buttonColor='#4a90e2'
          icon="account-plus"
        >
          Cadastre-se
        </Button>
        <Snackbar visible={visible} onDismiss={() => setVisible(false)} duration={3000} style={styles.snackbar}>
          {error}
        </Snackbar>
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
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  snackbar: {
    backgroundColor: "#FF6F61",
  },
});

export default RegisterScreen;
function syncTasksAfterRegistration(userId: any) {
  throw new Error("Function not implemented.");
}
