import React from "react";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

function WelcomeScreen({ navigation }) {
  return (
    <LinearGradient
      colors={["#002b36", "#005f73"]} // Dark blue to lighter blue gradient
      style={styles.container}
    >
      <View style={styles.titleContainer}>
        <Text style={styles.mainTitle}>Jeevan Rakshak</Text>
        <Text style={styles.title}>Welcomes You!</Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Signup")}
        >
          <Text style={styles.buttonText}>SignUp</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  titleContainer: {
    marginBottom: 40, // Space between title and buttons
    alignItems: "center",
  },
  title: {
    fontSize: 30, // Increased text size
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginVertical: 5,
  },
  mainTitle: {
    fontSize: 40, // Increased text size
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginVertical: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
  },
  button: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 10, // Adjusted to make buttons closer
    elevation: 3, // Shadow for Android
    shadowColor: "#000", // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    width: 150, // Adjusted width to fit the text
  },
  buttonText: {
    fontSize: 18, // Slightly larger text size for buttons
    fontWeight: "bold",
    color: "#005f73", // Darker text color to match background
    textAlign: "center",
  },
});

export default WelcomeScreen;
