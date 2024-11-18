import React, { useRef, useState } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, Pressable, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const CounterScreen = ({ navigation }: { navigation: any }) => {
  const [total, setTotal] = useState(0);
  const [history, setHistory] = useState<number[]>([]);
  const [redoStack, setRedoStack] = useState<number[]>([]);
  let workoutStartTime = useRef<Date>(new Date);
  const [workoutStopwatch, setWorkoutStopwatch] = useState<string>("00:00:00");
  const workoutInterval = useRef<NodeJS.Timeout | null>(null);
  let restStartTime = useRef<Date>(new Date);
  const [restStopwatch, setRestStopwatch] = useState<string>("00:00:00");
  const restInterval = useRef<NodeJS.Timeout | null>(null);
  const [trainingActive, setTrainingActive] = useState<boolean>(false);
  const [antiDoubleTap, setAntiDoubleTap] = useState<boolean>(false);

  const handleAddPullups = async (amount: number) => {
    setHistory([...history, total]); // Save current total to history for undo
    setRedoStack([]); // Clear redo stack when a new action is performed
    setTotal(total + amount);

    // Reset stopwatch for rest between sets
    restStartTime.current = new Date();
    setRestStopwatch("00:00:00");

    // Prevent anti double tap
    setAntiDoubleTap(true);
    setTimeout(() => {
      setAntiDoubleTap(false);
    }, 1000);
  };

  const handleUndo = () => {
    if (history.length > 0) {
      const lastTotal = history[history.length - 1];
      setRedoStack([total, ...redoStack]); // Save current total for redo
      setHistory(history.slice(0, -1)); // Remove the last history entry
      setTotal(lastTotal);
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const lastRedo = redoStack[0];
      setHistory([...history, total]); // Save current total for undo
      setRedoStack(redoStack.slice(1)); // Remove the last redo entry
      setTotal(lastRedo);
    }
  };

  const confirmSubmit = () => {
    Alert.alert(
      'Confirm Submission',
      `Are you sure you want to submit ${total} pull-ups for this session?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: handleSubmit,
        },
      ],
    );
  };

  const handleSubmit = async () => {
    const session = { date: new Date().toISOString(), pullups: total, time: workoutStopwatch };
    const storedHistory = JSON.parse(await AsyncStorage.getItem('history') || '[]');
    await AsyncStorage.setItem('history', JSON.stringify([...storedHistory, session]));
    setTrainingActive(false);
    setTotal(0); // Reset total after submitting
    setAntiDoubleTap(false);

    // Clear undo/redo history
    setHistory([]);
    setRedoStack([]);

    // Clear intervals
    if (workoutInterval.current) { 
      clearInterval(workoutInterval.current); 
      setWorkoutStopwatch("00:00:00");
    }

    if (restInterval.current) {
      clearInterval(restInterval.current); 
      setRestStopwatch("00:00:00");
    }

    //await AsyncStorage.clear(); // Clear history if needed

    navigation.navigate('History');
  };

  const startWorkout = () => {
    setTrainingActive(true);

    // Set workout interval
    workoutStartTime.current = new Date();
    workoutInterval.current = setInterval(() => {
      let currentTime = new Date();
      const timeDifference = (currentTime.getTime() - workoutStartTime.current.getTime());
      setWorkoutStopwatch(formatTime(timeDifference));
    }, 1000);

    // Set interval for rest between sets
    restStartTime.current = new Date();
    restInterval.current = setInterval(() => {
      let currentTime = new Date();
      const timeDifference = (currentTime.getTime() - restStartTime.current.getTime());
      setRestStopwatch(formatTime(timeDifference));
    }, 1000)
  };

  const formatTime = (duration: number): string => {
    let seconds: number = Math.floor((duration / 1000) % 60),
      minutes: number = Math.floor((duration / (1000 * 60)) % 60),
      hours: number = Math.floor((duration / (1000 * 60 * 60)) % 24);

    let hoursStr: string = (hours < 10) ? "0" + hours : hours.toString();
    let minutesStr: string = (minutes < 10) ? "0" + minutes : minutes.toString();
    let secondsStr: string = (seconds < 10) ? "0" + seconds : seconds.toString();

    return hoursStr + ":" + minutesStr + ":" + secondsStr;
  }

  const isNumericButtonDisabled = () : boolean => {
    return !trainingActive || antiDoubleTap;
  }


  return (
    <View style={styles.container}>
      <Text style={styles.text}>{workoutStopwatch}</Text>
      <Text style={styles.text}>{restStopwatch}</Text>
      <Text style={styles.text}>Total Pull-ups: {total}</Text>

      <View style={styles.buttonRow}>
        {[1, 2, 3].map((num) => (
          <TouchableOpacity key={num} style={[styles.button, {opacity: (isNumericButtonDisabled() ? 0.3 : 1)}]} onPress={() => handleAddPullups(num)} disabled={isNumericButtonDisabled()}>
            <Text style={styles.buttonText}>{num}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.buttonRow}>
        {[4, 5, 6].map((num) => (
          <TouchableOpacity key={num} style={[styles.button, {opacity: (isNumericButtonDisabled() ? 0.3 : 1)}]} onPress={() => handleAddPullups(num)} disabled={isNumericButtonDisabled()}>
            <Text style={styles.buttonText}>{num}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.buttonRow}>
        {[7, 8, 9].map((num) => (
          <TouchableOpacity key={num} style={[styles.button, {opacity: (isNumericButtonDisabled() ? 0.3 : 1)}]} onPress={() => handleAddPullups(num)} disabled={isNumericButtonDisabled()}>
            <Text style={styles.buttonText}>{num}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.controls}>
        <Button title="Undo" onPress={handleUndo} disabled={history.length === 0} />
        <Button title="Redo" onPress={handleRedo} disabled={redoStack.length === 0} />
      </View>

      <View style={styles.navigationButtonsContainer}>
        <Pressable style={[styles.navigationButton, {backgroundColor: '#4CAF50'}, {opacity: (trainingActive ? 0.3 : 1)}]} onPress={startWorkout} disabled={trainingActive} >
          <Icon name="play-circle-outline" size={45} style={{ color: "white" }}/>
        </Pressable>
        <Pressable style={[styles.navigationButton, {backgroundColor: '#E32636'}]} onPress={confirmSubmit} >
          <Icon name="stop-circle-outline" size={45} style={{ color: "white" }}/>
        </Pressable>
        <Pressable style={[styles.navigationButton, {backgroundColor: '#FFAA33'}]} onPress={() => navigation.navigate('History')}>
          <Icon name="history" size={45} style={{ color: "white" }}/>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 28, marginBottom: 20 },
  buttonRow: { flexDirection: 'row', justifyContent: 'center', marginVertical: 0 },
  button: { backgroundColor: '#4CAF50', padding: 30, margin: 5, borderRadius: 5 },
  buttonText: { fontSize: 20, color: 'white' },
  controls: { flexDirection: 'row', justifyContent: 'space-between', width: '60%', marginVertical: 20 },
  navigationButtonsContainer: {display: "flex", flexDirection: "row"},
  navigationButton: { padding: 5, margin: 10, borderRadius: 5 }
});

export default CounterScreen;