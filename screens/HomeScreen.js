import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, RefreshControl, ScrollView } from 'react-native';
import { useRefresh } from '../components/RefreshContext';

export default function HomeScreen() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [homeData, setHomeData] = useState(null);
  
  // Use the refresh context
  const { refreshKey } = useRefresh();

  const fetchHomeData = async () => {
    try {
      setIsRefreshing(true);
      // Simulate data fetching
      // Replace this with your actual data fetching logic
      const data = await new Promise(resolve => {
        setTimeout(() => {
          resolve({
            welcomeMessage: 'Welcome to the App!',
            timestamp: new Date().toLocaleString()
          });
        }, 1000);
      });
      
      setHomeData(data);
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Fetch data on component mount and when refresh key changes
  useEffect(() => {
    fetchHomeData();
  }, [refreshKey]);

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={fetchHomeData}
        />
      }
    >
      {homeData ? (
        <View>
          <Text style={styles.title}>{homeData.welcomeMessage}</Text>
          <Text style={styles.subtitle}>Last updated: {homeData.timestamp}</Text>
        </View>
      ) : (
        <Text>Loading...</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'gray',
  }
});