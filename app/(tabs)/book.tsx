import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TextInput,
  TouchableOpacity,
  useColorScheme, 
  KeyboardAvoidingView, 
  Platform,
  Alert
} from 'react-native';
import Colors from '@/constants/Colors';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { Calendar } from 'lucide-react-native';
import CalendarPicker from 'react-native-calendar-picker';
import { services } from '@/data/services';
import { addDays, format } from 'date-fns';

export default function BookingScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  
  // Generate available times from 9 AM to 6 PM with 30-minute intervals
  const availableTimes = [];
  for (let hour = 9; hour <= 18; hour++) {
    const hourString = hour === 12 ? '12' : hour > 12 ? (hour - 12).toString() : hour.toString();
    const amPm = hour >= 12 ? 'PM' : 'AM';
    
    availableTimes.push(`${hourString}:00 ${amPm}`);
    if (hour < 18) {
      availableTimes.push(`${hourString}:30 ${amPm}`);
    }
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setShowCalendar(false);
  };

  const handleSubmit = () => {
    // Validate form fields
    if (!selectedDate || !selectedTime || !selectedService || !name || !phone) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }
    
    // Format appointment data
    const formattedDate = format(selectedDate, 'EEEE, MMMM d, yyyy');
    const selectedServiceDetails = services.find(s => s.id === selectedService);
    
    // Show confirmation dialog
    Alert.alert(
      'Appointment Confirmation',
      `Thank you for booking with Jude's Salon!

Your appointment details:
Service: ${selectedServiceDetails?.name}
Date: ${formattedDate}
Time: ${selectedTime}
Name: ${name}
Phone: ${phone}

We'll contact you to confirm your appointment.`,
      [{ text: 'OK', onPress: () => resetForm() }]
    );
  };
  
  const resetForm = () => {
    setSelectedDate(null);
    setSelectedTime(null);
    setSelectedService(null);
    setName('');
    setPhone('');
    setEmail('');
    setNotes('');
  };
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView 
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.headerText, { color: colors.text }]}>
          Book Your Appointment
        </Text>
        
        <Card>
          {/* Date selection */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Select Date
          </Text>
          <TouchableOpacity 
            style={[
              styles.dateSelector, 
              { borderColor: colors.border, backgroundColor: colors.cardBackground }
            ]}
            onPress={() => setShowCalendar(true)}
          >
            <Calendar size={20} color={colors.primaryPink} />
            <Text style={[
              styles.dateText, 
              { color: selectedDate ? colors.text : '#999' }
            ]}>
              {selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : 'Select a date'}
            </Text>
          </TouchableOpacity>
          
          {showCalendar && (
            <View style={styles.calendarContainer}>
              <CalendarPicker
                onDateChange={handleDateSelect}
                minDate={new Date()}
                maxDate={addDays(new Date(), 60)}
                selectedDayColor={colors.primaryPink}
                selectedDayTextColor="#fff"
                todayBackgroundColor={colors.secondaryLavender}
                todayTextStyle={{ color: '#000' }}
                textStyle={{ fontFamily: 'Poppins-Regular', color: colors.text }}
                previousTitleStyle={{ fontFamily: 'Poppins-Regular', color: colors.primaryPink }}
                nextTitleStyle={{ fontFamily: 'Poppins-Regular', color: colors.primaryPink }}
              />
            </View>
          )}
          
          {/* Time selection */}
          {selectedDate && (
            <>
              <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 16 }]}>
                Select Time
              </Text>
              <View style={styles.timeGrid}>
                {availableTimes.map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.timeButton,
                      selectedTime === time && { backgroundColor: colors.primaryPink },
                      { borderColor: colors.border }
                    ]}
                    onPress={() => setSelectedTime(time)}
                  >
                    <Text
                      style={[
                        styles.timeButtonText,
                        selectedTime === time && { color: 'white' },
                        { color: colors.text }
                      ]}
                    >
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
          
          {/* Service selection */}
          <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 16 }]}>
            Select Service
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.serviceScroll}>
            {services.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={[
                  styles.serviceButton,
                  selectedService === service.id && { backgroundColor: colors.primaryPink },
                  { borderColor: colors.border }
                ]}
                onPress={() => setSelectedService(service.id)}
              >
                <Text
                  style={[
                    styles.serviceButtonText,
                    selectedService === service.id && { color: 'white' },
                    { color: colors.text }
                  ]}
                >
                  {service.name}
                </Text>
                <Text
                  style={[
                    styles.serviceDuration,
                    selectedService === service.id && { color: 'white' },
                    { color: selectedService === service.id ? 'white' : colors.text }
                  ]}
                >
                  {service.duration} min | UGX {service.price.toLocaleString()}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          {/* Customer Information */}
          <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 16 }]}>
            Your Information
          </Text>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Name *</Text>
            <TextInput
              style={[
                styles.input,
                { borderColor: colors.border, color: colors.text, backgroundColor: colors.cardBackground }
              ]}
              placeholder="Your Full Name"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Phone Number *</Text>
            <TextInput
              style={[
                styles.input,
                { borderColor: colors.border, color: colors.text, backgroundColor: colors.cardBackground }
              ]}
              placeholder="e.g., 0700 123 456"
              placeholderTextColor="#999"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Email (Optional)</Text>
            <TextInput
              style={[
                styles.input,
                { borderColor: colors.border, color: colors.text, backgroundColor: colors.cardBackground }
              ]}
              placeholder="Your Email Address"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Special Requests (Optional)</Text>
            <TextInput
              style={[
                styles.textArea,
                { borderColor: colors.border, color: colors.text, backgroundColor: colors.cardBackground }
              ]}
              placeholder="Any special requests or notes"
              placeholderTextColor="#999"
              value={notes}
              onChangeText={setNotes}
              multiline={true}
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
          
          <Button
            title="Book Appointment"
            onPress={handleSubmit}
            style={styles.submitButton}
          />
          
          <Text style={[styles.disclaimer, { color: colors.text }]}>
            * Required fields. We'll contact you to confirm your appointment.
          </Text>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
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
  headerText: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    marginBottom: 8,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  dateText: {
    fontFamily: 'Poppins-Regular',
    marginLeft: 8,
    fontSize: 16,
  },
  calendarContainer: {
    marginVertical: 8,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  timeButton: {
    width: '31%',
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    margin: '1%',
    alignItems: 'center',
  },
  timeButtonText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
  },
  serviceScroll: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  serviceButton: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginRight: 8,
    minWidth: 160,
  },
  serviceButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    marginBottom: 4,
  },
  serviceDuration: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    opacity: 0.8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    minHeight: 100,
  },
  submitButton: {
    marginTop: 16,
  },
  disclaimer: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    marginTop: 12,
    textAlign: 'center',
    opacity: 0.7,
  },
});