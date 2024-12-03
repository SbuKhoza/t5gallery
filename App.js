import React from 'react';
import { StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import screens from the screens folder
import { 
  HomeScreen, 
  CameraScreen, 
  GalleryScreen, 
  ProfileScreen 
} from './screens';

// Create the bottom tab navigator
const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;

            switch (route.name) {
              case 'Home':
                iconName = 'home';
                break;
              case 'Camera':
                iconName = 'camera';
                break;
              case 'Gallery':
                iconName = 'images';
                break;
              case 'Profile':
                iconName = 'person';
                break;
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: styles.tabBar.activeTintColor,
          tabBarInactiveTintColor: styles.tabBar.inactiveTintColor,
          tabBarStyle: styles.tabBar.style,
          tabBarLabelStyle: styles.tabBar.labelStyle,
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Camera" component={CameraScreen} />
        <Tab.Screen name="Gallery" component={GalleryScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    activeTintColor: '#ede7f6', // Active tab color (pink)
    inactiveTintColor: 'white',  // Inactive tab color (gray)
    style: {
      backgroundColor: '#3f51b5', // Tab bar background color (dark)
      borderTopColor: 'transparent', // Remove border at top
      height: 60, // Increase height
      paddingBottom: 10, // Add padding to the bottom
    },
    labelStyle: {
      fontSize: 12,  // Label font size
      fontWeight: 'bold',  // Label font weight
      marginBottom: 5,  // Space between icon and label
    },
  },
});