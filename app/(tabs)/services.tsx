import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView,
  TouchableOpacity,
  useColorScheme
} from 'react-native';
import Colors from '@/constants/Colors';
import { services } from '@/data/services';
import ServiceCard from '@/components/ServiceCard';

type ServiceCategory = 'all' | 'hair' | 'nails' | 'skin' | 'spa';

export default function ServicesScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory>('all');
  
  const categories = [
    { id: 'all', name: 'All Services' },
    { id: 'hair', name: 'Hair' },
    { id: 'nails', name: 'Nails' },
    { id: 'skin', name: 'Skin' },
    { id: 'spa', name: 'Spa' }
  ];
  
  const filteredServices = selectedCategory === 'all' 
    ? services 
    : services.filter(service => service.category === selectedCategory);
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Category tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryTab,
              selectedCategory === category.id && { backgroundColor: colors.primaryPink },
              { borderColor: colors.primaryPink }
            ]}
            onPress={() => setSelectedCategory(category.id as ServiceCategory)}
          >
            <Text 
              style={[
                styles.categoryText,
                selectedCategory === category.id ? { color: 'white' } : { color: colors.primaryPink }
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      {/* Services list */}
      <ScrollView 
        style={styles.servicesContainer}
        contentContainerStyle={styles.servicesContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.serviceCount, { color: colors.text }]}>
          {filteredServices.length} {selectedCategory === 'all' ? 'services' : selectedCategory} services available
        </Text>
        
        {filteredServices.map(service => (
          <ServiceCard key={service.id} service={service} />
        ))}
        
        {filteredServices.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.text }]}>
              No services found in this category.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  categoriesContainer: {
    maxHeight: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoriesContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  categoryText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
  },
  servicesContainer: {
    flex: 1,
  },
  servicesContent: {
    padding: 16,
    paddingBottom: 40,
  },
  serviceCount: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    marginBottom: 8,
    opacity: 0.7,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    textAlign: 'center',
  },
});