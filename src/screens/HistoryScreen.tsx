import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HistoryScreen = () => {
  const [history, setHistory] = useState<Array<{ date: string, pullups: number, time: string }>>([]);

  useEffect(() => {
    const loadHistory = async () => {
      const historyData = JSON.parse(await AsyncStorage.getItem('history') || '[]');
      setHistory(historyData);
    };

    loadHistory();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Training History</Text>
      <FlatList
        data={history}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={{fontSize: 18}}>{new Date(item.date).toLocaleString()}</Text>
            <Text style={{fontSize: 16}}>Pull-ups: {item.pullups}</Text>
            <Text style={{fontSize: 16}}>Time: {item.time}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  item: { flexDirection: 'column', gap: 5, padding: 10, borderBottomColor: 'gray', borderBottomWidth: 1 },
});

export default HistoryScreen;