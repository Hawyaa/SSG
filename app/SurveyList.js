import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  TextInput, 
  ActivityIndicator,
  ScrollView // Added ScrollView import
} from 'react-native';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from './firebase';

const SurveyList = ({ navigation }) => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        setLoading(true);
        const surveysRef = collection(db, 'surveys');
        let q = query(surveysRef);
        
        if (filter === 'pending') {
          q = query(surveysRef, where('status', '==', 'Pending'));
        } else if (filter === 'completed') {
          q = query(surveysRef, where('status', '==', 'Completed'));
        }
        
        if (sortBy === 'date') {
          q = query(q, orderBy('dueDate', 'asc'));
        } else if (sortBy === 'category') {
          q = query(q, orderBy('category'));
        } else if (sortBy === 'urgency') {
          q = query(q, orderBy('priority', 'desc'));
        }
        
        const querySnapshot = await getDocs(q);
        const surveysData = [];
        querySnapshot.forEach((doc) => {
          surveysData.push({ id: doc.id, ...doc.data() });
        });
        setSurveys(surveysData);
      } catch (error) {
        console.error('Error fetching surveys:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSurveys();
  }, [filter, sortBy]);

  const handleSurveySelect = (survey) => {
    navigation.navigate('SurveyDetails', { survey });
  };

  const filteredSurveys = surveys.filter(survey => 
    survey.title.toLowerCase().includes(searchText.toLowerCase()) ||
    survey.description.toLowerCase().includes(searchText.toLowerCase())
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Available Surveys</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search surveys..."
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={setSearchText}
        />
        <Text style={styles.searchIcon}>🔍</Text>
      </View>

      {/* Filter and Sort Controls */}
      <View style={styles.controlsContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.filterScroll}
        >
          <TouchableOpacity 
            style={[styles.filterButton, filter === 'all' && styles.activeFilter]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterButton, filter === 'pending' && styles.activeFilter]}
            onPress={() => setFilter('pending')}
          >
            <Text style={[styles.filterText, filter === 'pending' && styles.activeFilterText]}>Pending</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterButton, filter === 'completed' && styles.activeFilter]}
            onPress={() => setFilter('completed')}
          >
            <Text style={[styles.filterText, filter === 'completed' && styles.activeFilterText]}>Completed</Text>
          </TouchableOpacity>
        </ScrollView>

        <View style={styles.sortContainer}>
          <Text style={styles.sortLabel}>Sort by:</Text>
          <TouchableOpacity 
            style={[styles.sortButton, sortBy === 'date' && styles.activeSort]}
            onPress={() => setSortBy('date')}
          >
            <Text style={[styles.sortText, sortBy === 'date' && styles.activeSortText]}>Date</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.sortButton, sortBy === 'category' && styles.activeSort]}
            onPress={() => setSortBy('category')}
          >
            <Text style={[styles.sortText, sortBy === 'category' && styles.activeSortText]}>Category</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.sortButton, sortBy === 'urgency' && styles.activeSort]}
            onPress={() => setSortBy('urgency')}
          >
            <Text style={[styles.sortText, sortBy === 'urgency' && styles.activeSortText]}>Urgency</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Survey List */}
      {filteredSurveys.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No surveys found</Text>
        </View>
      ) : (
        <FlatList
          data={filteredSurveys}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.surveyCard}
              onPress={() => handleSurveySelect(item)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.categoryBadge}>{item.category}</Text>
                {item.priority === 'high' && (
                  <View style={styles.urgencyBadge}>
                    <Text style={styles.urgencyText}>Urgent</Text>
                  </View>
                )}
                <Text style={[
                  styles.statusBadge,
                  item.status === 'Completed' ? styles.completedBadge : styles.pendingBadge
                ]}>
                  {item.status}
                </Text>
              </View>
              
              <Text style={styles.surveyTitle}>{item.title}</Text>
              <Text style={styles.surveyDesc}>{item.description}</Text>
              
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${item.progress}%` }]} />
                </View>
                <Text style={styles.progressText}>{item.progress}%</Text>
              </View>
              
              <Text style={styles.dueDate}>Due: {item.dueDate?.toDate?.().toLocaleDateString() || 'No due date'}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  backButton: {
    fontSize: 24,
    color: '#3498db',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerRight: {
    width: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    margin: 20,
    marginBottom: 10,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginLeft: 10,
    fontSize: 20,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    color: '#333',
  },
  controlsContainer: {
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  filterScroll: {
    marginBottom: 10,
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
  },
  activeFilter: {
    backgroundColor: '#3498db',
  },
  filterText: {
    color: '#555',
    fontSize: 14,
  },
  activeFilterText: {
    color: '#fff',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortLabel: {
    marginRight: 10,
    color: '#555',
    fontSize: 14,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  activeSort: {
    backgroundColor: '#3498db',
  },
  sortText: {
    color: '#555',
    fontSize: 12,
  },
  activeSortText: {
    color: '#fff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  surveyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  categoryBadge: {
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '500',
  },
  urgencyBadge: {
    backgroundColor: '#ffebee',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  urgencyText: {
    color: '#c62828',
    fontSize: 12,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '500',
  },
  completedBadge: {
    backgroundColor: '#e8f5e9',
    color: '#388e3c',
  },
  pendingBadge: {
    backgroundColor: '#fff8e1',
    color: '#ffa000',
  },
  surveyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  surveyDesc: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4caf50',
  },
  progressText: {
    fontSize: 12,
    color: '#666',
  },
  dueDate: {
    fontSize: 12,
    color: '#999',
  },
});

export default SurveyList;