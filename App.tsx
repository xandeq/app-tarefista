import React from "react";
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

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: undefined;
  Task: { taskId: string } | undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerTitleAlign: "center",
        tabBarIcon: ({ color, size }) => {
          let iconName: string;
          if (route.name === "Inicio") {
            iconName = "home";
          } else if (route.name === "Tarefas") {
            iconName = "list";
          } else if (route.name === "Perfil") {
            iconName = "person";
          } else {
            iconName = "radio-button-on";
          }
          return <Icon name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Inicio"
        component={HomeScreen}
        options={{ headerTitle: "Hoje" }}
      />
      <Tab.Screen name="Tarefas" component={TaskScreen} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
      <Tab.Screen name="Login" component={LoginScreen} />
    </Tab.Navigator>
  );
}

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Main"
        screenOptions={{ headerTitleAlign: "center" }}
      >
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen
          name="Main"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Task" component={TaskScreen} />
      </Stack.Navigator>
      <Toast /> 
    </NavigationContainer>
  );
};

export default App;
