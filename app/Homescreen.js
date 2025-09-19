import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';

const HomeScreen = ({ navigation, route }) => {
  const { user } = route.params;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header Section */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greetingText}>Good Morning</Text>
          <Text style={styles.userName}>{user.displayName || user.email.split('@')[0]}</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Image 
            source={user.photoURL ? { uri: user.photoURL } : require('./assets/user.png')}
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      {/* <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={[styles.actionCard, styles.surveyCard]}
            onPress={() => navigation.navigate('Surveys')}
          >
            <Image 
              source={require('./assets/survey-icon.png')}
              style={styles.actionIcon}
            />
            <Text style={styles.actionText}>Take Survey</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionCard, styles.feedbackCard]}
            onPress={() => navigation.navigate('Feedback')}
          >
            <Image 
              source={require('./assets/feedback-icon.png')}
              style={styles.actionIcon}
            />
            <Text style={styles.actionText}>Submit Feedback</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionCard, {backgroundColor: '#FFA500'}]}
            onPress={() => navigation.navigate('ViewFeedback')}
          >
            <Image 
              source={require('./assets/view-feedback-icon.png')}
              style={styles.actionIcon}
            />
            <Text style={styles.actionText}>View Feedback</Text>
          </TouchableOpacity>
        </View>
      </View> */}

      {/* Menu Section */}
      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Menu</Text>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('Surveys')}
        >
          <View style={styles.menuItemContent}>
            <Image source={require('./assets/survey-menu.png')} style={styles.menuIcon} />
            <Text style={styles.menuItemText}>Surveys</Text>
          </View>
          <Image source={require('./assets/chevron-right.png')} style={styles.chevronIcon} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('Feedback')}
        >
          <View style={styles.menuItemContent}>
            <Image source={require('./assets/feedback-menu.png')} style={styles.menuIcon} />
            <Text style={styles.menuItemText}>Submit Feedback</Text>
          </View>
          <Image source={require('./assets/chevron-right.png')} style={styles.chevronIcon} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('ViewFeedback')}
        >
          <View style={styles.menuItemContent}>
            <Image source={require('./assets/view-feedback-menu.png')} style={styles.menuIcon} />
            <Text style={styles.menuItemText}>View Feedback</Text>
          </View>
          <Image source={require('./assets/chevron-right.png')} style={styles.chevronIcon} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('Profile')}
        >
          <View style={styles.menuItemContent}>
            <Image source={require('./assets/profile-menu.png')} style={styles.menuIcon} />
            <Text style={styles.menuItemText}>Profile</Text>
          </View>
          <Image source={require('./assets/chevron-right.png')} style={styles.chevronIcon} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('Help')}
        >
          <View style={styles.menuItemContent}>
            <Image source={require('./assets/help-menu.png')} style={styles.menuIcon} />
            <Text style={styles.menuItemText}>Help Center</Text>
          </View>
          <Image source={require('./assets/chevron-right.png')} style={styles.chevronIcon} />
        </TouchableOpacity>
      </View>

      {/* Notifications Section */}
      <View style={styles.notificationsSection}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.notificationCard}>
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationBadgeText}>New</Text>
          </View>
          <Text style={styles.notificationTitle}>Survey Available</Text>
          <Text style={styles.notificationText}>Customer satisfaction survey is ready for you</Text>
          <Text style={styles.notificationTime}>2 hours ago</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  greetingText: {
    fontSize: 16,
    color: '#6C757D',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#343A40',
    marginTop: 5,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#E9ECEF',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#343A40',
    marginBottom: 15,
  },
  quickActionsContainer: {
    marginBottom: 25,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 10
  },
  actionCard: {
    width: '48%',
    minWidth: 150,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  surveyCard: {
    backgroundColor: '#E3F2FD',
  },
  feedbackCard: {
    backgroundColor: '#E8F5E9',
  },
  actionIcon: {
    width: 40,
    height: 40,
    marginBottom: 10,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#343A40',
    textAlign: 'center'
  },
  menuSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    width: 24,
    height: 24,
    marginRight: 15,
  },
  menuItemText: {
    fontSize: 16,
    color: '#343A40',
  },
  chevronIcon: {
    width: 16,
    height: 16,
    tintColor: '#ADB5BD',
  },
  notificationsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1,
  },
  notificationCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 15,
  },
  notificationBadge: {
    backgroundColor: '#4CAF50',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginBottom: 5,
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#343A40',
    marginBottom: 5,
  },
  notificationText: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 5,
  },
  notificationTime: {
    fontSize: 12,
    color: '#ADB5BD',
  },
});

export default HomeScreen;