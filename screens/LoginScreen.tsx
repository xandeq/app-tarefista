import React, { useState } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { Text, TextInput, Button, Snackbar } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../context/AuthContext"; // Importar useAuth and UserType
import { RootStackParamList } from "../types";

type LoginScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Login"
>;

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [visible, setVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const navigation = useNavigation<LoginScreenNavigationProp>();

  const { setUser } = useAuth() as { setUser: (user: any) => void }; // Aqui está o uso do contexto de autenticação

  const loginUser = async () => {
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
      const responseData = await response.json();
      console.log("Response data LOGIN: ", responseData);
      if (responseData.token) {
        console.log("Response data token: ", responseData.token);
        console.log("Response data user: ", responseData.user);
        await AsyncStorage.setItem("authToken", responseData.token);
        await AsyncStorage.setItem("user", JSON.stringify(responseData.user));
        setUser(responseData.user);
      }
      if (response.ok) {
        setLoading(false);
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Logged in successfully",
        });
        console.log("User logged in successfully navigate Home");
        navigation.reset({
          index: 0,
          routes: [{ name: "Home" }], // Reseta a pilha de navegação e vai para Home
        }); // Navigate to the MainTabs screen
      } else {
        const errorMessage = await response.text();
        Toast.show({
          type: "error",
          text1: "Error",
          text2: errorMessage,
        });
        setError(errorMessage);
        setVisible(true);
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Error logging in: " + error.message,
      });
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
        <TouchableOpacity
          onPress={handleNavigateToRegister}
          style={styles.registerButton}
        >
          <Text style={styles.registerButtonText}>Register</Text>
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
