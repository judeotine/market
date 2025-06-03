import React, { useCallback } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  Image, 
  useColorScheme, 
  TouchableOpacity 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Colors from '@/constants/Colors';
import Button from '@/components/Button';
import Card from '@/components/Card';
import { Calendar, MapPin, MessageSquare, Scissors } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { services } from '@/data/services';
import ServiceCard from '@/components/ServiceCard';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const navigateToVoiceAssistant = useCallback(() => {
    router.push('/voice-assistant');
  }, []);
  
  const navigateToBooking = useCallback(() => {
    router.push('/book');
  }, []);
  
  const navigateToServices = useCallback(() => {
    router.push('/services');
  }, []);
  
  const navigateToLocation = useCallback(() => {
    router.push('/location');
  }, []);

  const featuredServices = services.slice(0, 3);
  
  return (
    <ScrollView 
      style={[
        styles.container, 
        { backgroundColor: colors.background, paddingTop: insets.top }
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header with hero image */}
      <View style={styles.heroContainer}>
        <Image 
          source={{ uri: 'https://images.pexels.com/photos/3992855/pexels-photo-3992855.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' }} 
          style={styles.heroImage} 
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.heroGradient}
        />
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>Jude's Salon</Text>
          <Text style={styles.heroSubtitle}>Beauty & Excellence</Text>
        </View>
      </View>
      
      {/* Welcome message */}
      <View style={styles.welcomeSection}>
        <Text style={[styles.welcomeTitle, { color: colors.text }]}>
          Welcome to Jude's Salon
        </Text>
        <Text style={[styles.welcomeText, { color: colors.text }]}>
          Your premier destination for beauty and self-care in Kampala. 
          Experience luxury treatments by our skilled professionals.
        </Text>
      </View>
      
      {/* Quick actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.primaryPink }]}
          onPress={navigateToVoiceAssistant}
        >
          <MessageSquare color="#fff" size={24} />
          <Text style={styles.actionText}>Talk to Assistant</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.secondaryLavender }]}
          onPress={navigateToBooking}
        >
          <Calendar color="#333" size={24} />
          <Text style={[styles.actionText, { color: '#333' }]}>Book Appointment</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.tertiaryPeach }]}
          onPress={navigateToServices}
        >
          <Scissors color="#333" size={24} />
          <Text style={[styles.actionText, { color: '#333' }]}>View Services</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: '#e1f5fe' }]}
          onPress={navigateToLocation}
        >
          <MapPin color="#333" size={24} />
          <Text style={[styles.actionText, { color: '#333' }]}>Our Location</Text>
        </TouchableOpacity>
      </View>
      
      {/* Featured services section */}
      <View style={styles.featuredSection}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Featured Services
          </Text>
          <TouchableOpacity onPress={navigateToServices}>
            <Text style={[styles.seeAllText, { color: colors.primaryPink }]}>
              See All
            </Text>
          </TouchableOpacity>
        </View>
        
        {featuredServices.map(service => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </View>
      
      {/* Assistant call-to-action */}
      <Card style={styles.assistantCard}>
        <View style={styles.assistantContent}>
          <Image 
            source={{ uri: 'https://images.pexels.com/photos/3764013/pexels-photo-3764013.jpeg?auto=compress&cs=tinysrgb&w=800' }}
            style={styles.assistantImage}
          />
          <View style={styles.assistantTextContainer}>
            <Text style={[styles.assistantTitle, { color: colors.text }]}>
              Need Help?
            </Text>
            <Text style={[styles.assistantDesc, { color: colors.text }]}>
              Talk to our virtual assistant for instant support
            </Text>
            <Button 
              title="Chat Now" 
              onPress={navigateToVoiceAssistant}
              variant="primary"
              size="small"
              style={styles.assistantButton}
            />
          </View>
        </View>
      </Card>
      
      {/* Contact info */}
      <Card style={styles.contactCard}>
        <Text style={[styles.contactTitle, { color: colors.text }]}>
          Contact Us
        </Text>
        <Text style={[styles.contactInfo, { color: colors.text }]}>
          📱 +256 700 123 456
        </Text>
        <Text style={[styles.contactInfo, { color: colors.text }]}>
          📧 info@judessalon.com
        </Text>
        <Text style={[styles.contactInfo, { color: colors.text }]}>
          ⏰ Mon-Sat: 9AM - 8PM, Sun: 10AM - 6PM
        </Text>
      </Card>
      
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroContainer: {
    height: 240,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
  },
  heroContent: {
    position: 'absolute',
    bottom: 20,
    left: 20,
  },
  heroTitle: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 36,
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  heroSubtitle: {
    fontFamily: 'Poppins-Light',
    fontSize: 16,
    color: 'white',
    marginTop: -5,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  welcomeSection: {
    padding: 20,
  },
  welcomeTitle: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 24,
    marginBottom: 8,
  },
  welcomeText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
    lineHeight: 22,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  actionButton: {
    width: '48%',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: 'white',
    marginTop: 8,
    textAlign: 'center',
  },
  featuredSection: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 20,
  },
  seeAllText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
  },
  assistantCard: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  assistantContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assistantImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  assistantTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  assistantTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    marginBottom: 4,
  },
  assistantDesc: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 18,
  },
  assistantButton: {
    alignSelf: 'flex-start',
  },
  contactCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  contactTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    marginBottom: 8,
  },
  contactInfo: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    marginBottom: 4,
  },
});