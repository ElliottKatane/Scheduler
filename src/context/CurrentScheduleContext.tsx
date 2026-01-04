import {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import { SavedSchedule } from "../types";
import { useAuthStatus } from "../hooks/useAuthStatus";

interface CurrentScheduleContextType {
  currentSchedule: SavedSchedule | null;
  setCurrentSchedule: (schedule: SavedSchedule | null) => void;
  lastSaved: Date | null;
  markSaved: (data: Map<string, string>) => void;
  hasChanges: (currentData: Map<string, string>) => boolean;
}

export const CurrentScheduleContext =
  createContext<CurrentScheduleContextType | null>(null);

const signatureOf = (m: Map<string, string>) => {
  // trié => stable, même si l'ordre des entries varie
  const entries = Array.from(m.entries()).sort(([a], [b]) =>
    a.localeCompare(b)
  );
  return JSON.stringify(entries);
};

export const CurrentScheduleProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { user } = useAuthStatus();
  const uid = user?.uid ?? null;

  const [currentSchedule, setCurrentSchedule] = useState<SavedSchedule | null>(
    null
  );

  // au lieu de stocker une Map, on stocke une signature stable
  const [initialSignature, setInitialSignature] = useState<string>(() =>
    signatureOf(new Map())
  );

  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // reset auto si changement de compte/mode
  useEffect(() => {
    setCurrentSchedule(null);
    setInitialSignature(signatureOf(new Map()));
    setLastSaved(null);
  }, [uid]);

  const markSaved = (data: Map<string, string>) => {
    setInitialSignature(signatureOf(data));
    setLastSaved(new Date());
  };

  const hasChanges = (currentData: Map<string, string>) => {
    return signatureOf(currentData) !== initialSignature;
  };

  const handleSetCurrent = (schedule: SavedSchedule | null) => {
    setCurrentSchedule(schedule);

    const map = schedule ? new Map<string, string>(schedule.data) : new Map();
    setInitialSignature(signatureOf(map));

    // option: tu peux garder la date "maintenant" si tu veux
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
