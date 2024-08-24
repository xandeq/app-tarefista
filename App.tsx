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
import { AuthProvider, useAuth } from "./context/AuthContext"; // Import the AuthProvider and useAuth hook

type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: undefined;
  Tasks: { taskId: string } | undefined;
  Profile: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const { user } = useAuth(); // Hook to get the user authentication state
  let iconName: string;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerTitleAlign: "center",
        tabBarIcon: ({ color, size }) => {
          let iconName: string;

          switch (route.name) {
            case "HomeTab":
              iconName = "home";
              break;
            case "TasksTab":
              iconName = "clipboard";
              break;
            case "ProfileTab":
              iconName = "person";
              break;
            case "Login":
              iconName = "log-in";
              break;
            case "Register":
              iconName = "person-add";
              break;
            default:
              iconName = "home";
              break;
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
      })}
    >
      {user ? (
        <>
          {/* Abas para usuários logados */}
          <Tab.Screen
            name="HomeTab"
            component={HomeScreen}
            options={{ headerTitle: "Hoje" }}
          />
          <Tab.Screen name="TasksTab" component={TaskScreen} />
          <Tab.Screen name="ProfileTab" component={ProfileScreen} />
        </>
      ) : (
        <>
          <Tab.Screen
            name="HomeTab"
            component={HomeScreen}
            options={{ headerTitle: "Hoje" }}
          />
          <Tab.Screen name="Login" component={LoginScreen} />
          <Tab.Screen name="Register" component={RegisterScreen} />
          {user && <Tab.Screen name="ProfileTab" component={ProfileScreen} />}
        </>
      )}
    </Tab.Navigator>
  );
}

function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Home" // Always start with Home screen
      screenOptions={{ headerTitleAlign: "center" }}
    >
      <Stack.Screen
        name="Home"
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Tasks" component={TaskScreen} />
    </Stack.Navigator>
  );
}

const App: React.FC = () => {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
        <Toast />
      </NavigationContainer>
    </AuthProvider>
  );
};

export default App;
