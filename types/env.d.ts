declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_VAPI_PUBLIC_KEY: string;
      EXPO_PUBLIC_VAPI_ASSISTANT_ID: string;
    }
  }
}

export {};