import { createContext, useState, useEffect, ReactNode } from "react";
import { Activity, Currency } from "../types";

interface ActivityContextType {
  activities: Activity[];
  addActivity: (activity: Activity) => void;
  updateActivity: (activity: Activity) => void;
  deleteActivity: (id: string) => void;
  toggleHidden: (id: string) => void; // nouveau
  setHourlyRate: (id: string, rate?: number, currency?: Currency) => void; // nouveau
}

export const ActivityContext = createContext<ActivityContextType | null>(null);

export const ActivityProvider = ({ children }: { children: ReactNode }) => {
  const [activities, setActivities] = useState<Activity[]>(() => {
    const stored = localStorage.getItem("activities");
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem("activities", JSON.stringify(activities));
  }, [activities]);

  const addActivity = (activity: Activity) => {
    setActivities((prev) => [...prev, activity]);
  };

  const updateActivity = (updated: Activity) => {
    setActivities((prev) =>
      prev.map((a) => (a.id === updated.id ? updated : a))
    );
  };

  const deleteActivity = (id: string) => {
    setActivities((prev) => prev.filter((a) => a.id !== id));
  };
  const toggleHidden = (id: string) => {
    setActivities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, hidden: !a.hidden } : a))
    );
  };

  const setHourlyRate = (
    id: string,
    rate?: number,
    currency: Currency = "CAD"
  ) => {
    setActivities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, hourlyRate: rate, currency } : a))
    );
  };

  return (
    <ActivityContext.Provider
      value={{
        activities,
        addActivity,
        updateActivity,
        deleteActivity,
        toggleHidden,
        setHourlyRate,
      }}
    >
      {children}
    </ActivityContext.Provider>
  );
};
