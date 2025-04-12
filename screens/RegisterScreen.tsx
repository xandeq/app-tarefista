import React, { useState } from "react";
import { View, StyleSheet, KeyboardAvoidingView, Platform, Alert, Modal, ActivityIndicator } from "react-native";
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
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const navigation = useNavigation<RegisterScreenNavigationProp>();

  const registerUser = async () => {
    setModalVisible(true);
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
        setModalVisible(false);
        setLoading(false);
        Toast.show({
          type: "success",
          text1: "Sucesso",
          text2: "Usuário registrado com sucesso",
        });
        navigation.navigate("Login");
      } else {
        let errorMessage;
        try {
          const errorText = await response.text();
          const errorData = JSON.parse(errorText);
          
          // Check different error message locations, including nested error object
          errorMessage = errorData.error?.message || 
                        errorData.message || 
                        "Erro ao realizar cadastro. Por favor, tente novamente.";
          
          if (errorData.error?.error?.message) {
            errorMessage = errorData.error.error.message;
          }
          setModalVisible(false);
          
          console.log("Registration error:", errorData);
        } catch (e) {
          console.error("Error parsing error response:", e);
          errorMessage = "Erro ao realizar cadastro. Por favor, tente novamente.";
        }
        
        Toast.show({
          type: "error",
          text1: "Erro no Cadastro",
          text2: errorMessage,
          position: "bottom",
          visibilityTime: 4000
        });
        
        setError(errorMessage);
        setVisible(true);
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
      setModalVisible(false);
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

        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <ActivityIndicator size="large" color="#FF6F61" />
              <Text style={styles.modalText}>Aguarde por favor, estamos te cadastrando...</Text>
            </View>
          </View>
        </Modal>
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalText: {
    marginTop: 15,
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
  },
});

export default RegisterScreen;
async function syncTasksAfterRegistration(userId: string) {
  try {
    // Get any temporary tasks stored with tempUserId
    const response = await fetch(`${API_BASE_URL}/tasks/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });
    
    if (!response.ok) {
      console.error('Error syncing tasks:', await response.text());
    }
  } catch (error) {
    console.error('Error in syncTasksAfterRegistration:', error);
  }
}
