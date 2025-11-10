import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";

interface Profile {
  id: string;
  uid?: string;
  email: string | null;
  created_at?: string;
}

interface UserData {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
}

export function useUser() {
  const [userData, setUserData] = useState<UserData>({
    user: null,
    profile: null,
    loading: true,
    isAdmin: false,
  });

  useEffect(() => {
    let mounted = true;
    let listener: any = null; // ← Store listener here

    async function initSession() {
      setUserData((prev) => ({ ...prev, loading: true }));

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        await loadUserData(session.user);
      }

      // ← MOVE LISTENER OUTSIDE initSession
      const { data: authListener } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          if (!mounted) return;

          if (session?.user) {
            loadUserData(session.user);
          } else {
            setUserData({
              user: null,
              profile: null,
              loading: false,
              isAdmin: false,
            });
          }
        },
      );

      listener = authListener; // ← Save reference

      if (mounted) {
        setUserData((prev) => ({ ...prev, loading: false }));
      }
    }

    initSession();

    return () => {
      mounted = false;
      if (listener?.subscription) {
        listener.subscription.unsubscribe(); // ← Proper cleanup
      }
    };
  }, []); // ← Only run once

  async function loadUserData(user: User) {
    if (!mounted) return;

    try {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      let finalProfile = profile;

      if (profileError && profileError.code === "PGRST116") {
        const { data: newProfile, error: createError } = await supabase
          .from("profiles")
          .insert([{ id: user.id, email: user.email }])
          .select()
          .single();
        if (createError) throw createError;
        finalProfile = newProfile;
      } else if (profileError) {
        throw profileError;
      }

      const { data: adminData } = await supabase
        .from("admins")
        .select("user_id")
        .eq("user_id", user.id)
        .single();

      setUserData({
        user,
        profile: finalProfile,
        loading: false,
        isAdmin: !!adminData,
      });
    } catch (error) {
      console.error("Error loading user data:", error);
      setUserData({ user, profile: null, loading: false, isAdmin: false });
    }
  }

  return userData;
}
