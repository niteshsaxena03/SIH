import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import emailjs from "emailjs-com";
import { useFirebase, db } from "../Firebase/firebaseContext";
import { doc, updateDoc } from "firebase/firestore";

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
          if (currentSpeedInKmh - tempSpeed >= 40 && !emailSent) {
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
      const interval = setInterval(getLocation, 1000);

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

    const contacts = userDetails.emergencyContacts;

    // Iterate over contacts and process only those with counter 0
    const emailPromises = contacts.map(async (contactEntry) => {
      try {
        // Extract the contact email and counter
        const contactEmail = contactEntry.contact.contact.trim(); // Trim extra spaces
        const contactCounter = contactEntry.contact.counter;

        // Prepare email parameters
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

        // Send the email
        await emailjs.send(
          "service_5k8mnrp",
          "template_83esbcf",
          { ...templateParams, to_email: contactEmail },
          "GzXmQG789jj1diqke"
        );
        
        // await emailjs.send(
        //   "service_dvbcq6y",
        //   "template_3qhai87",
        //   { ...templateParams, to_email: contactEmail },
        //   "ZdtL7-XvwQtHAxDzM"
        // );

        console.log("Email sent successfully to", contactEmail);

        // Update the counter to 1 in Firebase
        const userRef = doc(db, "users", user.uid);
        const updatedContacts = contacts.map((contact) =>
          contact.contact.contact.trim() === contactEmail
            ? { ...contact, contact: { ...contact.contact, counter: 1 } } // Update the counter for this contact
            : contact
        );

        await updateDoc(userRef, { emergencyContacts: updatedContacts });

        // Update local state if needed
        setUserDetails({
          ...userDetails,
          emergencyContacts: updatedContacts,
        });
      } catch (error) {
        console.error(
          "Error sending email to",
          contactEntry.contact.contact,
          ":",
          error
        );
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
            <View style={styles.box}>
              <Text style={styles.greeting}>Hi, {userDetails.fullName}</Text>
            </View>
            <View style={styles.box}>
              <Text style={styles.status}>Status: {status}</Text>
            </View>
            <View style={styles.box}>
              <Text style={styles.detail}>Current Location:</Text>
              <Text style={styles.detailValue}>{currentLocation}</Text>
            </View>
            <View style={styles.box}>
              <Text style={styles.detail}>Location Name:</Text>
              <Text style={styles.detailValue}>{locationName}</Text>
            </View>
            <View style={styles.box}>
              <Text style={styles.detail}>Current Speed:</Text>
              <Text style={styles.detailValue}>{currentSpeed} km/h</Text>
            </View>
            <View style={styles.box}>
              <Text style={styles.detail}>Vehicle Info:</Text>
              <Text style={styles.detailValue}>{userDetails.vehicleInfo}</Text>
            </View>
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
    marginTop: 30,
  },
  box: {
    backgroundColor: "#004d40",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    width: "100%",
    borderColor: "#00796b",
    borderWidth: 2,
  },
  greeting: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  status: {
    fontSize: 20,
    color: "#ff9800",
    textAlign: "center",
  },
  detail: {
    fontSize: 18,
    fontWeight: "600",
    color: "#e0f7fa",
    marginBottom: 5,
    textAlign: "left",
  },
  detailValue: {
    fontSize: 18,
    color: "#ffffff",
    textAlign: "left",
  },
  button: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    // marginTop: 10,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    width: 150,
    marginBottom: 30,
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
