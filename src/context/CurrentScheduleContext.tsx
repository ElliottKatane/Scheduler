import { createContext, useState, useContext, ReactNode } from "react";
import { SavedSchedule } from "../types";

interface CurrentScheduleContextType {
  currentSchedule: SavedSchedule | null;
  setCurrentSchedule: (schedule: SavedSchedule | null) => void;
  lastSaved: Date | null;
  markSaved: (data: Map<string, string>) => void;
  hasChanges: (currentData: Map<string, string>) => boolean;
}

export const CurrentScheduleContext =
  createContext<CurrentScheduleContextType | null>(null);

export const CurrentScheduleProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [currentSchedule, setCurrentSchedule] = useState<SavedSchedule | null>(
    null
  );
  const [initialData, setInitialData] = useState<Map<string, string>>(
    new Map()
  );
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const markSaved = (data: Map<string, string>) => {
    setInitialData(new Map(data));
    setLastSaved(new Date());
  };

  const hasChanges = (currentData: Map<string, string>) => {
    if (initialData.size !== currentData.size) return true;
    for (const [key, value] of initialData.entries()) {
      if (currentData.get(key) !== value) return true;
    }
    return false;
  };

  const handleSetCurrent = (schedule: SavedSchedule | null) => {
    setCurrentSchedule(schedule);
    setInitialData(schedule ? new Map(schedule.data) : new Map());
    setLastSaved(schedule ? new Date() : null);
  };

  return (
    <CurrentScheduleContext.Provider
      value={{
        currentSchedule,
        setCurrentSchedule: handleSetCurrent,
        lastSaved,
        markSaved,
        hasChanges,
      }}
    >
      {children}
    </CurrentScheduleContext.Provider>
  );
};

export const useCurrentSchedule = () => {
  const context = useContext(CurrentScheduleContext);
  if (!context) {
    throw new Error(
      "useCurrentSchedule must be used within a CurrentScheduleProvider"
    );
  }
  return context;
};
