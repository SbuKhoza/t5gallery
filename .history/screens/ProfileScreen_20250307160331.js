import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  RefreshControl, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Alert,
  ActivityIndicator,
  Image
} from 'react-native';
import { useRefresh } from '../components/RefreshContext';

export default function ProfileScreen() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedData, setEditedData] = useState({});
  
  // Use the refresh context
  const { refreshKey, triggerRefresh } = useRefresh();

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
            phone: '+27 71 234 5678',
            bio: 'Photography enthusiast and nature lover',
            lastActive: new Date().toLocaleString()
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

  const handleEditProfile = () => {
    setEditedData({
      name: profileData.name,
      email: profileData.email,
      phone: profileData.phone,
      bio: profileData.bio
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedData({});
  };

  const handleSaveProfile = async () => {
    // Validate input
    if (!editedData.name || !editedData.email) {
      Alert.alert("Validation Error", "Name and email are required fields.");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editedData.email)) {
      Alert.alert("Validation Error", "Please enter a valid email address.");
      return;
    }

    setIsSaving(true);
    try {
      // Simulate API call to update profile
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state
      setProfileData({
        ...profileData,
        ...editedData
      });
      
      setIsEditing(false);
      setEditedData({});
      Alert.alert("Success", "Profile updated successfully!");
      triggerRefresh(); // Trigger refresh to update any dependent components
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditedData({
      ...editedData,
      [field]: value
    });
  };

  if (!profileData && !isRefreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

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
      {profileData && (
        <View style={styles.profileContainer}>
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              <Image 
                source={{ uri: "https://via.placeholder.com/150" }} 
                style={styles.avatar}
              />
              {!isEditing && (
                <TouchableOpacity style={styles.avatarEditButton}>
                  <Text style={styles.avatarEditButtonText}>Edit</Text>
                </TouchableOpacity>
              )}
            </View>
            
            <Text style={styles.title}>Profile</Text>
            
            {!isEditing ? (
              <TouchableOpacity 
                style={styles.editButton} 
                onPress={handleEditProfile}
              >
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.cancelButton]} 
                  onPress={handleCancelEdit}
                  disabled={isSaving}
                >
                  <Text style={styles.actionButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, styles.saveButton, isSaving && styles.disabledButton]} 
                  onPress={handleSaveProfile}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.actionButtonText}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
          
          <View style={styles.profileDetails}>
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Name:</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={editedData.name}
                  onChangeText={(text) => handleInputChange('name', text)}
                  placeholder="Enter your name"
                />
              ) : (
                <Text style={styles.fieldValue}>{profileData.name}</Text>
              )}
            </View>
            
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Email:</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={editedData.email}
                  onChangeText={(text) => handleInputChange('email', text)}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              ) : (
                <Text style={styles.fieldValue}>{profileData.email}</Text>
              )}
            </View>
            
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Phone:</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={editedData.phone}
                  onChangeText={(text) => handleInputChange('phone', text)}
                  placeholder="Enter your phone number"
                  keyboardType="phone-pad"
                />
              ) : (
                <Text style={styles.fieldValue}>{profileData.phone || 'Not provided'}</Text>
              )}
            </View>
            
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Bio:</Text>
              {isEditing ? (
                <TextInput
                  style={[styles.input, styles.bioInput]}
                  value={editedData.bio}
                  onChangeText={(text) => handleInputChange('bio', text)}
                  placeholder="Tell us about yourself"
                  multiline
                  numberOfLines={4}
                />
              ) : (
                <Text style={styles.fieldValue}>{profileData.bio || 'No bio provided'}</Text>
              )}
            </View>
            
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Join Date:</Text>
              <Text style={styles.fieldValue}>{profileData.joinDate}</Text>
            </View>
            
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Last Active:</Text>
              <Text style={styles.fieldValue}>{profileData.lastActive}</Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  profileContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  header: {
    backgroundColor: '#f8f8f8',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#fff',
  },
  avatarEditButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#0066cc',
    borderRadius: 15,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  avatarEditButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  editButton: {
    backgroundColor: '#0066cc',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 8,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 10,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginHorizontal: 5,
    minWidth: 80,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#999',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  disabledButton: {
    opacity: 0.6,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  profileDetails: {
    padding: 20,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 16,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
});