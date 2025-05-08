import { createContext, useState, useEffect, ReactNode } from "react";
import { SavedSchedule } from "../types";

interface SavedSchedulesContextType {
  schedules: SavedSchedule[];
  addSchedule: (schedule: SavedSchedule) => void;
  deleteSchedule: (id: string) => void;
}

export const SavedSchedulesContext =
  createContext<SavedSchedulesContextType | null>(null);

export const SavedSchedulesProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  // ✅ Initialisation directement depuis le localStorage
  const [schedules, setSchedules] = useState<SavedSchedule[]>(() => {
    const saved = localStorage.getItem("schedules");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        console.log("📥 Chargement initial des schedules", parsed);
        return parsed;
      } catch (e) {
        console.error("❌ Erreur parsing schedules", e);
      }
    }
    return [];
  });

  // 💾 Sauvegarde automatique quand schedules change
  useEffect(() => {
    localStorage.setItem("schedules", JSON.stringify(schedules));
    console.log("💾 Sauvegarde des schedules", schedules);
  }, [schedules]);

  const addSchedule = (schedule: SavedSchedule) => {
    console.log("➕ addSchedule() appelé avec :", schedule);
    setSchedules((prev) => {
      const exists = prev.some((s) => s.id === schedule.id);
      const next = exists ? prev : [...prev, schedule];
      console.log("✅ Nouvelle liste de schedules :", next);
      return next;
    });
  };

  const deleteSchedule = (id: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <SavedSchedulesContext.Provider
      value={{ schedules, addSchedule, deleteSchedule }}
    >
      {children}
    </SavedSchedulesContext.Provider>
  );
};
