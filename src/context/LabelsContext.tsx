import { createContext, useEffect, useState, ReactNode, useMemo } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  serverTimestamp,
  setDoc,
  updateDoc,
  arrayUnion,
  onSnapshot,
} from "firebase/firestore";
import { auth, db } from "../firebase";

interface LabelsContextType {
  labels: string[];
  addLabel: (label: string) => Promise<void> | void;
  deleteLabel: (label: string) => Promise<void> | void;
  isCloud: boolean;
}

export const LabelsContext = createContext<LabelsContextType | null>(null);

const LS_KEY = "labels";

export const LabelsProvider = ({ children }: { children: ReactNode }) => {
  const [labels, setLabels] = useState<string[]>([]);
  const [uid, setUid] = useState<string | null>(null);
  const isCloud = !!uid;

  // auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => setUid(user?.uid ?? null));
    return () => unsub();
  }, []);

  // load labels
  useEffect(() => {
    // invité -> localStorage
    if (!uid) {
      const stored = localStorage.getItem(LS_KEY);
      setLabels(stored ? JSON.parse(stored) : []);
      return;
    }

    // connecté -> Firestore doc unique
    const ref = doc(db, "users", uid, "meta", "labels");
    const unsub = onSnapshot(ref, (snap) => {
      const data = snap.data() as { labels?: string[] } | undefined;
      setLabels(Array.isArray(data?.labels) ? data!.labels : []);
    });

    return () => unsub();
  }, [uid]);

  // persist localStorage only for guest
  useEffect(() => {
    if (!uid) {
      localStorage.setItem(LS_KEY, JSON.stringify(labels));
    }
  }, [labels, uid]);

  const addLabel = async (label: string) => {
    const trimmed = label.trim();
    if (!trimmed) return;

    // UI: optimistic
    setLabels((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));

    if (!uid) return;

    const ref = doc(db, "users", uid, "meta", "labels");

    // crée si absent + merge
    await setDoc(ref, { updatedAt: serverTimestamp() }, { merge: true });

    // ajoute sans doublon (Firestore gère)
    await updateDoc(ref, {
      labels: arrayUnion(trimmed),
      updatedAt: serverTimestamp(),
    });
  };

  const deleteLabel = async (label: string) => {
    const trimmed = label.trim();
    if (!trimmed) return;

    setLabels((prev) => prev.filter((l) => l !== trimmed));

    if (!uid) return;

    const nextLabels = labels.filter((l) => l !== trimmed);

    await setDoc(
      doc(db, "users", uid, "meta", "labels"),
      { labels: nextLabels, updatedAt: serverTimestamp() },
      { merge: true }
    );
  };

  const value = useMemo(
    () => ({ labels, addLabel, deleteLabel, isCloud }),
    [labels, uid]
  );

  return (
    <LabelsContext.Provider value={value}>{children}</LabelsContext.Provider>
  );
};
