import { SavedSchedule } from "../types";
import { useEffect, useState } from "react";
import { useSavedSchedules } from "../context/SavedSchedulesContext";
import { useCurrentSchedule } from "../context/CurrentScheduleContext";
import { toast } from "sonner";

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
  }, [slotToActivityMap, currentSchedule, hasChanges]);

  const resetUIState = () => {
    clearSelection();
    setSelectedActivityId("");
    setPendingAssignment(null);
    setConflictingSlots([]);
    setHasConflicts(false);
  };

  const handleClear = () => {
    if (
      confirm("Voulez-vous vraiment réinitialiser tout l'emploi du temps ?")
    ) {
      setSlotToActivityMap(new Map());
      resetUIState();
      toast.info("Emploi du temps réinitialisé");
    }
  };

  const handleSaveNew = async () => {
    const name = prompt("Nom de l'emploi du temps :");
    if (!name?.trim()) return;

    const newSchedule: SavedSchedule = {
      id: crypto.randomUUID(),
      name: name.trim(),
      data: Array.from(slotToActivityMap.entries()),
    };

    await addSchedule(newSchedule);
    setCurrentSchedule(newSchedule);
    markSaved(slotToActivityMap);

    toast.success("Emploi du temps sauvegardé");
  };

  const handleUpdateExisting = async () => {
    if (!currentSchedule) return;

    await updateSchedule(currentSchedule.id, slotToActivityMap);
    markSaved(slotToActivityMap);

    toast.success("Emploi du temps mis à jour");
  };

  const handleNewSchedule = () => {
    setCurrentSchedule(null);
    setSlotToActivityMap(new Map());
    resetUIState();
    toast.info("Nouveau planning prêt");
  };

  return (
    <div className="rounded-xl border border-gray-300 bg-white dark:bg-gray-800 p-4 shadow-sm space-y-4">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
        Actions sur l'emploi du temps
      </h2>

      <div className="flex flex-col space-y-2">
        <button
          onClick={handleSaveNew}
          className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"
        >
          Enregistrer sous…
        </button>

        {currentSchedule && hasUnsavedChanges && (
          <button
            onClick={handleUpdateExisting}
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            Mettre à jour cet emploi du temps
          </button>
        )}

        <button
          onClick={handleClear}
          className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
        >
          Nettoyer l'emploi du temps
        </button>

        {!hasUnsavedChanges && (
          <button
            onClick={handleNewSchedule}
            className="px-4 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-700"
          >
            Nouveau planning
          </button>
        )}
      </div>
    </div>
  );
};

export default ScheduleActions;
