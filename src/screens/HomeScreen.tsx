import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Habit } from '../types/habit';

export default function HomeScreen({ navigation }: any) {
  const [habits, setHabits] = useState<Habit[]>([]);

  useEffect(() => {
    loadHabits();
  }, []);

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

  const renderHabit = ({ item }: { item: Habit }) => (
    <View style={styles.habitItem}>
      <Text style={styles.habitName}>{item.name}</Text>
      <Text style={styles.streak}>Streak: {item.streak} days</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={habits}
        renderItem={renderHabit}
        keyExtractor={item => item.id}
        style={styles.list}
      />
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddHabit')}
      >
        <Text style={styles.addButtonText}>Add Habit</Text>
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
  list: {
    flex: 1,
  },
  habitItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  habitName: {
    fontSize: 18,
    fontWeight: '500',
  },
  streak: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
}); 