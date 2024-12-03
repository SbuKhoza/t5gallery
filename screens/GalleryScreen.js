import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, FlatList, Dimensions } from 'react-native';
import * as SQLite from 'expo-sqlite';

export default function GalleryScreen() {
  const [photos, setPhotos] = useState([]);
  const [db, setDb] = useState(null);

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

  useEffect(() => {
    const fetchPhotos = async () => {
      if (!db) return;

      try {
        // Fetch all photos, most recent first
        const result = await db.getAllAsync('SELECT * FROM photos ORDER BY timestamp DESC');
        setPhotos(result);
      } catch (error) {
        console.error('Error fetching photos:', error);
      }
    };

    fetchPhotos();
  }, [db]);

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