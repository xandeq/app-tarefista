import React, { useState } from "react";
import { View, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { Text, TextInput, Button, Snackbar } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../types";
import Toast from "react-native-toast-message";
import { StackNavigationProp } from "@react-navigation/stack";

type RegisterScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Registrar"
>;

const RegisterScreen: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [displayName, setDisplayName] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [visible, setVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const navigation = useNavigation<RegisterScreenNavigationProp>();

  const registerUser = async () => {
    if (email.trim() === "" || password.trim() === "" || displayName.trim() === "") {
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "Email, senha e nome de exibição não podem estar vazios",
      });
      setError("Email, senha e nome de exibição não podem estar vazios");
      setVisible(true);
      return;
    }
  
    setLoading(true);
    try {
      const response = await fetch(
        `https://tarefista-api-81ceecfa6b1c.herokuapp.com/api/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password, displayName }),
        }
      );
  
      if (response.ok) {
        const data = await response.json();
        const userId = data.userId;
        
        // Sincronizar tarefas após o registro, se necessário
        await syncTasksAfterRegistration(userId);
        
        setLoading(false);
        Toast.show({
          type: "success",
          text1: "Sucesso",
          text2: "Usuário registrado com sucesso",
        });
        navigation.navigate("Login");
      } else {
        const errorMessage = await response.text();
        Toast.show({
          type: "error",
          text1: "Erro",
          text2: errorMessage,
        });
        setError(errorMessage);
        setVisible(true);
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "Erro ao registrar usuário: " + error.message,
      });
      setError("Erro ao registrar usuário: " + error.message);
      setVisible(true);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Register</Text>
        <TextInput
          mode="outlined"
          label="Display Name"
          style={styles.input}
          value={displayName}
          onChangeText={setDisplayName}
          theme={{ colors: { primary: "#FF6F61" } }}
        />
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
          onPress={registerUser}
          loading={loading}
          disabled={loading}
          style={styles.button}
          buttonColor="#FF6F61"
        >
          Register
        </Button>
        <Snackbar
          visible={visible}
          onDismiss={() => setVisible(false)}
          duration={3000}
          style={styles.snackbar}
        >
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
    paddingVertical: 10,
    borderRadius: 8,
  },
  snackbar: {
    backgroundColor: "#FF6F61",
  },
});

export default RegisterScreen;
function syncTasksAfterRegistration(userId: any) {
  throw new Error("Function not implemented.");
}

