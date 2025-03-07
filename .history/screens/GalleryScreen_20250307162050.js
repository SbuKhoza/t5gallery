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

export default function GalleryScreen() {
  const [photos, setPhotos] = useState([]);
  const [db, setDb] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState('');
  
  // Use the refresh context
  const { refreshKey, triggerRefresh } = useRefresh();

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

  const openFullScreen = (item) => {
    const index = photos.findIndex(photo => photo.id === item.id);
    setCurrentImageIndex(index);
    setFullScreenImage(item);
    setNewName(item.name || '');
  };

  const closeFullScreen = () => {
    setFullScreenImage(null);
    setIsRenaming(false);
  };

  const goToNextImage = () => {
    if (currentImageIndex < photos.length - 1) {
      const nextIndex = currentImageIndex + 1;
      setCurrentImageIndex(nextIndex);
      setFullScreenImage(photos[nextIndex]);
      setNewName(photos[nextIndex].name || '');
      setIsRenaming(false);
    }
  };

  const goToPreviousImage = () => {
    if (currentImageIndex > 0) {
      const prevIndex = currentImageIndex - 1;
      setCurrentImageIndex(prevIndex);
      setFullScreenImage(photos[prevIndex]);
      setNewName(photos[prevIndex].name || '');
      setIsRenaming(false);
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
    </TouchableOpacity>
  );

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
          
          {/* Full screen image */}
          {fullScreenImage && (
            <Image
              source={{ uri: fullScreenImage.uri }}
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
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
  disabledButton: {
    opacity: 0.3,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 20,
    alignItems: 'center',
  },
  imageName: {
    color: 'white',
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginHorizontal: 10,
    minWidth: 100,
    alignItems: 'center',
  },
  renameButton: {
    backgroundColor: '#2196F3',
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  cancelButton: {
    backgroundColor: '#757575',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  renameContainer: {
    width: '100%',
    alignItems: 'center',
  },
  renameInput: {
    backgroundColor: 'white',
    width: '80%',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  renameButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
});