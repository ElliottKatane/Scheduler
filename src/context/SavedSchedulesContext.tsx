import {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
} from "react";
import { SavedSchedule } from "../types";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

interface SavedSchedulesContextType {
  schedules: SavedSchedule[];
  addSchedule: (schedule: SavedSchedule) => Promise<void>;
  deleteSchedule: (id: string) => Promise<void>;
  updateSchedule: (id: string, map: Map<string, string>) => Promise<void>;
  updateScheduleName: (id: string, newName: string) => Promise<void>;
}

export const SavedSchedulesContext =
  createContext<SavedSchedulesContextType | null>(null);

/** Firestore object -> entries for your SavedSchedule.data */
const objectToEntries = (o: Record<string, string>) =>
  Object.entries(o) as [string, string][];

export const SavedSchedulesProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [uid, setUid] = useState<string | null>(null);

  // Mode invité: init depuis localStorage
  const [schedules, setSchedules] = useState<SavedSchedule[]>(() => {
    const saved = localStorage.getItem("schedules");
    if (!saved) return [];
    try {
      return JSON.parse(saved) as SavedSchedule[];
    } catch (e) {
      console.error("Erreur parsing schedules", e);
      return [];
    }
  });

  // Auth listener
  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setUid(user?.uid ?? null);
    });
  }, []);

  // Migration one-shot: localStorage -> Firestore au premier login
  useEffect(() => {
    if (!uid) return;

    const migratedKey = `migrated_schedules_${uid}`;
    if (localStorage.getItem(migratedKey) === "1") return;

    const raw = localStorage.getItem("schedules");
    if (!raw) {
      localStorage.setItem(migratedKey, "1");
      return;
    }

    let localSchedules: SavedSchedule[] = [];
    try {
      localSchedules = JSON.parse(raw) as SavedSchedule[];
    } catch (e) {
      console.error("Erreur parsing schedules (migration)", e);
      return;
    }

    // Même si vide: on marque migré pour éviter de boucler
    if (!localSchedules.length) {
      localStorage.setItem(migratedKey, "1");
      return;
    }

    Promise.all(
      localSchedules.map((s) =>
        setDoc(
          doc(db, "users", uid, "schedules", s.id),
          {
            name: s.name ?? "Sans titre",
            // IMPORTANT: on écrit en OBJET, pas en tableau de tableaux
            slotToActivityMap: Object.fromEntries(s.data ?? []),
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        )
      )
    )
      .then(() => {
        localStorage.removeItem("schedules");
        localStorage.setItem(migratedKey, "1");
      })
      .catch((e) => console.error("Firestore migration", e));
  }, [uid]);

  // Source de vérité: localStorage si invité, Firestore si connecté
  useEffect(() => {
    // flush immédiat au switch (évite les “fantômes”)
    setSchedules([]);

    // Invité -> localStorage
    if (!uid) {
      const raw = localStorage.getItem("schedules");
      if (!raw) return;

      try {
        setSchedules(JSON.parse(raw) as SavedSchedule[]);
      } catch {
        setSchedules([]);
      }
      return;
    }

    // Connecté -> Firestore snapshot
    const colRef = collection(db, "users", uid, "schedules");
    const unsub = onSnapshot(colRef, (snap) => {
      const next: SavedSchedule[] = snap.docs.map((d) => {
        const data = d.data() as any;
        const slotObj = (data.slotToActivityMap ?? {}) as Record<
          string,
          string
        >;

        return {
          id: d.id,
          name: data.name ?? "Sans titre",
          data: objectToEntries(slotObj),
        };
      });

      setSchedules(next);
    });

    return () => unsub();
  }, [uid]);

  // Persistance locale uniquement en mode invité
  useEffect(() => {
    if (uid) return;
    localStorage.setItem("schedules", JSON.stringify(schedules));
  }, [schedules, uid]);

  const addSchedule = async (schedule: SavedSchedule): Promise<void> => {
    if (!uid) {
      setSchedules((prev) => {
        const exists = prev.some((s) => s.id === schedule.id);
        return exists ? prev : [...prev, schedule];
      });
      return;
    }

    try {
      await setDoc(
        doc(db, "users", uid, "schedules", schedule.id),
        {
          name: schedule.name ?? "Sans titre",
          slotToActivityMap: Object.fromEntries(schedule.data ?? []),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (e) {
      console.error("Firestore addSchedule", e);
      throw e;
    }
  };

  const deleteSchedule = async (id: string): Promise<void> => {
    if (!uid) {
      setSchedules((prev) => prev.filter((s) => s.id !== id));
      return;
    }

    try {
      await deleteDoc(doc(db, "users", uid, "schedules", id));
      // pas besoin de setSchedules ici: le snapshot va refresh
    } catch (e) {
      console.error("Firestore deleteSchedule", e);
      throw e;
    }
  };

  const updateSchedule = async (id: string, map: Map<string, string>) => {
    // UI locale: OK (entries = array of tuples)
    setSchedules((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, data: Array.from(map.entries()) } : s
      )
    );

    // invité => rien à pousser en cloud
    if (!uid) return;

    // Firestore: IMPORTANT = objet plat, pas un tableau d'entries
    await updateDoc(doc(db, "users", uid, "schedules", id), {
      slotToActivityMap: Object.fromEntries(map),
      updatedAt: serverTimestamp(),
    });
  };

  const updateScheduleName = async (
    id: string,
    newName: string
  ): Promise<void> => {
    // Local update
    setSchedules((prev) =>
      prev.map((s) => (s.id === id ? { ...s, name: newName } : s))
    );

    if (!uid) return;

    try {
      await setDoc(
        doc(db, "users", uid, "schedules", id),
        {
          name: newName,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (e) {
      console.error("Firestore updateScheduleName", e);
      throw e;
    }
  };

  return (
    <SavedSchedulesContext.Provider
      value={{
        schedules,
        addSchedule,
        deleteSchedule,
        updateSchedule,
        updateScheduleName,
      }}
    >
      {children}
    </SavedSchedulesContext.Provider>
  );
};

export function useSavedSchedules() {
  const context = useContext(SavedSchedulesContext);
  if (!context) {
    throw new Error(
      "useSavedSchedules must be used within a SavedSchedulesProvider"
    );
  }
  return context;
}
