import { SavedSchedule } from "../types";
import { useEffect, useState } from "react";
import { useSavedSchedules } from "../context/SavedSchedulesContext";
import { useCurrentSchedule } from "../context/CurrentScheduleContext";
import { toast } from "sonner";
import { formatISO, toMonday } from "../constants";

interface Props {
  slotToActivityMap: Map<string, string>;
  clearSelection: () => void;
  setSlotToActivityMap: (map: Map<string, string>) => void;
  setSelectedActivityId: (id: string) => void;
  setPendingAssignment: (id: string | null) => void;
  setConflictingSlots: (slots: string[]) => void;
  setHasConflicts: (has: boolean) => void;
  weekStartDate: Date;
}

const ScheduleActions: React.FC<Props> = ({
  slotToActivityMap,
  clearSelection,
  setSlotToActivityMap,
  setSelectedActivityId,
  setPendingAssignment,
  setConflictingSlots,
  setHasConflicts,
  weekStartDate,
}) => {
  const { schedules, addSchedule, updateSchedule } = useSavedSchedules();
  const { currentSchedule, setCurrentSchedule, markSaved, hasChanges } =
    useCurrentSchedule();

  const [saveWeekISO, setSaveWeekISO] = useState<string>(
    formatISO(weekStartDate)
  );
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const takenWeeks = new Set(schedules.map((s) => s.weekStartDate));
  const selectedWeekKey = formatISO(toMonday(new Date(saveWeekISO)));
  const isTaken = takenWeeks.has(selectedWeekKey);
  // 🔹 garder l’input date aligné avec la semaine affichée
  useEffect(() => {
    setSaveWeekISO(formatISO(weekStartDate));
  }, [weekStartDate]);

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
    if (!confirm("Voulez-vous vraiment réinitialiser tout l'emploi du temps ?"))
      return;

    setSlotToActivityMap(new Map());
    resetUIState();
    toast.info("Emploi du temps réinitialisé");
  };

  const handleSaveNew = async () => {
    const name = prompt("Nom de l'emploi du temps :");
    if (!name?.trim()) return;

    const parsed = new Date(saveWeekISO);
    if (isNaN(parsed.getTime())) {
      toast.error("Date invalide");
      return;
    }

    const targetWeek = toMonday(parsed);
    const weekKey = formatISO(targetWeek);

    // 🔹 unicité : 1 EDT par semaine
    const exists = schedules.some((s) => s.weekStartDate === weekKey);
    if (exists) {
      toast.error("Un emploi du temps existe déjà pour cette semaine");
      return;
    }

    // 🔹 remapping des slots vers la semaine cible
    const remapped = new Map<string, string>();
    for (const [slotId, activityId] of slotToActivityMap.entries()) {
      const tail = slotId.split("-").slice(-3).join("-");
      remapped.set(`${weekKey}-${tail}`, activityId);
    }

    const newSchedule: SavedSchedule = {
      id: crypto.randomUUID(),
      name: name.trim(),
      data: Array.from(remapped.entries()),
      weekStartDate: weekKey,
    };

    await addSchedule(newSchedule);
    setCurrentSchedule(newSchedule);
    markSaved(remapped);

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
      <h2 className="text-lg font-semibold">Actions sur l'emploi du temps</h2>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-600 dark:text-gray-400">
          Semaine d’enregistrement
        </label>
        <input
          type="date"
          value={saveWeekISO}
          onChange={(e) => setSaveWeekISO(e.target.value)}
          className="rounded-md border px-2 py-1 text-sm bg-white dark:bg-gray-900"
        />
        {isTaken && (
          <p className="text-xs text-red-400">
            Cette semaine a déjà un emploi du temps sauvegardé.
          </p>
        )}
      </div>

      <div className="flex flex-col space-y-2">
        <button
          onClick={handleSaveNew}
          disabled={isTaken}
          className={`px-4 py-2 rounded-md text-white
    ${
      isTaken
        ? "bg-green-600/40 cursor-not-allowed"
        : "bg-green-600 hover:bg-green-700"
    }`}
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
