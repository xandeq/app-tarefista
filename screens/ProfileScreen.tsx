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

type RegisterScreenNavigationProp = NativeStackNavigationProp<
  ParamListBase,
  'Login'
>;

const AuthContext = createContext<{
  user: { displayName?: string; photoURL?: string };
}>({
  user: {},
});

const ProfileScreen: React.FC = () => {
  const { user } = useContext(AuthContext);
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || "");

  const handleSignOut = async () => {
    try {
      const response = await fetch('https://tarefista-api-81ceecfa6b1c.herokuapp.com/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        navigation.navigate("Login");
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error("Erro ao fazer logout: ", error);
    }
  };

  const handleSave = () => {
    // Implement profile update logic via API
    setIsEditing(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfil</Text>
      <Image
        source={{ uri: user?.photoURL || "https://via.placeholder.com/150" }}
        style={styles.profileImage}
      />
      {isEditing ? (
        <TextInput
          style={styles.input}
          value={displayName}
          onChangeText={setDisplayName}
        />
      ) : (
        <Text style={styles.displayName}>{user?.displayName || "Usuário"}</Text>
      )}
      {isEditing ? (
        <Button title="Salvar" onPress={handleSave} />
      ) : (
        <Button title="Editar Perfil" onPress={() => setIsEditing(true)} />
      )}
      <TouchableOpacity onPress={handleSignOut} style={styles.logoutButton}>
        <Text style={styles.logoutButtonText}>Sair</Text>
      </TouchableOpacity>
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
});

export default ProfileScreen;
