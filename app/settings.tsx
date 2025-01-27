import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Platform } from 'react-native';
import { collection, getDocs, query, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../src/config/firebase';
import { Habit } from '../src/types/habit';
import { Ionicons } from '@expo/vector-icons';
import { router, Link } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

export default function SettingsScreen() {
  const [habits, setHabits] = useState<Habit[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      loadHabits();
    }, [])
  );

  const loadHabits = async () => {
    try {
      const habitsQuery = query(collection(db, 'habits'));
      const querySnapshot = await getDocs(habitsQuery);
      const habitsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Habit));
      setHabits(habitsList);
    } catch (error) {
      console.error('Error loading habits:', error);
    }
  };

  const handleDelete = (habit: Habit) => {
    const deleteHabit = async () => {
      try {
        const habitRef = doc(db, 'habits', habit.id);
        await deleteDoc(habitRef);
        loadHabits(); // Refresh the list
      } catch (error) {
        console.error('Error deleting habit:', error);
        Alert.alert('Error', 'Failed to delete habit');
      }
    };

    // For web, use window.confirm instead of Alert.alert
    if (Platform.OS === 'web') {
      if (window.confirm(`Are you sure you want to delete "${habit.name}"?`)) {
        deleteHabit();
      }
    } else {
      Alert.alert(
        "Delete Habit",
        `Are you sure you want to delete "${habit.name}"?`,
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: deleteHabit
          }
        ],
        { cancelable: true }
      );
    }
  };

  const renderHabit = ({ item }: { item: Habit }) => (
    <View style={styles.habitItem}>
      <Text style={styles.habitName}>{item.name}</Text>
      <View style={styles.actions}>
        <TouchableOpacity 
          onPress={() => router.push({
            pathname: '/edit',
            params: { id: item.id, name: item.name }
          })}
          style={styles.actionButton}
        >
          <Ionicons name="pencil" size={20} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => handleDelete(item)}
          style={styles.actionButton}
        >
          <Ionicons name="trash-outline" size={20} color="#dc3545" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Habits</Text>
      <FlatList
        data={habits}
        renderItem={renderHabit}
        keyExtractor={item => item.id}
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
  },
  list: {
    flex: 1,
  },
  habitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  habitName: {
    fontSize: 16,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 15,
  },
  actionButton: {
    padding: 5,
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
}); 