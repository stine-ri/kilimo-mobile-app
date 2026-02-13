import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import OTPScreen from '../screens/OTPScreen';
import FormScreen from '../screens/FormScreen';
import SubmissionsScreen from '../screens/submissionsScreen';
import SubmissionDetailScreen from '../screens/submissionDetailsScreen';
const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{
          headerShown: false
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="OTP" component={OTPScreen} />
        <Stack.Screen name="Form" component={FormScreen} />
        <Stack.Screen name="Submissions" component={SubmissionsScreen} />
        <Stack.Screen name="SubmissionDetail" component={SubmissionDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}