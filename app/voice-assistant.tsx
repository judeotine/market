import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  useColorScheme,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { Mic, MicOff, X } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { WebView } from 'react-native-webview';
import ErrorBoundary from '@/components/ErrorBoundary';

// Types for conversation
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

export default function VoiceAssistantScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [webViewVisible, setWebViewVisible] = useState(false);
  
  // WebView HTML with Vapi integration
  const vapiHTML = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vapi Voice Assistant</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 0; padding: 0; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; background: transparent; }
      #status { margin-top: 20px; color: #666; }
      button { background: #ff7bb3; color: white; border: none; padding: 10px 20px; border-radius: 20px; font-size: 16px; cursor: pointer; margin: 10px; }
      button:disabled { background: #ccc; }
      #controls { display: flex; flex-direction: column; align-items: center; }
    </style>
  </head>
  <body>
    <div id="controls">
      <button id="startButton">Start Conversation</button>
      <button id="stopButton" disabled>Stop Conversation</button>
    </div>
    <div id="status">Ready to start</div>
    
    <script>
      // Initialize variables
      let conversation = null;
      let transcript = "";
      const startButton = document.getElementById('startButton');
      const stopButton = document.getElementById('stopButton');
      const statusElement = document.getElementById('status');
      
      // Function to send messages to React Native
      function sendToReactNative(type, data) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type,
          data
        }));
      }
      
      // Start conversation
      startButton.addEventListener('click', async () => {
        try {
          statusElement.textContent = "Connecting...";
          startButton.disabled = true;
          stopButton.disabled = false;
          
          // Load Vapi SDK
          const script = document.createElement('script');
          script.src = "https://cdn.vapi.ai/sdk.js";
          document.head.appendChild(script);
          
          script.onload = async () => {
            // Initialize Vapi conversation
            conversation = new window.Vapi.Conversation({
              publicKey: "${process.env.EXPO_PUBLIC_VAPI_PUBLIC_KEY}",
              assistantId: "${process.env.EXPO_PUBLIC_VAPI_ASSISTANT_ID}",
              stream: true,
              onStart: () => {
                statusElement.textContent = "Listening...";
                sendToReactNative('status', { isListening: true });
              },
              onMessage: (message) => {
                if (message.role === 'assistant') {
                  sendToReactNative('message', { 
                    text: message.content, 
                    sender: 'assistant'
                  });
                }
              },
              onError: (error) => {
                console.error("Vapi error:", error);
                statusElement.textContent = "Error: " + error.message;
                sendToReactNative('error', { message: error.message });
              },
              onStop: () => {
                statusElement.textContent = "Conversation ended";
                startButton.disabled = false;
                stopButton.disabled = true;
                sendToReactNative('status', { isListening: false });
              },
              audio: {
                onTranscript: (transcript) => {
                  if (transcript.isFinal) {
                    sendToReactNative('message', { 
                      text: transcript.text, 
                      sender: 'user' 
                    });
                  }
                },
              }
            });
            
            // Start the conversation
            await conversation.start();
          };
        } catch (error) {
          console.error("Error starting conversation:", error);
          statusElement.textContent = "Error: " + error.message;
          startButton.disabled = false;
          stopButton.disabled = true;
          sendToReactNative('error', { message: error.message });
        }
      });
      
      // Stop conversation
      stopButton.addEventListener('click', async () => {
        if (conversation) {
          try {
            await conversation.stop();
            statusElement.textContent = "Conversation ended";
            startButton.disabled = false;
            stopButton.disabled = true;
            sendToReactNative('status', { isListening: false });
          } catch (error) {
            console.error("Error stopping conversation:", error);
            statusElement.textContent = "Error: " + error.message;
            sendToReactNative('error', { message: error.message });
          }
        }
      });
      
      // Notify React Native that the WebView is ready
      sendToReactNative('ready', {});
    </script>
  </body>
  </html>
  `;
  
  // Handle WebView messages
  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      switch (data.type) {
        case 'ready':
          console.log('WebView is ready');
          break;
          
        case 'status':
          setIsListening(data.data.isListening);
          setIsLoading(false);
          break;
          
        case 'message':
          const newMessage = {
            id: Date.now().toString(),
            text: data.data.text,
            sender: data.data.sender,
            timestamp: new Date()
          };
          setMessages(prevMessages => [...prevMessages, newMessage]);
          break;
          
        case 'error':
          console.error('Vapi error:', data.data.message);
          setIsListening(false);
          setIsLoading(false);
          // Add error message to chat
          const errorMessage = {
            id: Date.now().toString(),
            text: `Sorry, there was an error: ${data.data.message}`,
            sender: 'assistant',
            timestamp: new Date()
          };
          setMessages(prevMessages => [...prevMessages, errorMessage] as Message[]);
          break;
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };
  
  // Add initial greeting message
  useEffect(() => {
    const welcomeMessage = {
      id: 'welcome',
      text: "Hello! I'm Jude's Salon virtual assistant. How can I help you today? I can provide information about our services, pricing, help you book an appointment, or answer any questions you might have.",
      sender: 'assistant',
      timestamp: new Date()
    };
    setMessages([welcomeMessage] as Message[]);
    setWebViewVisible(true);
  }, []);
  
  const toggleListening = () => {
    if (!isListening) {
      setIsLoading(true);
    }
  };
  
  return (
    <ErrorBoundary>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
            <X size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Jude's Salon Assistant
          </Text>
          <View style={styles.placeholder} />
        </View>
        
        {/* Conversation */}
        <ScrollView
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageBubble,
                message.sender === 'user'
                  ? [styles.userBubble, { backgroundColor: colors.primaryPink }]
                  : [styles.assistantBubble, { backgroundColor: colors.secondaryLavender }]
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  { color: message.sender === 'user' ? 'white' : '#333' }
                ]}
              >
                {message.text}
              </Text>
            </View>
          ))}
        </ScrollView>
        
        {/* Controls */}
        <View style={[styles.controls, { borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={[
              styles.micButton,
              isListening 
                ? { backgroundColor: colors.error }
                : { backgroundColor: colors.primaryPink }
            ]}
            onPress={toggleListening}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white\" size="small" />
            ) : isListening ? (
              <MicOff size={24} color="white" />
            ) : (
              <Mic size={24} color="white" />
            )}
          </TouchableOpacity>
          
          <Text style={[styles.micText, { color: colors.text }]}>
            {isLoading
              ? 'Connecting...'
              : isListening
              ? 'Listening... Tap to stop'
              : 'Tap to speak'}
          </Text>
        </View>
        
        {/* Hidden WebView for Vapi integration */}
        {webViewVisible && (
          <View style={styles.webViewContainer}>
            <WebView
              source={{ html: vapiHTML }}
              onMessage={handleWebViewMessage}
              style={styles.webView}
              originWhitelist={['*']}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              startInLoadingState={true}
              mediaPlaybackRequiresUserAction={false}
              allowsInlineMediaPlayback={true}
            />
          </View>
        )}
      </SafeAreaView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 20,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingTop: 8,
  },
  messageBubble: {
    borderRadius: 20,
    padding: 12,
    marginBottom: 8,
    maxWidth: '80%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    lineHeight: 22,
  },
  controls: {
    padding: 16,
    flexDirection: 'column',
    alignItems: 'center',
    borderTopWidth: 1,
  },
  micButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  micText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    marginTop: 4,
  },
  webViewContainer: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  webView: {
    width: 1,
    height: 1,
  },
});