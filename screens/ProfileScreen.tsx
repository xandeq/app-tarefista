import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ParamListBase } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Animatable from "react-native-animatable";
import Icon from "react-native-vector-icons/Ionicons"; // Biblioteca de ícones

type RegisterScreenNavigationProp = NativeStackNavigationProp<ParamListBase, "Register">;

const ProfileScreen: React.FC = () => {
  const { user, setUser } = useAuth();
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || "");

  useEffect(() => {
    console.log("User data:", user); // Console log para inspecionar os dados do usuário
  }, [user]);

  const handleSignOut = async () => {
    try {
      const response = await fetch("https://tarefista-api-81ceecfa6b1c.herokuapp.com/api/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        await AsyncStorage.removeItem("authToken");
        await AsyncStorage.removeItem("user");

        setUser(null);
        navigation.reset({
          index: 0,
          routes: [{ name: "Home" }],
        });
      } else {
        const errorData = await response.json();
        console.error("Logout failed:", errorData);

        Toast.show({
          type: "error",
          text1: "Falha no Logout",
          text2: errorData.message || "Não foi possível realizar o logout. Tente novamente.",
        });
      }
    } catch (error: any) {
      console.error("Erro ao fazer logout: ", error);

      Toast.show({
        type: "error",
        text1: "Erro ao Fazer Logout",
        text2: error.message || "Ocorreu um erro inesperado ao tentar sair. Verifique sua conexão ou tente novamente mais tarde.",
      });
    }
  };

  const handleSave = () => {
    setIsEditing(false);
  };

  const handleNavigateToRegister = () => {
    navigation.navigate("Register");
  };

  return (
    <View style={styles.container}>
      <Animatable.Text animation='fadeInDown' style={styles.title}>
        Meu Perfil
      </Animatable.Text>

      {user?.photoURL && <Animatable.Image animation='bounceIn' source={{ uri: user?.photoURL || "https://via.placeholder.com/150" }} style={styles.profileImage} />}

      {user?.displayName ? isEditing ? <TextInput style={styles.input} value={displayName} onChangeText={setDisplayName} /> : <Text style={styles.displayName}>{user.displayName}</Text> : <Text style={styles.displayName}>Usuário não autenticado</Text>}

      {user ? (
        <>
          {isEditing ? (
            <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
              <Icon name='save-outline' size={24} color='white' />
              <Text style={styles.saveButtonText}>Salvar</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editButton}>
              <Icon name='pencil-outline' size={24} color='white' />
              <Text style={styles.editButtonText}>Editar Perfil</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleSignOut} style={styles.logoutButton}>
            <Icon name='log-out-outline' size={24} color='white' />
            <Text style={styles.logoutButtonText}>Sair</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TouchableOpacity onPress={handleNavigateToRegister} style={styles.registerButton}>
            <Icon name='person-add-outline' size={24} color='white' />
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
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#ddd",
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
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#4caf50",
    borderRadius: 5,
    marginBottom: 10,
  },
  editButtonText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 10,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#2196f3",
    borderRadius: 5,
    marginBottom: 10,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 10,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "red",
    borderRadius: 5,
    marginBottom: 20,
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 10,
  },
  registerButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#1e90ff",
    borderRadius: 5,
  },
  registerButtonText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 10,
  },
});

export default ProfileScreen;
