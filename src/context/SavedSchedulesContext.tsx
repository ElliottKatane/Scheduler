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

// Helpers conversion
const entriesToObject = (entries: [string, string][]) =>
  Object.fromEntries(entries);

const mapToObject = (m: Map<string, string>) => Object.fromEntries(m);

const objectToEntries = (o: Record<string, string>) =>
  Object.entries(o) as [string, string][];

export const SavedSchedulesProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [uid, setUid] = useState<string | null>(null);

  // ✅ init depuis localStorage (mode invité)
  const [schedules, setSchedules] = useState<SavedSchedule[]>(() => {
    const saved = localStorage.getItem("schedules");
    if (!saved) return [];
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("❌ Erreur parsing schedules", e);
      return [];
    }
  });

  // 🔐 écouter l'auth
  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setUid(user?.uid ?? null);
    });
  }, []);

  // 🚚 Migration one-shot des EDT locaux vers Firestore au premier login
  useEffect(() => {
    if (!uid) return;
    const migratedKey = `migrated_schedules_${uid}`;
    if (localStorage.getItem(migratedKey) === "1") return;
    // migration one-shot: localStorage -> Firestore
    const raw = localStorage.getItem("schedules");
    if (!raw) {
      localStorage.setItem(migratedKey, "1");
      return;
    }

    let localSchedules: SavedSchedule[] = [];
    try {
      localSchedules = JSON.parse(raw);
    } catch {
      return;
    }

    if (!localSchedules.length) return;

    // push tout en cloud (merge)
    Promise.all(
      localSchedules.map((s) =>
        setDoc(
          doc(db, "users", uid, "schedules", s.id),
          {
            name: s.name ?? "Sans titre",
            slotToActivityMap: entriesToObject(s.data ?? []),
            updatedAt: serverTimestamp(),
            createdAt: serverTimestamp(), // optionnel (merge => ne remplacera pas si déjà présent si tu gères ça plus bas)
          },
          { merge: true }
        )
      )
    )
      .then(() => {
        // option: une fois migré, tu peux supprimer le local pour éviter confusion
        localStorage.removeItem("schedules");
        localStorage.setItem(migratedKey, "1");
      })
      .catch((e) => console.error("❌ Firestore migration", e));
  }, [uid]);

  // 📦 Source de vérité des EDT : localStorage en invité, Firestore en connecté (flush au switch)
  useEffect(() => {
    // flush immédiat (évite l'ancien mode à l'écran)
    setSchedules([]);

    // invité -> localStorage
    if (!uid) {
      const raw = localStorage.getItem("schedules");
      if (!raw) return;

      try {
        setSchedules(JSON.parse(raw));
      } catch {
        setSchedules([]);
      }
      return;
    }

    // connecté -> Firestore snapshot
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

  // 💾 Persistance locale des EDT uniquement en mode invité
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
          name: schedule.name,
          slotToActivityMap: entriesToObject(schedule.data),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (e) {
      console.error("❌ Firestore addSchedule", e);
    }
  };

  const deleteSchedule = async (id: string): Promise<void> => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));

    if (!uid) return;

    await deleteDoc(doc(db, "users", uid, "schedules", id));
  };

  const updateSchedule = async (
    id: string,
    data: Map<string, string>
  ): Promise<void> => {
    setSchedules((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, data: Array.from(data.entries()) } : s
      )
    );

    if (!uid) return;

    await setDoc(
      doc(db, "users", uid, "schedules", id),
      {
        slotToActivityMap: mapToObject(data),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  };

  const updateScheduleName = async (
    id: string,
    newName: string
  ): Promise<void> => {
    setSchedules((prev) =>
      prev.map((s) => (s.id === id ? { ...s, name: newName } : s))
    );

    if (!uid) return;

    await setDoc(
      doc(db, "users", uid, "schedules", id),
      {
        name: newName,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
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
