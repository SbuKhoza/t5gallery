import { Image } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRef, useState, useEffect } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, Pressable, Alert } from 'react-native';
import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import { Camera, SwitchCamera, RefreshCw } from 'lucide-react-native'; // Using lucide icons

export default function CameraScreen() {
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [picture, setPic] = useState(null);
  const camera = useRef(null);
  const [db, setDb] = useState(null);

  // Initialize database
  useEffect(() => {
    const initDatabase = async () => {
      try {
        const database = await SQLite.openDatabaseAsync('photos.db');
        await database.execAsync(`
          CREATE TABLE IF NOT EXISTS photos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uri TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
          );
        `);
        setDb(database);
      } catch (error) {
        console.error('Database initialization error:', error);
        Alert.alert('Database Error', 'Failed to initialize database');
      }
    };

    initDatabase();
  }, []);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  const takePicture = async () => {
    const options = {
      base64: true,
      exif: false,
      quality: 1,
    };

    try {
      const pic = await camera.current.takePictureAsync(options);
      setPic(pic);
    } catch (error) {
      console.error('Failed to take picture:', error);
      Alert.alert('Camera Error', 'Failed to take picture');
    }
  };

  const sendPic = async () => {
    if (!picture || !db) return;

    try {
      // Generate a unique filename
      const fileName = `image_${Date.now()}.jpg`;
      const destinationUri = `${FileSystem.documentDirectory}${fileName}`;

      // Move the image to app's document directory
      await FileSystem.moveAsync({
        from: picture.uri,
        to: destinationUri
      });

      // Save image path to database
      await db.runAsync(
        'INSERT INTO photos (uri) VALUES (?)',
        destinationUri
      );

      Alert.alert('Success', 'Image saved successfully');
      setPic(null);
    } catch (error) {
      console.error('Error saving image:', error);
      Alert.alert('Save Error', 'Failed to save image');
    }
  };

  const retakePicture = () => {
    setPic(null);
  };

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  if (picture)
    return (
      <View style={styles.imgCont}>
        <Image
          source={{ uri: picture.uri }}
          style={styles.image} 
        />
        <View style={styles.bottomButtonContainer}>
          <TouchableOpacity 
            onPress={sendPic} 
            style={[styles.iconButton, styles.sendButton]}
          > 
            <Camera color="white" size={24} />
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={retakePicture} 
            style={[styles.iconButton, styles.retakeButton]}
          > 
            <RefreshCw color="white" size={24} />
            <Text style={styles.buttonText}>Retake</Text>
          </TouchableOpacity>
        </View>
      </View>
    );

  return (
    <View style={styles.container}>
      <CameraView 
        ref={camera} 
        style={styles.camera} 
        facing={facing}
      >
        <View style={styles.bottomButtonContainer}>
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={toggleCameraFacing}
          >
            <SwitchCamera color="white" size={24} />
            <Text style={styles.buttonText}>Flip</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={takePicture}
          >
            <Camera color="white" size={32} />
            <Text style={styles.buttonText}>Capture</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'black',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    color: 'white',
  },
  camera: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  imgCont: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '80%',
    resizeMode: 'contain',
  },
  bottomButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 30,
    marginBottom: 20,
    marginHorizontal: 20,
  },
  iconButton: {
    padding: 15,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column', // Stack icon and text vertically
    minWidth: 100, // Ensure buttons have consistent width
  },
  buttonText: {
    color: 'white',
    marginTop: 5, // Space between icon and text
    fontSize: 12,
  },
  sendButton: {
    backgroundColor: 'green',
    marginRight: 5,
  },
  retakeButton: {
    backgroundColor: 'red',
    marginLeft: 5,
  },
});