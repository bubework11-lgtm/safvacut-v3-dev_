import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { Balance } from "../types/database";

export function useBalances(userId: string | undefined) {
  // 1. All hooks MUST be declared at the top level, unconditionally.
  const [balances, setBalances] = useState<Balance[]>([]);
  const [loading, setLoading] = useState(true);

  // 2. Add a variable to handle the loading state locally.
  const isEnabled = !!userId;

  useEffect(() => {
    // 3. Conditional logic goes inside the hook.
    if (!isEnabled) {
      setLoading(false); // Make sure to handle the loading state if skipped
      setBalances([]);
      return;
    }

    const fetchBalances = async () => {
      // ... your fetch logic remains here
      const { data, error } = await supabase
        .from("balances")
        .select("*")
        .eq("user_id", userId as string); // Add type assertion since it's checked

      if (error) {
        console.error("Error fetching balances:", error);
      } else {
        setBalances(data || []);
      }
      setLoading(false);
    };

    fetchBalances();

    // ... your real-time channel logic remains here

    const channel = supabase.channel("balances_changes");
    // ... subscribe logic ...

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, isEnabled]); // Add dependencies

  // 4. Handle the final return value
  if (!isEnabled) {
    return { balances: [], loading: false };
  }

  return { balances, loading };
}
