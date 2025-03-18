
import { useState, useEffect } from 'react';
import { User } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AuthResponse } from './types';
import { Session } from '@supabase/supabase-js';

export function useAuthProvider() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        
        // Get the current session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log("Initial session check:", currentSession);
        
        if (currentSession) {
          setSession(currentSession);
          // Get user data from session
          const userInfo: User = {
            id: currentSession.user.id,
            name: currentSession.user.user_metadata.name || '',
            email: currentSession.user.email || '',
            skills: currentSession.user.user_metadata.skills || [],
            visualPoints: 0,
            textualPoints: 0,
            createdAt: currentSession.user.created_at,
            updatedAt: new Date().toISOString(),
          };
          setUser(userInfo);
          localStorage.setItem('user', JSON.stringify(userInfo));
        } else {
          // Check for stored user data
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            try {
              setUser(JSON.parse(storedUser));
            } catch (error) {
              console.error('Failed to parse stored user data:', error);
              localStorage.removeItem('user');
            }
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("Auth state change event:", event);
        console.log("New session:", newSession);
        
        setSession(newSession);
        
        if (newSession) {
          // Get user data from session
          const userInfo: User = {
            id: newSession.user.id,
            name: newSession.user.user_metadata.name || '',
            email: newSession.user.email || '',
            skills: newSession.user.user_metadata.skills || [],
            visualPoints: 0,
            textualPoints: 0,
            createdAt: newSession.user.created_at,
            updatedAt: new Date().toISOString(),
          };
          setUser(userInfo);
          localStorage.setItem('user', JSON.stringify(userInfo));
        } else {
          setUser(null);
          localStorage.removeItem('user');
        }
        
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success('Logged in successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Login failed. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      setIsLoading(true);
      // Changed to not require email confirmation
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/onboarding`,
          data: {
            email: email
          }
        }
      });

      if (error) throw error;

      // Check if email confirmation is required or if user is created directly
      if (data?.user && !data.user.identities?.length) {
        toast.error('Email address is already registered. Please login instead.');
      } else if (data?.user && data.session) {
        // User is immediately signed in (email confirmation is disabled in Supabase)
        toast.success('Account created successfully! Redirecting...');
      } else {
        // Email confirmation is required
        toast.success('Account created successfully! Please check your email for verification.');
      }
      
      return data;
    } catch (error: any) {
      toast.error(error.message || 'Signup failed. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/onboarding`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        },
      });

      if (error) throw error;
      
      console.log("Google OAuth initiated, redirecting to:", data.url);
      toast.success('Redirecting to Google for authentication...');
    } catch (error: any) {
      console.error("Google OAuth error:", error);
      toast.error(error.message || 'Google login failed. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setSession(null);
      localStorage.removeItem('user');
      toast.success('Logged out successfully');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error('Failed to log out');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
    signInWithGoogle,
    session,
  };
}
