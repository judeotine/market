import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  ScrollView, 
  Linking,
  useColorScheme,
  Platform,
  TouchableOpacity
} from 'react-native';
import Colors from '@/constants/Colors';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Svg, { Path } from 'react-native-svg';

// Icon props type
interface IconProps {
  color: string;
  size?: number;
}

// Map Pin Icon
const MapPin = ({ color, size = 24 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <Path d="M12 14a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
  </Svg>
);

// Clock Icon
const Clock = ({ color, size = 24 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
    <Path d="M12 6v6l4 2" />
  </Svg>
);

// Phone Icon
const Phone = ({ color, size = 24 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </Svg>
);

// Mail Icon
const Mail = ({ color, size = 24 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <Path d="M22 6l-10 7L2 6" />
  </Svg>
);

export default function LocationScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const openMaps = () => {
    const address = 'Jude\'s Salon, Kampala, Uganda';
    const mapUrl = Platform.OS === 'ios'
      ? `maps:?q=${encodeURIComponent(address)}`
      : `geo:0,0?q=${encodeURIComponent(address)}`;
      
    Linking.canOpenURL(mapUrl)
      .then(supported => {
        if (supported) {
          return Linking.openURL(mapUrl);
        } else {
          return Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`);
        }
      })
      .catch(err => console.error('An error occurred', err));
  };
  
  const callSalon = () => {
    Linking.openURL('tel:+256700123456');
  };
  
  const emailSalon = () => {
    Linking.openURL('mailto:info@judessalon.com');
  };
  
  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Map image placeholder */}
      <View style={styles.mapContainer}>
        <Image 
          source={{ uri: 'https://images.pexels.com/photos/2766040/pexels-photo-2766040.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' }}
          style={styles.mapImage}
        />
        <View style={styles.mapOverlay}>
          <MapPin color="white" size={32} />
          <Text style={styles.mapText}>Jude's Salon</Text>
        </View>
      </View>
      
      {/* Address card */}
      <Card style={styles.addressCard}>
        <View style={styles.addressHeader}>
          <MapPin color={colors.primaryPink} />
          <Text style={[styles.addressTitle, { color: colors.text }]}>
            Our Location
          </Text>
        </View>
        
        <Text style={[styles.addressText, { color: colors.text }]}>
          25 Kampala Road, Nakasero
        </Text>
        <Text style={[styles.addressText, { color: colors.text }]}>
          Kampala, Uganda
        </Text>
        
        <Button
          title="Get Directions"
          onPress={openMaps}
          style={styles.directionButton}
        />
      </Card>
      
      {/* Hours card */}
      <Card style={styles.hoursCard}>
        <View style={styles.addressHeader}>
          <Clock color={colors.primaryPink} />
          <Text style={[styles.addressTitle, { color: colors.text }]}>
            Opening Hours
          </Text>
        </View>
        
        <View style={styles.hoursRow}>
          <Text style={[styles.dayText, { color: colors.text }]}>Monday - Friday</Text>
          <Text style={[styles.timeText, { color: colors.text }]}>9:00 AM - 8:00 PM</Text>
        </View>
        
        <View style={styles.hoursRow}>
          <Text style={[styles.dayText, { color: colors.text }]}>Saturday</Text>
          <Text style={[styles.timeText, { color: colors.text }]}>9:00 AM - 6:00 PM</Text>
        </View>
        
        <View style={styles.hoursRow}>
          <Text style={[styles.dayText, { color: colors.text }]}>Sunday</Text>
          <Text style={[styles.timeText, { color: colors.text }]}>10:00 AM - 6:00 PM</Text>
        </View>
      </Card>
      
      {/* Contact card */}
      <Card style={styles.contactCard}>
        <View style={styles.addressHeader}>
          <Phone color={colors.primaryPink} />
          <Text style={[styles.addressTitle, { color: colors.text }]}>
            Contact Information
          </Text>
        </View>
        
        <TouchableOpacity style={styles.contactRow} onPress={callSalon}>
          <Phone size={18} color={colors.text} />
          <Text style={[styles.contactText, { color: colors.text }]}>
            +256 700 123 456
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.contactRow} onPress={emailSalon}>
          <Mail size={18} color={colors.text} />
          <Text style={[styles.contactText, { color: colors.text }]}>
            info@judessalon.com
          </Text>
        </TouchableOpacity>
      </Card>
      
      {/* About section */}
      <Card style={styles.aboutCard}>
        <Text style={[styles.aboutTitle, { color: colors.text }]}>
          About Jude's Salon
        </Text>
        
        <Text style={[styles.aboutText, { color: colors.text }]}>
          Located in the heart of Kampala, Jude's Salon is a premier beauty destination offering 
          a wide range of luxury services. Our team of skilled professionals is dedicated to 
          providing exceptional experiences and results.
        </Text>
        
        <Text style={[styles.aboutText, { color: colors.text }]}>
          Visit us today and experience the perfect blend of relaxation and beautification in our 
          elegant and welcoming salon environment.
        </Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  mapContainer: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  mapOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  mapText: {
    color: 'white',
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    marginLeft: 8,
  },
  addressCard: {
    marginBottom: 16,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  addressTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    marginLeft: 8,
  },
  addressText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    marginBottom: 4,
    lineHeight: 24,
  },
  directionButton: {
    marginTop: 16,
  },
  hoursCard: {
    marginBottom: 16,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dayText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 15,
  },
  timeText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
  },
  contactCard: {
    marginBottom: 16,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    marginLeft: 12,
  },
  aboutCard: {
    marginBottom: 16,
  },
  aboutTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    marginBottom: 12,
  },
  aboutText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
    marginBottom: 12,
    lineHeight: 24,
  },
});