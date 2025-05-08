import { useContext } from "react";
import { SavedSchedulesContext } from "../context/SavedSchedulesContext";

export function useSavedSchedules() {
  const context = useContext(SavedSchedulesContext);
  if (!context) {
    throw new Error("useSavedSchedules must be used within a SavedSchedulesProvider");
  }
  return context;
}
