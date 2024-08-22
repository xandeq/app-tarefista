import React, { useState } from "react";
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
import { useAuth } from "../context/AuthContext"; // Use o contexto de autenticação que criamos

type RegisterScreenNavigationProp = NativeStackNavigationProp<
  ParamListBase,
  "Registrar"
>;

const ProfileScreen: React.FC = () => {
  const authContext = useAuth();

  if (!authContext) {
    return (
      <View>
        <Text>Erro de autenticação</Text>
      </View>
    );
  }

  const { user, logout } = authContext;
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || "");

  const handleSignOut = async () => {
    try {
      await logout();
      navigation.navigate("Login");
    } catch (error) {
      console.error("Erro ao fazer logout: ", error);
    }
  };

  const handleSave = () => {
    // Implemente a lógica para salvar as alterações no perfil
    setIsEditing(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfil</Text>
      {user ? (
        <>
          {/* Mostrar a foto do perfil se disponível */}
          {user.photoURL && (
            <Image
              source={{
                uri: user.photoURL || "https://via.placeholder.com/150",
              }}
              style={styles.profileImage}
            />
          )}
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={displayName}
              onChangeText={setDisplayName}
            />
          ) : (
            <Text style={styles.displayName}>
              {displayName || user.email || "Sem nome"}
            </Text>
          )}
          <Text style={styles.email}>{user.email}</Text>
          {isEditing ? (
            <Button title="Salvar" onPress={handleSave} />
          ) : (
            <Button title="Editar Perfil" onPress={() => setIsEditing(true)} />
          )}
          <TouchableOpacity onPress={handleSignOut} style={styles.logoutButton}>
            <Text style={styles.logoutButtonText}>Sair</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text style={styles.displayName}>Usuário não autenticado</Text>
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
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: "gray",
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
});

export default ProfileScreen;
