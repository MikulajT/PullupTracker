import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import CounterScreen from './src/screens/CounterScreen';
import HistoryScreen from './src/screens/HistoryScreen';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Counter">
        <Stack.Screen name="Counter" component={CounterScreen} options={{ title: 'Pull-Up Counter' }} />
        <Stack.Screen name="History" component={HistoryScreen} options={{ title: 'Training History' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;