# 📸 Camera Gallery App

## 🌟 Project Overview
A sophisticated React Native mobile application designed for seamless photo capture, storage, and management using the Expo framework. Built with modern mobile development practices, this app provides an intuitive interface for users to interact with device camera functionality.

## 🚀 Features
- **Advanced Camera Controls**
  - Dual-camera support (front and back cameras)
  - Real-time camera switching
  - High-quality image capture

- **Local Image Management**
  - SQLite-based local storage
  - Automatic image metadata tracking
  - Persistent image preservation

- **Smooth Navigation**
  - Bottom tab navigation
  - Intuitive user interface
  - Icon-based screen selection

## 📱 Supported Platforms
- iOS
- Android
- Web (Limited functionality)

## 🛠 Technology Stack
- **Frontend**: React Native
- **Framework**: Expo
- **State Management**: React Hooks
- **Navigation**: React Navigation
- **Database**: SQLite (expo-sqlite)
- **File Management**: Expo FileSystem

## 🔧 Prerequisites
- Node.js (v16+ recommended)
- npm (v8+) or Yarn
- Expo CLI
- Development environment setup
  - Xcode (for iOS)
  - Android Studio (for Android)
  - Expo Go mobile app for testing

## 💻 Installation

### 1. Clone Repository
```bash
git clone https://github.com/your-username/camera-gallery-app.git
cd camera-gallery-app
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Configure Environment
```bash
npm install -g expo-cli
```

### 4. Run Application
```bash
expo start
# or
npm start
```

## 📡 Configuration

### App Configuration
- Orientation: Portrait
- UI Theme: Light
- Responsive Design

### Permission Requirements
- Camera Access
- File System Write Permissions
- Storage Access

## 🗃 Database Schema
```sql
CREATE TABLE images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uri TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

## 🧪 Testing
- Unit Testing: Jest
- Integration Testing: React Native Testing Library
- Device Compatibility Testing

## 🔍 Troubleshooting
### Common Issues
1. Camera Permission Errors
   - Check device settings
   - Restart application
   - Reinstall Expo Go

2. Image Storage Problems
   - Verify file system permissions
   - Check available storage
   - Restart application

3. Performance Concerns
   - Clear app cache
   - Update Expo and dependencies
   - Optimize image sizes

## 🚧 Future Roadmap
- Cloud image backup
- Advanced image editing
- Machine learning image tagging
- Social media sharing integration

## 📦 Dependencies
- `expo`: ^49.0.0
- `react-native`: ^0.72.0
- `expo-camera`: ^13.4.0
- `expo-sqlite`: ^11.3.0
- `@react-navigation/bottom-tabs`: ^6.5.0

## 🤝 Contributing
1. Fork Repository
2. Create Feature Branch
3. Commit Changes
4. Push to Branch
5. Open Pull Request

## 📄 License
MIT License

## 👥 Developers
- Sibusiso Khoza
- Contact: sibusisok59@gmail.com



## 🌐 Resources
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Expo Documentation](https://docs.expo.dev/)
- [SQLite Guide](https://www.sqlite.org/docs.html)