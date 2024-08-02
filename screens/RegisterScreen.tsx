import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { ParamListBase } from "@react-navigation/native";
import RootStackParamList from "../App"; // Certifique-se de que isso aponta para o local correto onde RootStackParamList é definido

type RegisterScreenNavigationProp = NativeStackNavigationProp<
  ParamListBase,
  keyof typeof RootStackParamList
>;

const firebaseConfig = {
  apiKey: "AIzaSyC3tzna3npRAunU6vHulIXTX6-ALOYNMRg",
  authDomain: "tarefista.firebaseapp.com",
  projectId: "tarefista",
  storageBucket: "tarefista.appspot.com",
  messagingSenderId: "104050667822",
  appId: "1:104050667822:web:515935d732fc3aaf228abf",
  measurementId: "G-QJPPMWLBZY",
};

export default function RegisterScreen() {
  const app: any = initializeApp(firebaseConfig);
  const auth: any = getAuth(app);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation<RegisterScreenNavigationProp>();

  const handleRegister = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigation.navigate("Home");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text>Register</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Register" onPress={handleRegister} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  input: {
    width: "100%",
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 20,
    padding: 10,
  },
});
function initializeApp(firebaseConfig: any): any {
  throw new Error("Function not implemented.");
}
