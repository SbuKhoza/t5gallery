import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, FlatList, Dimensions, Button, RefreshControl } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { useRefresh } from '../components/RefreshContext'; //useRefresh hook

export default function GalleryScreen() {
  const [photos, setPhotos] = useState([]);
  const [db, setDb] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Use the refresh context
  const { refreshKey } = useRefresh();

  useEffect(() => {
    const openDatabase = async () => {
      try {
        const database = await SQLite.openDatabaseAsync('photos.db');
        setDb(database);
      } catch (error) {
        console.error('Error opening database:', error);
      }
    };
    openDatabase();
  }, []);

  const fetchPhotos = async () => {
    if (!db) return;

    try {
      setIsRefreshing(true);
      // Fetch all photos, most recent first
      const result = await db.getAllAsync('SELECT * FROM photos ORDER BY timestamp DESC');
      
      console.log('Fetched photos:', result);
      console.log('Number of photos:', result.length);
      
      setPhotos(result);
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Use refreshKey to trigger photo fetching
  useEffect(() => {
    fetchPhotos();
  }, [db, refreshKey]);

  const renderPhoto = ({ item }) => (
    <View style={styles.photoContainer}>
      <Image 
        source={{ uri: item.uri }} 
        style={styles.photo} 
        resizeMode="cover"
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {photos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No photos yet</Text>
        </View>
      ) : (
        <FlatList
          data={photos}
          renderItem={renderPhoto}
          keyExtractor={(item) => item.id.toString()}
          numColumns={3}
          contentContainerStyle={styles.gallery}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={fetchPhotos}
            />
          }
        />
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: 'gray',
  },
  gallery: {
    paddingHorizontal: 2,
  },
  photoContainer: {
    flex: 1,
    aspectRatio: 1,
    margin: 2,
  },
  photo: {
    flex: 1,
    width: undefined,
    height: undefined,
  },
});