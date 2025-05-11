import { SavedSchedule } from "../types";
import { useEffect, useState } from "react";
import { useSavedSchedules } from "../context/SavedSchedulesContext";
import { useCurrentSchedule } from "../context/CurrentScheduleContext";
import "../CSS/ScheduleActions.css"; // ajoute ça en haut

interface Props {
  slotToActivityMap: Map<string, string>;
  clearSelection: () => void;
  setSlotToActivityMap: (map: Map<string, string>) => void;
  setSelectedActivityId: (id: string) => void;
  setPendingAssignment: (id: string | null) => void;
  setConflictingSlots: (slots: string[]) => void;
  setHasConflicts: (has: boolean) => void;
}

const ScheduleActions: React.FC<Props> = ({
  slotToActivityMap,
  clearSelection,
  setSlotToActivityMap,
  setSelectedActivityId,
  setPendingAssignment,
  setConflictingSlots,
  setHasConflicts,
}) => {
  const { addSchedule, updateSchedule } = useSavedSchedules();

  const { currentSchedule, setCurrentSchedule, markSaved, hasChanges } =
    useCurrentSchedule();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    const unsaved = currentSchedule !== null && hasChanges(slotToActivityMap);
    setHasUnsavedChanges(unsaved);
  }, [slotToActivityMap, currentSchedule]);

  const handleClear = () => {
    if (
      confirm("Voulez-vous vraiment réinitialiser tout l'emploi du temps ?")
    ) {
      setSlotToActivityMap(new Map());
      clearSelection();
      setSelectedActivityId("");
      setPendingAssignment(null);
      setConflictingSlots([]);
      setHasConflicts(false);
    }
  };

  const handleSaveNew = () => {
    const name = prompt("Nom de l'emploi du temps :");
    if (!name) return;

    const newSchedule: SavedSchedule = {
      id: crypto.randomUUID(),
      name,
      data: Array.from(slotToActivityMap.entries()),
    };
    addSchedule(newSchedule);
    setCurrentSchedule(newSchedule);
    alert("Emploi du temps sauvegardé !");
  };

  const handleUpdateExisting = () => {
    if (!currentSchedule) return;
    updateSchedule(currentSchedule.id, slotToActivityMap);
    markSaved(slotToActivityMap);
    alert("Emploi du temps mis à jour.");
  };

  return (
    <div className="schedule-actions">
      <div className="action-group">
        <button onClick={handleSaveNew}>Save as...</button>
        {currentSchedule && hasUnsavedChanges && (
          <button onClick={handleUpdateExisting}>
            Mettre à jour cet emploi du temps
          </button>
        )}
        <button onClick={handleClear}>Nettoyer l'emploi du temps</button>
        {!hasUnsavedChanges && (
          <button
            onClick={() => {
              setCurrentSchedule(null);
              setSlotToActivityMap(new Map());
              clearSelection();
              setSelectedActivityId("");
              setPendingAssignment(null);
              setConflictingSlots([]);
              setHasConflicts(false);
            }}
          >
            New Schedule
          </button>
        )}
      </div>
    </div>
  );
};

export default ScheduleActions;
