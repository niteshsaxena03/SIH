import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { useFirebase } from "../Firebase/firebaseContext";

const HomeScreen = () => {
  const { user, logOut, getUserDetailsByEmail } = useFirebase();
  const [userDetails, setUserDetails] = useState(null);
  const [status, setStatus] = useState("Monitoring...");
  const [currentSpeed, setCurrentSpeed] = useState(0); // Initial speed
  const [currentLocation, setCurrentLocation] = useState(
    "Latitude: 0, Longitude: 0"
  );
  const [locationName, setLocationName] = useState(""); // For location name
  const [speedWarning, setSpeedWarning] = useState("");

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (user) {
        const userData = await getUserDetailsByEmail(user.email);
        setUserDetails(userData);
      }
    };

    fetchUserDetails();
  }, [user]);

  useEffect(() => {
    const requestLocationPermission = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission to access location was denied");
        return;
      }

      // Define the function to get location and speed
      const getLocation = async () => {
        const { coords } = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        const { latitude, longitude, speed } = coords;
        setCurrentLocation(`Latitude: ${latitude}, Longitude: ${longitude}`);
        setCurrentSpeed(speed ? (speed * 3.6).toFixed(2) : 0); // Convert m/s to km/h

        // Get location name
        const reverseGeocode = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });
        if (reverseGeocode.length > 0) {
          const locationInfo = reverseGeocode[0];
          // Construct a detailed location name
          const street =
            locationInfo.name || locationInfo.street || "Unknown Street";
          const neighborhood = locationInfo.subregion || "Unknown Neighborhood";
          const city = locationInfo.city || "Unknown City";
          const country = locationInfo.country || "Unknown Country";

          setLocationName(`${street}, ${neighborhood}, ${city}, ${country}`);
        } else {
          setLocationName("Location name not available");
        }

        // Update speed warning
        if (speed > 22.22) {
          // Speed > 80 km/h
          setSpeedWarning("Warning: You are speeding!");
        } else {
          setSpeedWarning("");
        }
      };

      // Fetch location and speed initially
      getLocation();

      // Update location and speed every 1 second
      const interval = setInterval(() => {
        getLocation();
      }, 1000);

      return () => clearInterval(interval);
    };

    requestLocationPermission();
  }, []);

  return (
    <LinearGradient colors={["#002b36", "#005f73"]} style={styles.container}>
      <View style={styles.innerContainer}>
        {userDetails ? (
          <>
            <Text style={styles.greeting}>Hi, {userDetails.fullName}</Text>
            <Text style={styles.status}>Status: {status}</Text>
            <Text style={styles.detail}>
              Current Location: {currentLocation}
            </Text>
            <Text style={styles.detail}>Location Name: {locationName}</Text>
            <Text style={styles.detail}>
              Current Speed: {currentSpeed} km/h
            </Text>
            <Text style={styles.detail}>
              Vehicle Info: {userDetails.vehicleInfo}
            </Text>
            {speedWarning ? (
              <Text style={styles.warning}>{speedWarning}</Text>
            ) : null}

            <TouchableOpacity style={styles.button} onPress={logOut}>
              <Text style={styles.buttonText}>Log Out</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.loading}>Loading...</Text>
        )}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#002b36",
  },
  innerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    flexDirection: "column",
  },
  greeting: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
    textAlign: "center",
  },
  status: {
    fontSize: 20,
    color: "#ff9800",
    marginBottom: 20,
    textAlign: "center",
  },
  detail: {
    fontSize: 18,
    fontWeight: "600",
    color: "#e0f7fa",
    marginBottom: 10,
    textAlign: "center",
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  warning: {
    fontSize: 20,
    color: "#ff0000",
    marginBottom: 20,
    fontWeight: "bold",
    textAlign: "center",
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
    width: 150,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#002b36",
  },
  loading: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default HomeScreen;
