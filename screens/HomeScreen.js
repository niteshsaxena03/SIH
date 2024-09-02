import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import emailjs from "emailjs-com";
import { useFirebase } from "../Firebase/firebaseContext";

const HomeScreen = () => {
  const { user, logOut, getUserDetailsByEmail } = useFirebase();
  const [userDetails, setUserDetails] = useState(null);
  const [status, setStatus] = useState("Monitoring...");
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [tempSpeed, setTempSpeed] = useState(0);
  const [currentLocation, setCurrentLocation] = useState(
    "Latitude: 0, Longitude: 0"
  );
  const [locationName, setLocationName] = useState("");
  const [speedWarning, setSpeedWarning] = useState("");
  const [emailSent, setEmailSent] = useState(false); // Boolean state to track email status

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (user) {
        try {
          const userData = await getUserDetailsByEmail(user.email);
          setUserDetails(userData);
        } catch (error) {
          console.error("Error fetching user details:", error);
          Alert.alert("Error", "Unable to fetch user details.");
        }
      }
    };

    fetchUserDetails();
  }, [user]);

  useEffect(() => {
    const requestLocationPermission = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location access is required.");
        return;
      }

      const getLocation = async () => {
        try {
          const { coords } = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });

          const { latitude, longitude, speed } = coords;
          const currentSpeedInKmh = speed ? (speed * 3.6).toFixed(2) : 0;
          setCurrentLocation(`Latitude: ${latitude}, Longitude: ${longitude}`);
          setCurrentSpeed(currentSpeedInKmh);

          const reverseGeocode = await Location.reverseGeocodeAsync({
            latitude,
            longitude,
          });
          if (reverseGeocode.length > 0) {
            const locationInfo = reverseGeocode[0];
            const street =
              locationInfo.name || locationInfo.street || "Unknown Street";
            const neighborhood =
              locationInfo.subregion || "Unknown Neighborhood";
            const city = locationInfo.city || "Unknown City";
            const country = locationInfo.country || "Unknown Country";

            setLocationName(`${street}, ${neighborhood}, ${city}, ${country}`);
          } else {
            setLocationName("Location name not available");
          }

          // Check for accident based on speed difference
          if (currentSpeedInKmh - tempSpeed >= 4 && !emailSent) {
            // Speed increased by 2 km/h and email has not been sent recently
            setSpeedWarning("Warning: Significant speed change detected!");
            await sendEmailNotification(); // Send email
            setEmailSent(true); // Set the email sent status to true
          } else {
            setSpeedWarning("");
          }

          // Update tempSpeed after checking
          setTempSpeed(currentSpeedInKmh);
        } catch (error) {
          console.error("Error getting location:", error);
          Alert.alert("Error", "Unable to get location.");
        }
      };

      getLocation(); // Fetch location initially
      const interval = setInterval(getLocation, 4000);

      return () => clearInterval(interval); // Clean up interval on unmount
    };

    requestLocationPermission();
  }, [tempSpeed, currentSpeed]); // Add tempSpeed and currentSpeed as dependencies

  const sendEmailNotification = async () => {
    if (
      !userDetails ||
      !userDetails.emergencyContacts ||
      userDetails.emergencyContacts.length === 0
    )
      return;

    const templateParams = {
      user_name: userDetails.fullName,
      status: status,
      latitude: currentLocation.split(",")[0].split(":")[1].trim(),
      longitude: currentLocation.split(",")[1].split(":")[1].trim(),
      location_name: locationName,
      speed: currentSpeed,
      vehicle_info: userDetails.vehicleInfo,
      emergency_message: "Immediate action required!",
    };

    const contacts = userDetails.emergencyContacts;
    const emailPromises = contacts.map(async (contact) => {
      try {
        const response = await emailjs.send(
          "service_v47d708", // Replace with your actual service ID
          "template_ngshg1f", // Replace with your actual template ID
          { ...templateParams, to_email: contact.contact }, // Merge templateParams with contact email
          "Evcn8Q0PznkFUQy52" // Replace with your actual public key (user ID)
        );
        console.log(
          "Email sent successfully to",
          contact.contact,
          ":",
          response
        );
      } catch (error) {
        console.error("Error sending email to", contact.contact, ":", error);
      }
    });

    // Wait for all email sending promises to complete
    await Promise.all(emailPromises);
  };

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
