import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import AddHabitScreen from '../screens/AddHabitScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'My Habits' }}
        />
        <Stack.Screen 
          name="AddHabit" 
          component={AddHabitScreen} 
          options={{ title: 'Add New Habit' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
} 