import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useFirebase } from "../Firebase/firebaseContext.jsx";

const ContactsScreen = () => {
  const {
    user,
    getUserDetailsByEmail,
    addContactToUser,
    removeContactFromUser,
  } = useFirebase();
  const [contacts, setContacts] = useState([]);
  const [newContact, setNewContact] = useState("");

  useEffect(() => {
    if (user) {
      fetchContacts();
    }
  }, [user]);

  const fetchContacts = async () => {
    try {
      const userDetails = await getUserDetailsByEmail(user.email);
      if (userDetails && userDetails.emergencyContacts) {
        // Extract only the 'contact' field from each entry in the array
        const contactList = userDetails.emergencyContacts
          .map((contactEntry) => {
            if (typeof contactEntry.contact === "string") {
              return contactEntry.contact;
            } else if (
              typeof contactEntry === "object" &&
              contactEntry.contact
            ) {
              return contactEntry.contact.contact;
            }
            return null;
          })
          .filter((contact) => contact !== null); // Filter out any null values

        setContacts(contactList);
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };

  const handleAddContact = async () => {
    if (!newContact) return;
    try {
      const contactObject = { contact: newContact, counter: 0 }; // Create contact object with counter initialized to 0
      await addContactToUser(user.uid, contactObject);
      setNewContact("");
      fetchContacts(); // Refresh contacts
    } catch (error) {
      console.error("Error adding contact:", error);
    }
  };

  const handleRemoveContact = async (contact) => {
    try {
      await removeContactFromUser(user.uid, contact);
      fetchContacts(); // Refresh contacts
    } catch (error) {
      console.error("Error removing contact:", error);
    }
  };

  return (
    <LinearGradient colors={["#002b36", "#005f73"]} style={styles.container}>
      <View style={styles.innerContainer}>
        <Text style={styles.title}>Emergency Contacts</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#aaa"
          keyboardType="email-address"
          value={newContact}
          onChangeText={setNewContact}
        />
        <TouchableOpacity
          style={styles.contactButton}
          onPress={handleAddContact}
        >
          <Text style={styles.buttonText}>Add Contact</Text>
        </TouchableOpacity>
        <FlatList
          data={contacts}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.contactItem}>
              <Text style={styles.contactText}>{item}</Text>
              <TouchableOpacity
                style={styles.button}
                onPress={() => handleRemoveContact(item)}
              >
                <Text style={styles.buttonText}>Remove</Text>
              </TouchableOpacity>
            </View>
          )}
        />
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
    padding: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    width: "100%",
    fontSize: 16,
    color: "#333",
  },
  contactItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    width: "100%",
    textAlign: "center",
  },
  contactText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#ff9800",
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 5,
    marginRight: 5,
    alignItems: "center",
    elevation: 3, // Shadow for Android
    shadowColor: "#000", // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    width: 130,
  },
  contactButton: {
    backgroundColor: "#87CEEB", // Soft green color that blends well with the theme
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 10,
    alignItems: "center",
    elevation: 3, // Shadow for Android
    shadowColor: "#000", // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    width: 250,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#002b36",
  },
});

export default ContactsScreen;
