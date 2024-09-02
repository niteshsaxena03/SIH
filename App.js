import React from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Icon from "react-native-vector-icons/Ionicons";

// Import your screens
import WelcomeScreen from "./screens/WelcomeScreen";
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignUpScreen";
import HomeScreen from "./screens/HomeScreen";
import ContactsScreen from "./screens/ContactsScreen";

// Import the FirebaseProvider
import { FirebaseProvider, useFirebase } from "./Firebase/firebaseContext.jsx";

// Create navigators
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainStack() {
  const { user } = useFirebase();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerTintColor: "#ff9800", // Orange color for text/icons in the header
        headerStyle: { backgroundColor: "#37474f" }, // Dark grey background for header
        headerTitleStyle: { fontWeight: "bold" }, // Bold font for the header title
      }}
    >
      {user ? (
        <Stack.Screen
          name="HomeTabs"
          component={HomeTabs}
          options={{ title: "Dashboard" }} // Custom title for HomeTabs
        />
      ) : (
        <>
          <Stack.Screen
            name="Welcome"
            component={WelcomeScreen}
            options={{ title: "Welcome to the App" }} // Custom title for WelcomeScreen
          />
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ title: "Login to Your Account" }} // Custom title for LoginScreen
          />
          <Stack.Screen
            name="Signup"
            component={SignupScreen}
            options={{ title: "Create an Account" }} // Custom title for SignupScreen
          />
        </>
      )}
    </Stack.Navigator>
  );
}

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#ff9800", // Orange color for active tab
        tabBarInactiveTintColor: "#b0bec5", // Light grey color for inactive tabs
        tabBarStyle: { backgroundColor: "#37474f" }, // Dark grey background for tab bar
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = "home"; // Icon for Home tab
          } else if (route.name === "Contacts") {
            iconName = "people"; // Icon for Contacts tab
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerTitle: "Home" }} // Custom title for the Home screen
      />
      <Tab.Screen
        name="Contacts"
        component={ContactsScreen}
        options={{ headerTitle: "Contacts" }} // Custom title for the Contacts screen
      />
    </Tab.Navigator>
  );
}

// Define the App component
export default function App() {
  return (
    <FirebaseProvider>
      <NavigationContainer>
        <MainStack />
        <StatusBar style="light" backgroundColor="#37474f" />
      </NavigationContainer>
    </FirebaseProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eceff1", // Light grey background color
    alignItems: "center",
    justifyContent: "center",
  },
});
