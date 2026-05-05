import { supabase } from "../lib/supabase";
import { Transaction } from "../types";

export function subscribeToTransactions(
  userId: string,
  callback: (transactions: Transaction[]) => void,
  onError?: (error: Error) => void,
) {
  let transactions: Transaction[] = [];

  const fetchInitialData = async () => {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false })
        .order("createdAt", { ascending: false });

      if (error) throw error;
      transactions = data as Transaction[];
      callback(transactions);
    } catch (err: any) {
      if (onError) onError(err);
    }
  };

  fetchInitialData();

  const channel = supabase
    .channel("transactions_changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "transactions",
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        fetchInitialData(); // Re-fetch on any change
      }
    )
    .subscribe();

  return {
    unsubscribe: () => {
      supabase.removeChannel(channel);
    },
    refresh: fetchInitialData,
  };
}

export async function createTransaction(
  userId: string,
  data: Omit<Transaction, "id" | "createdAt" | "updatedAt">,
) {
  const { data: insertedData, error } = await supabase
    .from("transactions")
    .insert([{
      ...data,
      user_id: userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }])
    .select()
    .single();

  if (error) throw error;
  return insertedData.id;
}

export async function updateTransaction(
  userId: string,
  transactionId: string,
  data: Partial<Omit<Transaction, "id" | "createdAt" | "updatedAt">>,
) {
  const { error } = await supabase
    .from("transactions")
    .update({
      ...data,
      updatedAt: Date.now(),
    })
    .eq("id", transactionId)
    .eq("user_id", userId);

  if (error) throw error;
}

export async function deleteTransaction(userId: string, transactionId: string) {
  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", transactionId)
    .eq("user_id", userId);

  if (error) throw error;
}
