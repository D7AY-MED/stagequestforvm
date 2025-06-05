// src/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_STUDENT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_STUDENT_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase configuration error: VITE_STUDENT_SUPABASE_URL and VITE_STUDENT_SUPABASE_ANON_KEY must be defined in your environment variables.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const studentSupabase = createClient(
  import.meta.env.VITE_STUDENT_SUPABASE_URL,
  import.meta.env.VITE_STUDENT_SUPABASE_ANON_KEY
);

// Utility functions for role management
export async function createUserProfile(supabaseClient, profileData) {
  try {
    const { error } = await supabaseClient
      .from('profiles')
      .insert(profileData);

    if (error) {
      throw error;
    }
  } catch (err) {
    console.error('Error creating user profile:', err);
    throw err;
  }
}

export const getUserRole = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  // Ensure role is synced in raw_user_meta_data
  if (user.user_metadata?.role) {
    // Update raw_user_meta_data directly
    const { error } = await supabase.auth.updateUser({
      data: { role: user.user_metadata.role }
    });
    
    if (error) {
      console.error('Error syncing role:', error);
    }
    
    return user.user_metadata.role;
  }
  
  return null;
};

export const isStudent = async () => {
  const role = await getUserRole();
  return role === 'student';
};