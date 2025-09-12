import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthScreen from './components/AuthScreen';
import ProfileScreen from './components/ProfileScreen';

function MainApp() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [url, setUrl] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadHistory, setDownloadHistory] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  
  const { user, loading } = useAuth();

  useEffect(() => {
    loadTheme();
    loadDownloadHistory();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === 'dark');
      }
    } catch (error) {
      console.log('Error loading theme:', error);
    }
  };

  const saveTheme = async (theme) => {
    try {
      await AsyncStorage.setItem('theme', theme);
    } catch (error) {
      console.log('Error saving theme:', error);
    }
  };

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    saveTheme(newTheme ? 'dark' : 'light');
  };

  const loadDownloadHistory = async () => {
    try {
      const history = await AsyncStorage.getItem('downloadHistory');
      if (history !== null) {
        setDownloadHistory(JSON.parse(history));
      }
    } catch (error) {
      console.log('Error loading download history:', error);
    }
  };

  const saveDownloadHistory = async (history) => {
    try {
      await AsyncStorage.setItem('downloadHistory', JSON.stringify(history));
    } catch (error) {
      console.log('Error saving download history:', error);
    }
  };

  const handleDownload = async () => {
    if (!url.trim()) {
      Alert.alert('Error', 'Please enter a valid URL');
      return;
    }

    setIsDownloading(true);
    
    try {
      // Make actual API call to backend
      const response = await fetch('http://localhost:3001/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user?.token && { 'Authorization': `Bearer ${user.token}` })
        },
        body: JSON.stringify({
          url: url.trim(),
          format: 'mp4',
          quality: '720p'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Download failed');
      }

      if (data.success && data.jobId) {
        // Poll for progress
        const jobId = data.jobId;
        let completed = false;
        
        while (!completed) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          try {
            const progressResponse = await fetch(`http://localhost:3001/api/download/progress/${jobId}`);
            const progressData = await progressResponse.json();
            
            if (progressData.success) {
              if (progressData.status === 'completed') {
                completed = true;
                
                const newDownload = {
                  id: Date.now(),
                  url: url,
                  filename: progressData.filename || `download_${Date.now()}.mp4`,
                  status: 'completed',
                  timestamp: new Date().toISOString(),
                  fileSize: progressData.fileSize || 'Unknown'
                };
                
                const updatedHistory = [newDownload, ...downloadHistory.slice(0, 9)];
                setDownloadHistory(updatedHistory);
                saveDownloadHistory(updatedHistory);
                
                setUrl('');
                Alert.alert('Success', 'Download completed successfully!');
              } else if (progressData.status === 'failed') {
                throw new Error(progressData.error || 'Download failed');
              }
            }
          } catch (error) {
            console.error('Progress check error:', error);
          }
        }
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', `Download failed: ${error.message}`);
    } finally {
      setIsDownloading(false);
    }
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.headerBackground }]}>
        <LinearGradient
          colors={theme.gradientColors}
          style={styles.logo}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="download" size={24} color="white" />
        </LinearGradient>
        
        <Text style={[styles.title, { color: theme.textPrimary }]}>FlowDownloader</Text>
        
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={toggleTheme} style={[styles.themeToggle, { backgroundColor: theme.cardBackground }]}>
            <Ionicons 
              name={isDarkMode ? 'sunny' : 'moon'} 
              size={20} 
              color={theme.textPrimary} 
            />
          </TouchableOpacity>
          
          {user && (
            <TouchableOpacity 
              onPress={() => setShowProfile(true)} 
              style={[styles.profileButton, { backgroundColor: theme.cardBackground }]}
            >
              <Ionicons name="person" size={20} color={theme.textPrimary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* URL Input */}
        <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.borderColor }]}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Enter URL</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: theme.inputBackground, 
              borderColor: theme.borderColor,
              color: theme.textPrimary 
            }]}
            placeholder="Paste video URL here..."
            placeholderTextColor={theme.textSecondary}
            value={url}
            onChangeText={setUrl}
            multiline
          />
          
          <TouchableOpacity 
            onPress={handleDownload} 
            disabled={isDownloading}
            style={styles.downloadButton}
          >
            <LinearGradient
              colors={theme.gradientColors}
              style={[styles.buttonGradient, { opacity: isDownloading ? 0.7 : 1 }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons 
                name={isDownloading ? 'hourglass' : 'download'} 
                size={20} 
                color="white" 
                style={{ marginRight: 8 }}
              />
              <Text style={styles.buttonText}>
                {isDownloading ? 'Downloading...' : 'Download'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Download History */}
        {downloadHistory.length > 0 && (
          <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.borderColor }]}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Recent Downloads</Text>
            {downloadHistory.map((item) => (
              <View key={item.id} style={[styles.historyItem, { borderColor: theme.borderColor }]}>
                <View style={styles.historyInfo}>
                  <Text style={[styles.filename, { color: theme.textPrimary }]} numberOfLines={1}>
                    {item.filename}
                  </Text>
                  <Text style={[styles.timestamp, { color: theme.textSecondary }]}>
                    {new Date(item.timestamp).toLocaleDateString()}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: theme.successBackground }]}>
                  <Text style={[styles.statusText, { color: theme.successColor }]}>
                    {item.status}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Features */}
        <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.borderColor }]}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Features</Text>
          <View style={styles.featuresList}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Ionicons name={feature.icon} size={20} color={theme.accentColor} />
                <Text style={[styles.featureText, { color: theme.textSecondary }]}>
                  {feature.text}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
      
      {/* Profile Modal */}
      <Modal
        visible={showProfile}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <ProfileScreen 
          theme={theme} 
          onClose={() => setShowProfile(false)} 
        />
      </Modal>
    </View>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { user, loading } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const theme = isDarkMode ? darkTheme : lightTheme;
  
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme');
        if (savedTheme !== null) {
          setIsDarkMode(savedTheme === 'dark');
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      }
    };
    loadTheme();
  }, []);
  
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <StatusBar style={isDarkMode ? 'light' : 'dark'} />
        <LinearGradient
          colors={theme.gradientColors}
          style={styles.logo}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="download" size={32} color="white" />
        </LinearGradient>
        <Text style={[styles.title, { color: theme.textPrimary, marginTop: 16 }]}>FlowDownloader</Text>
        <Text style={[styles.loadingText, { color: theme.textSecondary, marginTop: 8 }]}>Loading...</Text>
      </View>
    );
  }
  
  if (!user) {
    return (
      <>
        <StatusBar style={isDarkMode ? 'light' : 'dark'} />
        <AuthScreen theme={theme} />
      </>
    );
  }
  
  return <MainApp />;
}

const features = [
  { icon: 'videocam', text: 'Support for multiple video platforms' },
  { icon: 'musical-notes', text: 'Audio extraction capabilities' },
  { icon: 'settings', text: 'Quality and format selection' },
  { icon: 'cloud-offline', text: 'Offline download management' },
];

const lightTheme = {
  background: '#f8fafc',
  headerBackground: 'rgba(255, 255, 255, 0.95)',
  cardBackground: 'rgba(255, 255, 255, 0.8)',
  inputBackground: 'rgba(255, 255, 255, 0.9)',
  textPrimary: '#1e293b',
  textSecondary: '#64748b',
  borderColor: 'rgba(148, 163, 184, 0.3)',
  gradientColors: ['#667eea', '#764ba2'],
  accentColor: '#667eea',
  successColor: '#059669',
  successBackground: 'rgba(5, 150, 105, 0.1)',
};

const darkTheme = {
  background: '#0f172a',
  headerBackground: 'rgba(30, 41, 59, 0.95)',
  cardBackground: 'rgba(30, 41, 59, 0.6)',
  inputBackground: 'rgba(51, 65, 85, 0.8)',
  textPrimary: '#f1f5f9',
  textSecondary: '#94a3b8',
  borderColor: 'rgba(71, 85, 105, 0.3)',
  gradientColors: ['#667eea', '#764ba2'],
  accentColor: '#818cf8',
  successColor: '#10b981',
  successBackground: 'rgba(16, 185, 129, 0.1)',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.1)',
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
    marginLeft: 12,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  themeToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  loadingText: {
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  downloadButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  historyInfo: {
    flex: 1,
    marginRight: 12,
  },
  filename: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 14,
    flex: 1,
  },
});