import React, { useContext, useEffect, useMemo } from "react";
import { Activity } from "../types";
import CreateActivityModal from "./CreateActivityModal";
import { ActivityContext } from "../context/ActivityContext";
import Button from "../UI/Button";

interface Props {
  activities: Activity[];
  selectedActivityId: string;
  setSelectedActivityId: (id: string) => void;
  onAssignActivity: (id: string) => void;
  onResetSelection: () => void;
  hasSelection: boolean;
  hasConflicts: boolean;
  conflictingSlots: string[];
  onClearAndAssign: () => void;
  onForceReplace: () => void;
  error?: string;
  isCreating: boolean;
  setIsCreating: (value: boolean) => void;
}

const ActivityActions: React.FC<Props> = ({
  selectedActivityId,
  setSelectedActivityId,
  onAssignActivity,
  onResetSelection,
  hasSelection,
  hasConflicts,
  conflictingSlots,
  onClearAndAssign,
  onForceReplace,
  error,
  isCreating,
  setIsCreating,
}) => {
  const activityContext = useContext(ActivityContext);
  if (!activityContext) return null;
  const { activities: ctxActivities, addActivity } = activityContext;

  if (!hasSelection) return null;

  // 1) Garder seulement les activités visibles (non masquées)
  const visibleActivities = useMemo(
    () => ctxActivities.filter((a) => !a.hidden),
    [ctxActivities]
  );

  // 2) Si l’activité sélectionnée devient masquée ou n’existe plus, on reset
  useEffect(() => {
    const selected = ctxActivities.find((a) => a.id === selectedActivityId);
    if (!selected || selected.hidden) {
      setSelectedActivityId("");
    }
  }, [ctxActivities, selectedActivityId, setSelectedActivityId]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === "__new__") {
      setIsCreating(true);
    } else {
      setSelectedActivityId(value);
    }
  };

  const handleValidate = () => {
    if (selectedActivityId && selectedActivityId !== "__new__") {
      onAssignActivity(selectedActivityId);
      setSelectedActivityId("");
    }
  };

  const noVisible = visibleActivities.length === 0;

  return (
    <>
      <div className="rounded-xl border border-gray-300 bg-white dark:bg-gray-800 p-4 shadow-sm space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="activity-select"
            className="block text-sm font-medium text-gray-700 dark:text-gray-200"
          >
            Associer à une activité :
          </label>

          <select
            id="activity-select"
            value={selectedActivityId}
            onChange={handleSelectChange}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Choisir une activité --</option>

            {/* 3) N’afficher que les activités non masquées */}
            {visibleActivities.map((act) => (
              <option key={act.id} value={act.id}>
                {act.name}
              </option>
            ))}

            <option value="__new__">+ Créer une nouvelle activité...</option>
          </select>

          {noVisible && (
            <p className="text-xs text-gray-500">
              Aucune activité visible. Créez une activité ou réactivez-en une
              dans Gérer les activités.
            </p>
          )}

          <div className="flex space-x-2 pt-2">
            <Button
              variant="primary"
              onClick={handleValidate}
              disabled={!selectedActivityId || selectedActivityId === "__new__"}
            >
              Valider
            </Button>
            <Button variant="secondary" onClick={onResetSelection}>
              Lâcher la sélection
            </Button>
          </div>
        </div>

        {hasConflicts && (
          <div className="border-t pt-4 space-y-2 text-sm text-red-600 dark:text-red-400">
            <p>
              ⚠️ {conflictingSlots.length} créneau(x) déjà occupé(s) :<br />
              {conflictingSlots.join(", ")}
            </p>
            <Button
              variant="secondary"
              onClick={onClearAndAssign}
              className="w-full text-black"
            >
              1) Effacer toutes les activités de la sélection
            </Button>
            <Button
              variant="danger"
              onClick={onForceReplace}
              className="w-full"
            >
              2) Remplacer les existantes et remplir les cases vides
            </Button>
          </div>
        )}

        {error && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>

      {/* Modal */}
      {isCreating && (
        <div className="rounded-xl border border-gray-300 bg-white dark:bg-gray-800 p-4 shadow-sm mt-4">
          <CreateActivityModal
            onClose={() => setIsCreating(false)}
            onCreate={async (activity) => {
              await addActivity(activity);
              setSelectedActivityId(activity.id);
              setIsCreating(false);
              onAssignActivity(activity.id);
            }}
          />
        </div>
      )}
    </>
  );
};

export default ActivityActions;
