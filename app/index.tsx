import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { collection, getDocs, query, doc, updateDoc, arrayUnion, arrayRemove, deleteDoc } from 'firebase/firestore';
import { db } from '../src/config/firebase';
import { Habit } from '../src/types/habit';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

export default function HomeScreen() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completedHabits, setCompletedHabits] = useState<Set<string>>(new Set());
  const router = useRouter();

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

      // Set completed habits for today
      const today = new Date().toISOString().split('T')[0];
      const completedToday = new Set<string>();
      habitsList.forEach(habit => {
        if (habit.completedDates?.includes(today)) {
          completedToday.add(habit.id);
        }
      });
      setCompletedHabits(completedToday);
    } catch (error) {
      console.error('Error loading habits:', error);
    }
  };

  const calculateStreak = (completedDates: string[] = []) => {
    if (!completedDates.length) return 0;

    // Sort dates in ascending order
    const sortedDates = [...completedDates].sort();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let currentStreak = 1;
    let lastDate = new Date(sortedDates[sortedDates.length - 1]);

    // If the last completion wasn't yesterday or today, streak is broken
    if (lastDate < yesterday) {
      return 0;
    }

    // Count consecutive days backwards from the last completion
    for (let i = sortedDates.length - 2; i >= 0; i--) {
      const currentDate = new Date(sortedDates[i]);
      const expectedDate = new Date(lastDate);
      expectedDate.setDate(expectedDate.getDate() - 1);

      if (currentDate.toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
        currentStreak++;
        lastDate = currentDate;
      } else {
        break;
      }
    }

    return currentStreak;
  };

  const toggleHabit = async (habit: Habit) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const newCompleted = new Set(completedHabits);
      const habitRef = doc(db, 'habits', habit.id);
      const completedDates = habit.completedDates || [];
      
      if (newCompleted.has(habit.id)) {
        // Unchecking - remove today's date
        newCompleted.delete(habit.id);
        await updateDoc(habitRef, {
          completedDates: arrayRemove(today),
          streak: calculateStreak(completedDates.filter(date => date !== today))
        });
      } else {
        // Checking - add today's date if not already present
        if (!completedDates.includes(today)) {
          newCompleted.add(habit.id);
          const newDates = [...completedDates, today];
          await updateDoc(habitRef, {
            completedDates: arrayUnion(today),
            streak: calculateStreak(newDates)
          });
        }
      }
      
      setCompletedHabits(newCompleted);
      // Reload habits to get updated data
      loadHabits();
    } catch (error) {
      console.error('Error updating habit:', error);
    }
  };

  const handleDelete = (habit: Habit) => {
    console.log('Attempting to delete habit:', habit.id);
    
    if (!habit || !habit.id) {
      console.error('Invalid habit data');
      return;
    }

    const deleteHabit = async () => {
      try {
        console.log('Delete confirmed for habit:', habit.id);
        const habitRef = doc(db, 'habits', habit.id);
        await deleteDoc(habitRef);
        console.log('Habit deleted from Firebase');
        
        // Update local state immediately
        setHabits(currentHabits => 
          currentHabits.filter(h => h.id !== habit.id)
        );
        
        // Also remove from completed habits if it was completed
        setCompletedHabits(current => {
          const newSet = new Set(current);
          newSet.delete(habit.id);
          return newSet;
        });
        
        console.log('Local state updated');
      } catch (error) {
        console.error('Error in delete operation:', error);
        Alert.alert(
          'Error',
          'Failed to delete habit. Please try again.'
        );
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
      <View style={styles.habitInfo}>
        <View style={styles.nameContainer}>
          <Text style={styles.habitName}>{item.name}</Text>
        </View>
        <Text style={styles.streak}>Streak: {item.streak} days</Text>
      </View>
      <TouchableOpacity 
        style={styles.checkbox}
        onPress={() => toggleHabit(item)}
      >
        {completedHabits.has(item.id) ? (
          <Ionicons name="checkmark-circle" size={28} color="#4CAF50" />
        ) : (
          <Ionicons name="radio-button-off" size={28} color="#666" />
        )}
      </TouchableOpacity>
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
      <Link href="/add" asChild>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>Add Habit</Text>
        </TouchableOpacity>
      </Link>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  habitInfo: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  habitName: {
    fontSize: 18,
    fontWeight: '500',
    marginRight: 4,
  },
  streak: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  checkbox: {
    marginLeft: 10,
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
  actionIcon: {
    marginTop: 2,
  },
  deleteButton: {
    padding: 4,
  },
}); 