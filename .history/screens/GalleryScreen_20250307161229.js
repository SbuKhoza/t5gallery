import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  FlatList, 
  Dimensions, 
  Button, 
  RefreshControl,
  Modal,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  TextInput
} from 'react-native';
import * as SQLite from 'expo-sqlite';
import { useRefresh } from '../components/RefreshContext'; //useRefresh hook
import MapView, { Marker } from 'react-native-maps';

export default function GalleryScreen() {
  const [photos, setPhotos] = useState([]);
  const [db, setDb] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState('');
  const [showMap, setShowMap] = useState(false);
  
  // Use the refresh context
  const { refreshKey, triggerRefresh } = useRefresh();

  useEffect(() => {
    const openDatabase = async () => {
      try {
        const database = await SQLite.openDatabaseAsync('photos.db');
        // Make sure the latitude and longitude columns exist
        await database.execAsync(`
          PRAGMA table_info(photos);
          ALTER TABLE photos ADD COLUMN IF NOT EXISTS latitude REAL;
          ALTER TABLE photos ADD COLUMN IF NOT EXISTS longitude REAL;
          ALTER TABLE photos ADD COLUMN IF NOT EXISTS name TEXT;
        `);
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

  const openFullScreen = (item) => {
    const index = photos.findIndex(photo => photo.id === item.id);
    setCurrentImageIndex(index);
    setFullScreenImage(item);
    setNewName(item.name || '');
    setShowMap(false);
  };

  const closeFullScreen = () => {
    setFullScreenImage(null);
    setIsRenaming(false);
    setShowMap(false);
  };

  const toggleMap = () => {
    setShowMap(!showMap);
  };

  const goToNextImage = () => {
    if (currentImageIndex < photos.length - 1) {
      const nextIndex = currentImageIndex + 1;
      setCurrentImageIndex(nextIndex);
      setFullScreenImage(photos[nextIndex]);
      setNewName(photos[nextIndex].name || '');
      setIsRenaming(false);
      setShowMap(false);
    }
  };

  const goToPreviousImage = () => {
    if (currentImageIndex > 0) {
      const prevIndex = currentImageIndex - 1;
      setCurrentImageIndex(prevIndex);
      setFullScreenImage(photos[prevIndex]);
      setNewName(photos[prevIndex].name || '');
      setIsRenaming(false);
      setShowMap(false);
    }
  };

  const deleteImage = async () => {
    if (!db || !fullScreenImage) return;

    Alert.alert(
      "Delete Image",
      "Are you sure you want to delete this image?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await db.runAsync('DELETE FROM photos WHERE id = ?', [fullScreenImage.id]);
              closeFullScreen();
              triggerRefresh(); // Use the triggerRefresh function from context
            } catch (error) {
              console.error('Error deleting photo:', error);
              Alert.alert("Error", "Failed to delete the image.");
            }
          }
        }
      ]
    );
  };

  const startRenaming = () => {
    setIsRenaming(true);
  };

  const saveNewName = async () => {
    if (!db || !fullScreenImage) return;

    try {
      await db.runAsync('UPDATE photos SET name = ? WHERE id = ?', [newName, fullScreenImage.id]);
      
      // Update the local state
      const updatedPhotos = photos.map(photo => 
        photo.id === fullScreenImage.id ? {...photo, name: newName} : photo
      );
      setPhotos(updatedPhotos);
      
      // Update the fullScreenImage state
      setFullScreenImage({...fullScreenImage, name: newName});
      
      setIsRenaming(false);
    } catch (error) {
      console.error('Error renaming photo:', error);
      Alert.alert("Error", "Failed to rename the image.");
    }
  };

  const renderPhoto = ({ item }) => (
    <TouchableOpacity 
      style={styles.photoContainer}
      onPress={() => openFullScreen(item)}
    >
      <Image 
        source={{ uri: item.uri }} 
        style={styles.photo} 
        resizeMode="cover"
      />
      {item.name && (
        <View style={styles.photoNameContainer}>
          <Text style={styles.photoName} numberOfLines={1}>{item.name}</Text>
        </View>
      )}
      {item.latitude && item.longitude && (
        <View style={styles.locationPinContainer}>
          <View style={styles.locationPin} />
        </View>
      )}
    </TouchableOpacity>
  );

  // Check if the current image has location data
  const hasLocation = fullScreenImage?.latitude && fullScreenImage?.longitude;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
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

      {/* Full Screen Image Modal */}
      <Modal
        visible={fullScreenImage !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={closeFullScreen}
      >
        <SafeAreaView style={styles.fullScreenContainer}>
          {/* Close button */}
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={closeFullScreen}
          >
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
          
          {/* Navigation buttons */}
          <View style={styles.navigationContainer}>
            <TouchableOpacity 
              style={[styles.navButton, currentImageIndex === 0 && styles.disabledButton]}
              onPress={goToPreviousImage}
              disabled={currentImageIndex === 0}
            >
              <Text style={styles.navButtonText}>←</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.navButton, currentImageIndex === photos.length - 1 && styles.disabledButton]}
              onPress={goToNextImage}
              disabled={currentImageIndex === photos.length - 1}
            >
              <Text style={styles.navButtonText}>→</Text>
            </TouchableOpacity>
          </View>
          
          {/* Map toggle button */}
          {hasLocation && (
            <TouchableOpacity 
              style={styles.mapToggleButton}
              onPress={toggleMap}
            >
              <Text style={styles.mapToggleText}>
                {showMap ? 'Show Photo' : 'Show Map'}
              </Text>
            </TouchableOpacity>
          )}
          
          {/* Content area - either map or image */}
          {showMap && hasLocation ? (
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: fullScreenImage.latitude,
                  longitude: fullScreenImage.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
              >
                <Marker
                  coordinate={{
                    latitude: fullScreenImage.latitude,
                    longitude: fullScreenImage.longitude,
                  }}
                  title={fullScreenImage.name || 'Photo location'}
                />
              </MapView>
            </View>
          ) : (
            fullScreenImage && (
              <Image
                source={{ uri: fullScreenImage.uri }}
                style={styles.fullScreenImage}
                resizeMode="contain"
              />
            )
          )}
          
          {/* Bottom controls */}
          <View style={styles.controlsContainer}>
            {isRenaming ? (
              <View style={styles.renameContainer}>
                <TextInput
                  style={styles.renameInput}
                  value={newName}
                  onChangeText={setNewName}
                  placeholder="Enter image name"
                  placeholderTextColor="#999"
                  autoFocus
                />
                
                <View style={styles.renameButtons}>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.cancelButton]}
                    onPress={() => setIsRenaming(false)}
                  >
                    <Text style={styles.actionButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.saveButton]}
                    onPress={saveNewName}
                  >
                    <Text style={styles.actionButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <>
                <Text style={styles.imageName}>
                  {fullScreenImage?.name || 'Unnamed image'}
                </Text>
                
                <View style={styles.actionButtonsRow}>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.renameButton]}
                    onPress={startRenaming}
                  >
                    <Text style={styles.actionButtonText}>Rename</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={deleteImage}
                  >
                    <Text style={styles.actionButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </SafeAreaView>
      </Modal>
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
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  photo: {
    flex: 1,
    width: undefined,
    height: undefined,
  },
  photoNameContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 4,
  },
  photoName: {
    color: 'white',
    fontSize: 10,
    textAlign: 'center',
  },
  locationPinContainer: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationPin: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height - 160, // Leave space for controls
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
  },
  navigationContainer: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    zIndex: 5,
  },
  navButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
  },
  navButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  mapToggleButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  mapToggleText: {
    color: 'white',
    fontWeight: 'bold',
  },
  mapContainer: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height - 160,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  disabledButton: {
    opacity: 0.3,
  },
  controlsContainer: {
    position: 'absolute',