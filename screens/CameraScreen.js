import { Image } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRef, useState } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, Pressable } from 'react-native';

export default function CameraScreen() {
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [picture, setPic] = useState(null)
  const camera = useRef(null)

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
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
    }

    try {
      const pic = await camera.current.takePictureAsync(options)
      setPic(pic)
    } catch (error) {
      console.error('Failed to take picture:', error)
    }
  }

  const sendPic = () => {
    // Implement your logic to send the picture
    // For example, upload to a server or process the image
    console.log('Sending picture:', picture)
    // Reset picture after sending
    setPic(null)
  }

  const retakePicture = () => {
    setPic(null)
  }

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
        <View style={styles.buttonContainer}>
          <Pressable 
            onPress={sendPic} 
            style={[styles.button, styles.sendButton]}
          > 
            <Text style={styles.buttonText}>Send Picture</Text>
          </Pressable>
          <Pressable 
            onPress={retakePicture} 
            style={[styles.button, styles.retakeButton]}
          > 
            <Text style={styles.buttonText}>Retake</Text>
          </Pressable>
        </View>
      </View>
    )

  return (
    <View style={styles.container}>
      <CameraView 
        ref={camera} 
        style={styles.camera} 
        facing={facing}
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.button} 
            onPress={toggleCameraFacing}
          >
            <Text style={styles.text}>Flip Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.button} 
            onPress={takePicture}
          >
            <Text style={styles.text}>Take Picture</Text>
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
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  imgCont: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '80%',
    resizeMode: 'contain',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  sendButton: {
    backgroundColor: 'green',
  },
  retakeButton: {
    backgroundColor: 'red',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
});