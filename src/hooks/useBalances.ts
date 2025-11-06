import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { Balance } from "../types/database";

export function useBalances(userId: string | undefined) {
  if (!userId) return { balances: [], loading: false };
  const [balances, setBalances] = useState<Balance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchBalances = async () => {
      const { data, error } = await supabase
        .from("balances")
        .select("*")
        .eq("user_id", userId);

      if (error) {
        console.error("Error fetching balances:", error);
      } else {
        setBalances(data || []);
      }
      setLoading(false);
    };

    fetchBalances();

    const channel = supabase
      .channel("balances_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "balances",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setBalances((prev) => [...prev, payload.new as Balance]);
          } else if (payload.eventType === "UPDATE") {
            setBalances((prev) =>
              prev.map((b) =>
                b.id === payload.new.id ? (payload.new as Balance) : b,
              ),
            );
          } else if (payload.eventType === "DELETE") {
            setBalances((prev) => prev.filter((b) => b.id !== payload.old.id));
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return { balances, loading };
}
