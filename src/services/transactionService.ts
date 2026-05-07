import { supabase } from "../lib/supabase";
import { Transaction } from "../types";

export type Mutation =
  | { type: "CREATE"; id: string; data: any }
  | { type: "UPDATE"; id: string; data: any }
  | { type: "DELETE"; id: string };

function getQueueKey(userId: string) {
  return `sync_queue_${userId}`;
}
function getCacheKey(userId: string) {
  return `cache_${userId}`;
}

function getQueue(userId: string): Mutation[] {
  try {
    return JSON.parse(localStorage.getItem(getQueueKey(userId)) || "[]");
  } catch {
    return [];
  }
}
function saveQueue(userId: string, queue: Mutation[]) {
  localStorage.setItem(getQueueKey(userId), JSON.stringify(queue));
}
function getCache(userId: string): Transaction[] {
  try {
    return JSON.parse(localStorage.getItem(getCacheKey(userId)) || "[]");
  } catch {
    return [];
  }
}
function saveCache(userId: string, cache: Transaction[]) {
  localStorage.setItem(getCacheKey(userId), JSON.stringify(cache));
}

let syncInProgress = false;
let currentUserId: string | null = null;
let refreshCallback: (() => void) | null = null;

export async function syncOfflineMutations(userId: string) {
  if (syncInProgress || !navigator.onLine) return;
  syncInProgress = true;

  try {
    let queue = getQueue(userId);
    if (!queue.length) return;

    for (const m of queue) {
      let success = false;
      try {
        if (m.type === "CREATE") {
          const { id, ...rest } = m.data;
          const res = await supabase
            .from("transactions")
            .upsert([{ ...rest, id: m.id, user_id: userId }]);
          success = !res.error;
          if (res.error) console.error("Create sync err", res.error);
        } else if (m.type === "UPDATE") {
          const res = await supabase
            .from("transactions")
            .update({ ...m.data, updatedAt: Date.now() })
            .eq("id", m.id)
            .eq("user_id", userId);
          success = !res.error;
          if (res.error) console.error("Update sync err", res.error);
        } else if (m.type === "DELETE") {
          const res = await supabase
            .from("transactions")
            .delete()
            .eq("id", m.id)
            .eq("user_id", userId);
          success = !res.error;
          if (res.error) console.error("Delete sync err", res.error);
        }
      } catch (err) {
        console.error("Mutation failed completely", err);
      }
      
      if (success) {
        removeFromQueue(userId, m.id);
      }
    }
  } catch (err) {
    console.error("Sync failed", err);
  } finally {
    syncInProgress = false;
  }
}

window.addEventListener("online", () => {
  if (currentUserId) {
    syncOfflineMutations(currentUserId).then(() => {
      refreshCallback?.();
    });
  }
});

function applyMutationsToCache(
  cache: Transaction[],
  queue: Mutation[],
): Transaction[] {
  let mapped = [...cache];
  for (const m of queue) {
    if (m.type === "CREATE") {
      mapped.push({ ...m.data, id: m.id } as Transaction);
    } else if (m.type === "UPDATE") {
      const idx = mapped.findIndex((t) => t.id === m.id);
      if (idx !== -1) {
        mapped[idx] = { ...mapped[idx], ...m.data };
      }
    } else if (m.type === "DELETE") {
      mapped = mapped.filter((t) => t.id !== m.id);
    }
  }
  // Sort descending by date, then createdAt
  mapped.sort((a, b) => {
    if (a.date !== b.date) return b.date.localeCompare(a.date);
    return b.createdAt - a.createdAt;
  });
  return mapped;
}

export function subscribeToTransactions(
  userId: string,
  callback: (transactions: Transaction[]) => void,
  onError?: (error: Error) => void,
) {
  currentUserId = userId;

  const notifyCache = () => {
    const cached = getCache(userId);
    const queue = getQueue(userId);
    callback(applyMutationsToCache(cached, queue));
  };

  notifyCache();

  const fetchInitialData = async () => {
    if (!navigator.onLine) return notifyCache();
    try {
      await syncOfflineMutations(userId);
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false })
        .order("createdAt", { ascending: false });

      if (error) throw error;
      saveCache(userId, data as Transaction[]);
      notifyCache();
    } catch (err: any) {
      if (
        err instanceof TypeError || 
        err.message?.includes('Load failed') || 
        err.message?.includes('Failed to fetch')
      ) {
        console.warn('Network error fetching transactions, relying on cache', err);
        notifyCache();
      } else {
        if (onError) onError(err);
      }
    }
  };

  refreshCallback = fetchInitialData;
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
      (payload) => fetchInitialData(),
    )
    .subscribe();

  return {
    unsubscribe: () => supabase.removeChannel(channel),
    refresh: fetchInitialData,
  };
}

function generateUUID() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function removeFromQueue(userId: string, mutationId: string) {
  const queue = getQueue(userId);
  const updatedQueue = queue.filter(m => m.id !== mutationId);
  if (queue.length !== updatedQueue.length) {
    saveQueue(userId, updatedQueue);
  }
}

export async function createTransaction(
  userId: string,
  data: Omit<Transaction, "id" | "createdAt" | "updatedAt">,
) {
  const customId = generateUUID();
  const txData = { ...data, createdAt: Date.now(), updatedAt: Date.now() };

  const queue = getQueue(userId);
  queue.push({ type: "CREATE", id: customId, data: txData });
  saveQueue(userId, queue);

  refreshCallback?.(); // Update UI optimistically

  try {
    const res = await supabase
      .from("transactions")
      .upsert([{ ...txData, id: customId, user_id: userId }]);
      
    if (!res.error) {
      removeFromQueue(userId, customId);
    }
  } catch (err) {
    console.log("Offline mode, request queued by Workbox.");
  }

  return customId;
}

export async function updateTransaction(
  userId: string,
  transactionId: string,
  data: Partial<Omit<Transaction, "id" | "createdAt" | "updatedAt">>,
) {
  const queue = getQueue(userId);
  queue.push({ type: "UPDATE", id: transactionId, data });
  saveQueue(userId, queue);

  refreshCallback?.(); // Update UI optimistically

  try {
    const res = await supabase
      .from("transactions")
      .update({ ...data, updatedAt: Date.now() })
      .eq("id", transactionId)
      .eq("user_id", userId);
      
    if (!res.error) {
      removeFromQueue(userId, transactionId);
    }
  } catch (err) {
    console.log("Offline mode, request queued by Workbox.");
  }
}

export async function deleteTransaction(userId: string, transactionId: string) {
  const queue = getQueue(userId);
  queue.push({ type: "DELETE", id: transactionId });
  saveQueue(userId, queue);

  refreshCallback?.(); // Update UI optimistically

  try {
    const res = await supabase
      .from("transactions")
      .delete()
      .eq("id", transactionId)
      .eq("user_id", userId);
      
    if (!res.error) {
      removeFromQueue(userId, transactionId);
    }
  } catch (err) {
    console.log("Offline mode, request queued by Workbox.");
  }
}
