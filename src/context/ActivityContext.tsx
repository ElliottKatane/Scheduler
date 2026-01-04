import { createContext, useEffect, useMemo, useState, ReactNode } from "react";
import { Activity, Currency } from "../types";

// Firestore
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase";

// ✅ ton hook (source unique auth)
import { useAuthStatus } from "../hooks/useAuthStatus";

interface ActivityContextType {
  activities: Activity[];
  addActivity: (activity: Activity) => Promise<void>;
  updateActivity: (activity: Activity) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
  toggleHidden: (id: string) => Promise<void>;
  setHourlyRate: (
    id: string,
    rate?: number,
    currency?: Currency
  ) => Promise<void>;
  isCloud: boolean;
  loading: boolean; // optionnel mais utile pour l’UI
}

export const ActivityContext = createContext<ActivityContextType | null>(null);

const LS_KEY = "activities";

function readLocalActivities(): Activity[] {
  const raw = localStorage.getItem(LS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Activity[];
  } catch {
    return [];
  }
}

export const ActivityProvider = ({ children }: { children: ReactNode }) => {
  // ✅ auth vient d’un seul endroit
  const { user /*, loading si tu l’ajoutes */ } = useAuthStatus();
  const uid = user?.uid ?? null;

  // Si ton hook n’expose pas loading, on se contente de ça :
  const loading = false;

  const isCloud = !!uid;

  // État activities
  const [activities, setActivities] = useState<Activity[]>(() => {
    // init invité
    return readLocalActivities();
  });

  // 1) Source des données: local (invité) ou Firestore (connecté)
  useEffect(() => {
    // INVITÉ
    if (!uid) {
      // coupe net toute trace du cloud dès le logout
      setActivities(readLocalActivities());
      return;
    }

    // CONNECTÉ
    const colRef = collection(db, "users", uid, "activities");
    const unsub = onSnapshot(colRef, (snap) => {
      // IMPORTANT: id = doc.id (plus fiable que d.data().id)
      const list: Activity[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Activity, "id">),
      }));
      setActivities(list);
    });

    return () => unsub();
  }, [uid]);

  // 2) Persistance invité seulement (sinon tu contamines le mode guest)
  useEffect(() => {
    if (uid) return;
    localStorage.setItem(LS_KEY, JSON.stringify(activities));
  }, [activities, uid]);

  // Helpers locaux
  const upsertLocal = (a: Activity) => {
    setActivities((prev) => {
      const idx = prev.findIndex((x) => x.id === a.id);
      if (idx === -1) return [...prev, a];
      const copy = [...prev];
      copy[idx] = a;
      return copy;
    });
  };

  // 3) CRUD — écrit soit en local (invité) soit en Firestore (connecté)
  const addActivity = async (activity: Activity) => {
    if (!uid) {
      setActivities((prev) => [...prev, activity]);
      return;
    }
    await setDoc(doc(db, "users", uid, "activities", activity.id), activity);
  };

  const updateActivity = async (updated: Activity) => {
    if (!uid) {
      upsertLocal(updated);
      return;
    }
    await setDoc(doc(db, "users", uid, "activities", updated.id), updated, {
      merge: true,
    });
  };

  const deleteActivity = async (id: string) => {
    if (!uid) {
      setActivities((prev) => prev.filter((a) => a.id !== id));
      return;
    }
    await deleteDoc(doc(db, "users", uid, "activities", id));
  };

  const toggleHidden = async (id: string) => {
    const current = activities.find((a) => a.id === id);
    if (!current) return;
    await updateActivity({ ...current, hidden: !current.hidden });
  };

  const setHourlyRate = async (
    id: string,
    rate?: number,
    currency: Currency = "CAD"
  ) => {
    const current = activities.find((a) => a.id === id);
    if (!current) return;
    await updateActivity({ ...current, hourlyRate: rate, currency });
  };

  // 4) value memo
  const value = useMemo<ActivityContextType>(
    () => ({
      activities,
      addActivity,
      updateActivity,
      deleteActivity,
      toggleHidden,
      setHourlyRate,
      isCloud,
      loading,
    }),
    [activities, isCloud, loading]
  );

  return (
    <ActivityContext.Provider value={value}>
      {children}
    </ActivityContext.Provider>
  );
};
