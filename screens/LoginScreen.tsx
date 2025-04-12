import React, { useState } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { Text, TextInput, Button, Snackbar } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../context/AuthContext";
import { RootStackParamList } from "../types";
import API_BASE_URL from "../config/apiConfig";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, "Login">;

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [visible, setVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { setUser } = useAuth() as { setUser: (user: any) => void };

  const loginUser = async () => {
    if (email.trim() === "" || password.trim() === "") {
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "Email e senha não podem estar vazios",
      });
      setError("Email e senha não podem estar vazios");
      setVisible(true);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Server response:", errorData);
        throw new Error(errorData || "Erro no servidor. Por favor, tente novamente.");
      }

      const responseData = await response.json();

      if (response.ok && responseData.token) {
        await AsyncStorage.setItem("authToken", responseData.token);
        await AsyncStorage.setItem("user", JSON.stringify(responseData.user));
        setUser(responseData.user);
        setLoading(false);
        Toast.show({
          type: "success",
          text1: "Sucesso",
          text2: "Login realizado com sucesso",
        });
        navigation.reset({
          index: 0,
          routes: [{ name: "Home" }],
        });
      } else {
        const errorMessage = responseData.message || "Erro ao fazer login";
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
        text2: "Erro ao fazer login: " + error.message,
      });
      setError("Erro ao fazer login: " + error.message);
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
        <View style={styles.logoContainer}>
          <Image source={require("../assets/logo.png")} style={styles.logo} />
          <Text style={styles.welcomeText}>Bem-vindo de volta!</Text>
          <Text style={styles.subtitle}>
            Entre para continuar gerenciando suas tarefas
          </Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Icon name="email-outline" size={24} color="#666" style={styles.icon} />
            <TextInput
              mode="outlined"
              label="Email"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              theme={{ colors: { primary: "#FF6F61" } }}
              left={<TextInput.Icon icon="email" />}
            />
          </View>

          <View style={styles.inputContainer}>
            <Icon name="lock-outline" size={24} color="#666" style={styles.icon} />
            <TextInput
              mode="outlined"
              label="Senha"
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              theme={{ colors: { primary: "#FF6F61" } }}
              right={
                <TextInput.Icon
                  icon={showPassword ? "eye-off" : "eye"}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
            />
          </View>

          <Button
            mode="contained"
            onPress={loginUser}
            loading={loading}
            disabled={loading}
            style={styles.loginButton}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
          >
            {loading ? "Entrando..." : "Entrar"}
          </Button>

          <TouchableOpacity
            onPress={() => navigation.navigate("Register")}
            style={styles.registerButton}
          >
            <Text style={styles.registerText}>Não tem uma conta?</Text>
            <Text style={styles.registerLink}>Cadastre-se agora</Text>
          </TouchableOpacity>
        </View>

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
    padding: 20,
    justifyContent: "space-between",
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 60,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: "contain",
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 40,
  },
  formContainer: {
    width: "100%",
    paddingHorizontal: 20,
  },
  inputContainer: {
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 8,
  },
  loginButton: {
    marginTop: 20,
    borderRadius: 8,
    backgroundColor: "#FF6F61",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonContent: {
    height: 50,
  },
  buttonLabel: {
    fontSize: 18,
    fontWeight: "bold",
  },
  registerButton: {
    marginTop: 30,
    alignItems: "center",
  },
  registerText: {
    color: "#666",
    fontSize: 16,
  },
  registerLink: {
    color: "#FF6F61",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 5,
  },
  snackbar: {
    backgroundColor: "#FF6F61",
  },
});

export default LoginScreen;