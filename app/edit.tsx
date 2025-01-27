import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../src/config/firebase';
import { router, useLocalSearchParams } from 'expo-router';

export default function EditHabitScreen() {
  const { id, name: initialName } = useLocalSearchParams();
  const [habitName, setHabitName] = useState(initialName as string);

  const handleEditHabit = async () => {
    if (!habitName.trim()) {
      Alert.alert('Error', 'Please enter a habit name');
      return;
    }

    try {
      const habitRef = doc(db, 'habits', id as string);
      await updateDoc(habitRef, {
        name: habitName,
      });
      router.back();
    } catch (error) {
      console.error('Error editing habit:', error);
      Alert.alert('Error', 'Failed to edit habit');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={habitName}
        onChangeText={setHabitName}
        placeholder="Enter habit name"
        autoFocus
      />
      <TouchableOpacity style={styles.button} onPress={handleEditHabit}>
        <Text style={styles.buttonText}>Save Changes</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
}); 