// import { toast } from "react-toastify";
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { User } from '@/types/types';
import { useUser } from '@/state/user';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabaseDb = createClient(supabaseUrl, supabaseAnonKey);

export const supabaseAuth = supabaseDb.auth;

export const supabaseStorage = supabaseDb.storage;

export async function signInWithEmail(email: string, password: string): Promise<User | null> {
  const { data, error } = await supabaseAuth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  const { user } = data;
  if (!user) return null;

  const formattedUser: User = {
    id: user.id,
    email: user.email as string,
    username: user.user_metadata?.username || '',
    name: user.user_metadata?.name || '',
    userType: user.user_metadata?.userType || 'user',
    created_at: user.created_at,
    updated_at: user.updated_at
  };

  const { setUser } = useUser();
  setUser(formattedUser);
  return formattedUser;
}

export async function signUpWithEmail(email: string, password: string): Promise<User | null> {
  const { data, error } = await supabaseAuth.signUp({
    email,
    password,
  });

  if (error) throw error;

  const { user } = data;
  if (!user) return null;

  const formattedUser: User = {
    id: user.id,
    email: user.email as string,
    username: user.user_metadata?.username || '',
    name: user.user_metadata?.name || '',
    userType: user.user_metadata?.userType || 'user',
    created_at: user.created_at,
    updated_at: user.updated_at
  };

  const { setUser } = useUser();
  setUser(formattedUser);
  return formattedUser;
}

export async function signOut(): Promise<void> {
  const { error } = await supabaseDb.auth.signOut();

  if (error) throw error;

  const { setUser } = useUser();
  setUser(null);
}

export const useSupabase = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize session
    supabaseDb.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const supabaseUser = session.user;
        setUser({
          id: supabaseUser.id,
          email: supabaseUser.email!,
          username: supabaseUser.user_metadata?.username || '',
          name: supabaseUser.user_metadata?.name || '',
          userType: supabaseUser.user_metadata?.userType || 'user',
          created_at: supabaseUser.created_at,
          updated_at: supabaseUser.updated_at
        } as User);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabaseDb.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const supabaseUser = session.user;
        setUser({
          id: supabaseUser.id,
          email: supabaseUser.email!,
          username: supabaseUser.user_metadata?.username || '',
          name: supabaseUser.user_metadata?.name || '',
          userType: supabaseUser.user_metadata?.userType || 'user',
          created_at: supabaseUser.created_at,
          updated_at: supabaseUser.updated_at
        } as User);
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const { data: { session }, error: authError } = await supabaseDb.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (session?.user) {
        const supabaseUser = session.user;
        setUser({
          id: supabaseUser.id,
          email: supabaseUser.email!,
          username: supabaseUser.user_metadata?.username || '',
          name: supabaseUser.user_metadata?.name || '',
          userType: supabaseUser.user_metadata?.userType || 'user',
          created_at: supabaseUser.created_at,
          updated_at: supabaseUser.updated_at
        } as User);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const { data: { user }, error: authError } = await supabaseDb.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (user) {
        setUser({
          id: user.id,
          email: user.email!,
          username: user.user_metadata?.username || '',
          name: user.user_metadata?.name || '',
          userType: user.user_metadata?.userType || 'user',
          created_at: user.created_at,
          updated_at: user.updated_at
        } as User);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);
      const { error: authError } = await supabaseDb.auth.signOut();

      if (authError) throw authError;

      setUser(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
  };
};

export const createUserInSupabase = async ({
  userRole,
  userData,
  tableName,
  tableData,
}: {
  userRole: string;
  userData: {
    email: string;
    password: string;
  };
  tableName: string;
  tableData: Record<string, any>;
}) => {
  const { data, error } = await supabaseAuth.signUp({
    email: userData.email,
    password: userData.password,
    options: {
      data: {
        role: userRole,
      },
    },
  });

  if (error) {
    console.error(error);
    toast.error(error.message);
    return;
  }

  if (data.user) {
    const user = data.user;

    const defaultTableData = {
      user_id: user.id,
    };

    const { data: newUser, error: insertError } = await supabaseDb
      .from(tableName)
      .insert({ ...defaultTableData, ...tableData })
      .select('*');

    if (insertError) {
      console.error(insertError);
      toast.error(insertError.message);

      return;
    }

    if (newUser) {
      return newUser[0];
    } else {
      return null;
    }
  }
};


export const getFullImageUrl = (
  bucketName: string,
  assetName: string
): string => {
  if (assetName.startsWith('http')) {
    return assetName;
  }
  const projectId = supabaseUrl.split('.').slice(0, -1).join('.');
  const apiUrl = `${projectId}.co/storage/v1/object/public/${bucketName}/${assetName}`;

  return apiUrl;
};

export const getUser = async () => {
  let { data, error } = await supabaseDb.auth.getUser();
  if (error) {
    console.error('error', error);
    return null;
  }
  const { setUser } = useUser();
  setUser(data.user);
  return data.user;
};

export const uploadFileAndGetUrl = async (
  bucketName: string,
  fileName: string,
  file: File,
  fileType: 'avatar' | 'logo' | 'product' | 'other'
): Promise<string | null> => {
  const timestamp = Date.now();
  const filePath = `${fileType}-${fileName}-${timestamp}`;

  const { data, error: uploadError } = await supabaseDb.storage
    .from(bucketName)
    .upload(filePath, file);

  if (uploadError) {
    toast.error(uploadError.message);
    console.error(uploadError);
    return null;
  }
  return data.path;
};
