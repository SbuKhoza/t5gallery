import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, RefreshControl, ScrollView } from 'react-native';
import { useRefresh } from '../components/RefreshContext';

export default function ProfileScreen() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [profileData, setProfileData] = useState(null);
  
  // Use the refresh context
  const { refreshKey } = useRefresh();

  const fetchProfileData = async () => {
    try {
      setIsRefreshing(true);
      // Simulate profile data fetching
      // Replace this with your actual profile data fetching logic
      const data = await new Promise(resolve => {
        setTimeout(() => {
          resolve({
            name: 'Sbuda Malloya',
            email: 'sbudamalloya@gmail.com',
            joinDate: '2023-01-15',
            // lastActive: new Date().toLocaleString()
          });
        }, 1000);
      });
      
      setProfileData(data);
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Fetch data on component mount and when refresh key changes
  useEffect(() => {
    fetchProfileData();
  }, [refreshKey]);

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={fetchProfileData}
        />
      }
    >
      {profileData ? (
        <View>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.label}>Name: {profileData.name}</Text>
          <Text style={styles.label}>Email: {profileData.email}</Text>
          <Text style={styles.label}>Join Date: {profileData.joinDate}</Text>
          <Text style={styles.subtitle}>Last Active: {profileData.lastActive}</Text>
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
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: 'gray',
    marginTop: 10,
  }
});