import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

const ProfileScreen = ({ theme, onClose }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            const result = await logout();
            if (result.success) {
              onClose();
            } else {
              Alert.alert('Error', result.error);
            }
          },
        },
      ]
    );
  };

  const getLicenseColor = (licenseType) => {
    switch (licenseType) {
      case 'premium':
        return '#f59e0b';
      case 'pro':
        return '#8b5cf6';
      default:
        return theme.accentColor;
    }
  };

  const getLicenseIcon = (licenseType) => {
    switch (licenseType) {
      case 'premium':
        return 'star';
      case 'pro':
        return 'diamond';
      default:
        return 'person';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.headerBackground }]}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Info Card */}
        <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.borderColor }]}>
          <View style={styles.userInfo}>
            <LinearGradient
              colors={theme.gradientColors}
              style={styles.avatar}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.avatarText}>
                {user?.displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </LinearGradient>
            
            <View style={styles.userDetails}>
              <Text style={[styles.userName, { color: theme.textPrimary }]}>
                {user?.displayName || 'User'}
              </Text>
              <Text style={[styles.userEmail, { color: theme.textSecondary }]}>
                {user?.email}
              </Text>
              
              <View style={[styles.licenseBadge, { backgroundColor: `${getLicenseColor(user?.licenseType)}20` }]}>
                <Ionicons 
                  name={getLicenseIcon(user?.licenseType)} 
                  size={14} 
                  color={getLicenseColor(user?.licenseType)} 
                />
                <Text style={[styles.licenseText, { color: getLicenseColor(user?.licenseType) }]}>
                  {user?.licenseType?.toUpperCase() || 'FREE'} Plan
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Stats Card */}
        <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.borderColor }]}>
          <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Usage Statistics</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="download" size={20} color={theme.accentColor} />
              <Text style={[styles.statValue, { color: theme.textPrimary }]}>
                {user?.downloadCount || 0}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Downloads</Text>
            </View>
            
            <View style={[styles.statDivider, { backgroundColor: theme.borderColor }]} />
            
            <View style={styles.statItem}>
              <Ionicons name="cloud" size={20} color={theme.accentColor} />
              <Text style={[styles.statValue, { color: theme.textPrimary }]}>
                {user?.maxDownloads || 10}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Limit</Text>
            </View>
            
            <View style={[styles.statDivider, { backgroundColor: theme.borderColor }]} />
            
            <View style={styles.statItem}>
              <Ionicons name="time" size={20} color={theme.accentColor} />
              <Text style={[styles.statValue, { color: theme.textPrimary }]}>
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Member Since</Text>
            </View>
          </View>
        </View>

        {/* Actions Card */}
        <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.borderColor }]}>
          <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Account Actions</Text>
          
          <TouchableOpacity style={[styles.actionButton, { borderColor: theme.borderColor }]}>
            <Ionicons name="card" size={20} color={theme.textPrimary} />
            <Text style={[styles.actionText, { color: theme.textPrimary }]}>Upgrade Plan</Text>
            <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, { borderColor: theme.borderColor }]}>
            <Ionicons name="settings" size={20} color={theme.textPrimary} />
            <Text style={[styles.actionText, { color: theme.textPrimary }]}>Settings</Text>
            <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, { borderColor: theme.borderColor }]}>
            <Ionicons name="help-circle" size={20} color={theme.textPrimary} />
            <Text style={[styles.actionText, { color: theme.textPrimary }]}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={handleLogout}
            style={[styles.actionButton, styles.logoutButton, { borderColor: '#ef4444' }]}
          >
            <Ionicons name="log-out" size={20} color="#ef4444" />
            <Text style={[styles.actionText, { color: '#ef4444' }]}>Logout</Text>
            <Ionicons name="chevron-forward" size={16} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
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
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
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
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: 'white',
    fontSize: 24,
    fontWeight: '600',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 8,
  },
  licenseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  licenseText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: 40,
    marginHorizontal: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
  },
  actionText: {
    fontSize: 16,
    flex: 1,
    marginLeft: 12,
  },
  logoutButton: {
    borderBottomWidth: 0,
  },
});

export default ProfileScreen;