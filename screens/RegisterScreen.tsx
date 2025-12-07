import React, { useState } from "react";
import { View, StyleSheet, KeyboardAvoidingView, Platform, Modal, ActivityIndicator } from "react-native";
import { Text, TextInput, Button } from "react-native-paper";
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
  const [loading, setLoading] = useState<boolean>(false);
  const navigation = useNavigation<RegisterScreenNavigationProp>();

  const registerUser = async () => {
    if (!email.trim() || !password.trim()) {
      toastError("Email e senha são obrigatórios.", "Erro");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        email: email.trim(),
        password: password.trim(),
        displayName: displayName.trim(),
        photoURL: (photoURL && photoURL.trim()) || "https://via.placeholder.com/150",
      };

      const response = await fetch(`${API_BASE_URL}/Auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(await parseApiError(response));
      }

      const data = (await response.json()) as { userId: string };
      await syncTasksAfterRegistration(data.userId);

      toastSuccess("Usuário registrado com sucesso");
      navigation.navigate("Login");
    } catch (err: any) {
      const message = err?.message ?? "Erro ao realizar cadastro. Por favor, tente novamente.";
      toastError(message);
    } finally {
      setLoading(false);
    }
  };

  function toastSuccess(text2: string, text1 = "Sucesso") {
    Toast.show({ type: "success", text1, text2 });
  }

  function toastError(text2: string, text1 = "Erro no Cadastro") {
    Toast.show({ type: "error", text1, text2, position: "bottom", visibilityTime: 4000 });
  }

  /**
   * Converte respostas de erro em uma mensagem legível.
   * Cobertura:
   * - Middleware .NET (ExceptionMiddleware): data.error.message
   * - Mensagens simples: data.message
   * - Arrays de erros: data.errors[0].message
   * - Texto puro (fallback)
   */
  async function parseApiError(response: Response): Promise<string> {
    try {
      const ct = response.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        const data = await response.json();
        return data?.error?.message || data?.message || data?.errors?.[0]?.message || "Erro ao realizar cadastro. Por favor, tente novamente.";
      }
      const text = await response.text();
      return text || "Erro ao realizar cadastro. Por favor, tente novamente.";
    } catch {
      return "Erro ao realizar cadastro. Por favor, tente novamente.";
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Cadastre-se</Text>
        <TextInput mode='outlined' label='Seu nome' style={styles.input} value={displayName} onChangeText={setDisplayName} theme={{ colors: { primary: "#FF6F61" } }} />
        <TextInput mode='outlined' label='Email' style={styles.input} value={email} onChangeText={setEmail} keyboardType='email-address' autoCapitalize='none' theme={{ colors: { primary: "#FF6F61" } }} />
        <TextInput mode='outlined' label='Password' style={styles.input} value={password} onChangeText={setPassword} secureTextEntry theme={{ colors: { primary: "#FF6F61" } }} />
        <Button mode='contained' onPress={registerUser} loading={loading} disabled={loading} style={styles.button} buttonColor='#4a90e2' icon='account-plus'>
          Cadastre-se
        </Button>

        <Modal animationType='fade' transparent={true} visible={loading} onRequestClose={() => {}}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <ActivityIndicator size='large' color='#FF6F61' />
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalText: {
    marginTop: 15,
    fontSize: 16,
    textAlign: "center",
    color: "#333",
  },
});

export default RegisterScreen;
async function syncTasksAfterRegistration(userId: string) {
  try {
    // Get any temporary tasks stored with tempUserId
    const response = await fetch(`${API_BASE_URL}/tasks/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      console.error("Error syncing tasks:", await response.text());
    }
  } catch (error) {
    console.error("Error in syncTasksAfterRegistration:", error);
  }
}
