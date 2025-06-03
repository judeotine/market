import { Tabs } from 'expo-router';
import { Home, Calendar, List, MapPin, User } from 'lucide-react-native';
import { useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].tabIconDefault,
        tabBarStyle: {
          height: 60,
          paddingBottom: 10,
          paddingTop: 10,
          backgroundColor: Colors[colorScheme ?? 'light'].background,
          borderTopWidth: 1,
          borderTopColor: Colors[colorScheme ?? 'light'].border,
        },
        tabBarLabelStyle: {
          fontFamily: 'Poppins-Regular',
          fontSize: 12,
        },
        headerStyle: {
          backgroundColor: Colors[colorScheme ?? 'light'].background,
        },
        headerTitleStyle: {
          fontFamily: 'PlayfairDisplay-Bold',
          fontSize: 20,
        },
        headerTintColor: Colors[colorScheme ?? 'light'].text,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="book"
        options={{
          title: 'Book',
          tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} />,
          headerTitle: 'Book Appointment',
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: 'Services',
          tabBarIcon: ({ color, size }) => <List size={size} color={color} />,
          headerTitle: 'Our Services',
        }}
      />
      <Tabs.Screen
        name="location"
        options={{
          title: 'Location',
          tabBarIcon: ({ color, size }) => <MapPin size={size} color={color} />,
          headerTitle: 'Find Us',
        }}
      />
    </Tabs>
  );
}