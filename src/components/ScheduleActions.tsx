import { SavedSchedule } from "../types";
import { useEffect, useState } from "react";
import { useSavedSchedules } from "../context/SavedSchedulesContext";
import { useCurrentSchedule } from "../context/CurrentScheduleContext";

interface Props {
  slotToActivityMap: Map<string, string>;
  clearSelection: () => void;
  setSlotToActivityMap: (map: Map<string, string>) => void;
  setSelectedActivityId: (id: string) => void;
  setPendingAssignment: (id: string | null) => void;
  setConflictingSlots: (slots: string[]) => void;
  setHasConflicts: (has: boolean) => void;
}

type ToastKind = "success" | "info" | "error";

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

  // Toast (option 1 : pur Tailwind, sans config)
  const [toast, setToast] = useState<{ msg: string; kind: ToastKind } | null>(
    null
  );

  const showToast = (msg: string, kind: ToastKind = "info") => {
    setToast({ msg, kind });
    window.setTimeout(() => setToast(null), 2200);
  };

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
      showToast("Emploi du temps réinitialisé.", "info");
    }
  };

  const handleSaveNew = () => {
    const name = prompt("Nom de l'emploi du temps :");
    if (!name?.trim()) return;

    const newSchedule: SavedSchedule = {
      id: crypto.randomUUID(),
      name: name.trim(),
      data: Array.from(slotToActivityMap.entries()),
    };

    addSchedule(newSchedule);
    setCurrentSchedule(newSchedule);
    markSaved(slotToActivityMap);

    showToast("Emploi du temps sauvegardé.", "success");
  };

  const handleUpdateExisting = () => {
    if (!currentSchedule) return;

    updateSchedule(currentSchedule.id, slotToActivityMap);
    markSaved(slotToActivityMap);

    showToast("Emploi du temps mis à jour.", "success");
  };

  const handleNewSchedule = () => {
    setCurrentSchedule(null);
    setSlotToActivityMap(new Map());
    resetUIState();
    showToast("Nouveau planning prêt.", "info");
  };

  const toastClasses =
    toast?.kind === "success"
      ? "border-green-700/60 bg-green-950/70 text-green-100"
      : toast?.kind === "error"
      ? "border-red-700/60 bg-red-950/70 text-red-100"
      : "border-gray-700 bg-gray-950/80 text-white";

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

      {toast && (
        <div
          className={[
            "fixed bottom-6 right-6 z-50",
            "rounded-lg border px-4 py-2 shadow-lg",
            "transition-all duration-200 ease-out opacity-100 translate-y-0",
            toastClasses,
          ].join(" ")}
          role="status"
          aria-live="polite"
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
};

export default ScheduleActions;
