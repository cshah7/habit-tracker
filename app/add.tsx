import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../src/config/firebase';
import { router } from 'expo-router';

export default function AddHabitScreen() {
  const [habitName, setHabitName] = useState('');

  const handleAddHabit = async () => {
    if (!habitName.trim()) {
      Alert.alert('Error', 'Please enter a habit name');
      return;
    }

    try {
      await addDoc(collection(db, 'habits'), {
        name: habitName,
        createdAt: new Date(),
        streak: 0,
      });
      router.push('/');
    } catch (error) {
      console.error('Error adding habit:', error);
      Alert.alert('Error', 'Failed to add habit');
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
      <TouchableOpacity style={styles.button} onPress={handleAddHabit}>
        <Text style={styles.buttonText}>Add Habit</Text>
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