import { supabase } from '@/lib/supabase/client';

export const authService = {
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  onAuthStateChange(callback) {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session);
    });
    return data.subscription;
  },

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.session;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
};
