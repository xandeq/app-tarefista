import React, { useState, useContext, createContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  TextInput,
  TouchableOpacity,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ParamListBase } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";

type RegisterScreenNavigationProp = NativeStackNavigationProp<
  ParamListBase,
  "Register"
>;

const ProfileScreen: React.FC = () => {
  const { user, setUser } = useAuth();
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || "");

  const handleSignOut = async () => {
    try {
      const response = await fetch(
        "https://tarefista-api-81ceecfa6b1c.herokuapp.com/api/logout",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        await AsyncStorage.removeItem("authToken");
        await AsyncStorage.removeItem("user");

        // Atualizar o estado do contexto de autenticação
        setUser(null);
        navigation.reset({
          index: 0,
          routes: [{ name: "Home" }], // Reseta a pilha de navegação e vai para Home
        });
      } else {
        // Se a resposta não for ok, exiba um toast de erro
        const errorData = await response.json();
        console.error("Logout failed:", errorData);

        Toast.show({
          type: "error",
          text1: "Falha no Logout",
          text2:
            errorData.message ||
            "Não foi possível realizar o logout. Tente novamente.",
        });
      }
    } catch (error: any) {
      // Em caso de erro na comunicação ou falha na API, exiba um toast detalhado
      console.error("Erro ao fazer logout: ", error);

      Toast.show({
        type: "error",
        text1: "Erro ao Fazer Logout",
        text2:
          error.message ||
          "Ocorreu um erro inesperado ao tentar sair. Verifique sua conexão ou tente novamente mais tarde.",
      });
    }
  };

  const handleSave = () => {
    // Implement profile update logic via API
    setIsEditing(false);
  };

  const handleNavigateToRegister = () => {
    navigation.navigate("Register");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      {/* Mostrar a foto do perfil apenas se o usuário estiver autenticado */}
      {user?.photoURL && (
        <Image
          source={{ uri: user?.photoURL || "https://via.placeholder.com/150" }}
          style={styles.profileImage}
        />
      )}

      {/* Mostrar o nome ou o campo de edição apenas se o usuário estiver autenticado */}
      {user?.displayName ? (
        isEditing ? (
          <TextInput
            style={styles.input}
            value={displayName}
            onChangeText={setDisplayName}
          />
        ) : (
          <Text style={styles.displayName}>{user.displayName}</Text>
        )
      ) : (
        <Text style={styles.displayName}>Usuário não autenticado</Text>
      )}

      {user ? (
        <>
          {isEditing ? (
            <Button title="Salvar" onPress={handleSave} />
          ) : (
            <Button title="Editar Profile" onPress={() => setIsEditing(true)} />
          )}
          <TouchableOpacity onPress={handleSignOut} style={styles.logoutButton}>
            <Text style={styles.logoutButtonText}>Sair</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TouchableOpacity
            onPress={handleNavigateToRegister}
            style={styles.registerButton}
          >
            <Text style={styles.registerButtonText}>Register</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
  },
  input: {
    width: "100%",
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 20,
    padding: 10,
  },
  displayName: {
    fontSize: 18,
    marginBottom: 20,
  },
  logoutButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "red",
    borderRadius: 5,
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 16,
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

export default ProfileScreen;
