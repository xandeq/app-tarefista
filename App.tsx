import React from "react";
import { Text, View, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "./screens/HomeScreen";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import ProfileScreen from "./screens/ProfileScreen";
import TaskScreen from "./screens/TaskScreen";
import Icon from "react-native-vector-icons/Ionicons";
import "react-native-reanimated";
import Toast from "react-native-toast-message";
import { AuthProvider, useAuth } from "./context/AuthContext";

type RootStackParamList = {
  HomeTabs: undefined;
  Login: undefined;
  Registrar: undefined;
  Perfil: undefined;
  Tarefas: { taskId: string } | undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function AuthenticatedTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Inicio"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="home-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Tarefas"
        component={TaskScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="checkmark-done-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="person-outline" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function UnauthenticatedTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Inicio"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="home-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Tarefas"
        component={TaskScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="checkmark-done-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="person-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Login"
        component={LoginScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="log-in-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Registrar"
        component={RegisterScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="person-add-outline" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { user } = useAuth();

  return (
    <Stack.Navigator
      initialRouteName="HomeTabs"
      screenOptions={{ headerTitleAlign: "center" }}
    >
      {user ? (
        <Stack.Screen
          name="HomeTabs"
          component={AuthenticatedTabs}
          options={{ headerShown: false }}
        />
      ) : (
        <Stack.Screen
          name="HomeTabs"
          component={UnauthenticatedTabs}
          options={{ headerShown: false }}
        />
      )}
      <Stack.Screen name="Tarefas" component={TaskScreen} />
    </Stack.Navigator>
  );
}

function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
        <Toast />
      </NavigationContainer>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "red",
    fontSize: 18,
  },
});

export default App;
