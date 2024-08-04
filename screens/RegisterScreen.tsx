import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { ParamListBase } from "@react-navigation/native";
import RootStackParamList from "../App"; // Ensure this points to the correct location where RootStackParamList is defined

type RegisterScreenNavigationProp = NativeStackNavigationProp<
  ParamListBase,
  keyof typeof RootStackParamList
>;

const RegisterScreen: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation<RegisterScreenNavigationProp>();

  const handleRegister = async () => {
    try {
      const response = await fetch('https://tarefista-api-81ceecfa6b1c.herokuapp.com/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        navigation.navigate("Home");
      } else {
        const errorData = await response.json();
        console.error("Registration failed: ", errorData);
      }
    } catch (error) {
      console.error("Error during registration: ", error);
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
};

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

export default RegisterScreen;