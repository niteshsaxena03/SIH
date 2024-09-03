import React, { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useFirebase } from "../Firebase/firebaseContext.jsx";

function SignupScreen() {
  const { signUpUserWithEmailAndPassword, addUserData } = useFirebase();

  // State for input fields
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [vehicleInfo, setVehicleInfo] = useState("");

  const handleSignup = async () => {
    try {
      // Create user with email and password
      const userCredential = await signUpUserWithEmailAndPassword(
        email,
        password
      );
      const userId = userCredential.user.uid;

      // Prepare user data for Firestore
      const userData = {
        fullName,
        phoneNumber,
        email,
        emergencyContacts: [{ contact: emergencyContact, counter: 0 }], // Array of emergency contacts
        bloodType,
        vehicleInfo,
      };

      // Add user data to Firestore
      await addUserData(userId, userData);

      // Show success message
      Alert.alert("Success", "User signed up and data saved successfully!");

      // Clear the form
      setFullName("");
      setPhoneNumber("");
      setEmail("");
      setPassword("");
      setEmergencyContact("");
      setBloodType("");
      setVehicleInfo("");
    } catch (error) {
      console.error("Error signing up: ", error);
      Alert.alert("Error", "Failed to sign up. Please try again.");
    }
  };

  return (
    <LinearGradient colors={["#002b36", "#005f73"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Sign Up</Text>
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="#aaa"
            value={fullName}
            onChangeText={setFullName}
          />
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            placeholderTextColor="#aaa"
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            placeholderTextColor="#aaa"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#aaa"
            secureTextEntry={true}
            value={password}
            onChangeText={setPassword}
          />
          <TextInput
            style={styles.input}
            placeholder="Emergency Contact"
            placeholderTextColor="#aaa"
            value={emergencyContact}
            onChangeText={setEmergencyContact}
          />
          <TextInput
            style={styles.input}
            placeholder="Blood Type"
            placeholderTextColor="#aaa"
            value={bloodType}
            onChangeText={setBloodType}
          />
          <TextInput
            style={styles.input}
            placeholder="Vehicle Information"
            placeholderTextColor="#aaa"
            value={vehicleInfo}
            onChangeText={setVehicleInfo}
          />
          <TouchableOpacity style={styles.button} onPress={handleSignup}>
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#3e0b15",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
  },
  formContainer: {
    width: "100%",
  },
  input: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginVertical: 8,
    fontSize: 16,
    color: "#333",
  },
  button: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#3e0b15",
  },
});

export default SignupScreen;
