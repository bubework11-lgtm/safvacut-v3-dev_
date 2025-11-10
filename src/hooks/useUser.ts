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
    let unsubscribe: (() => void) | undefined;

    const init = async () => {
      setUserData((prev) => ({ ...prev, loading: true }));

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        await loadUserData(session.user);
      }

      const { data: listener } = supabase.auth.onAuthStateChange(
        async (_event, session) => {
          if (!mounted) return;

          if (session?.user) {
            await loadUserData(session.user);
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

      // Handle both old and new Supabase return formats
      const sub = listener?.subscription ?? listener;
      if (typeof sub?.unsubscribe === "function") {
        unsubscribe = sub.unsubscribe.bind(sub);
      }

      if (mounted) {
        setUserData((prev) => ({ ...prev, loading: false }));
      }
    };

    init();

    return () => {
      mounted = false;
      unsubscribe?.();
    };
  }, []);

  const loadUserData = async (user: User) => {
    if (!mounted) return;

    try {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      let finalProfile = profile;

      if (profileError?.code === "PGRST116") {
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
  };

  return userData;
}
