import React from "react";
import { Activity } from "../types";
import CreateActivityModal from "./CreateActivityModal";
import { useContext } from "react";
import { ActivityContext } from "../context/ActivityContext";

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
  activities,
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
  const { addActivity } = activityContext;

  if (!hasSelection) return null;

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

  return (
    <>
      <div className="card">
        <div className="activity-selector">
          <label htmlFor="activity-select">Associer à une activité :</label>
          <select
            id="activity-select"
            value={selectedActivityId}
            onChange={handleSelectChange}
          >
            <option value="">-- Choisir une activité --</option>
            {activities.map((act) => (
              <option key={act.id} value={act.id}>
                {act.name}
              </option>
            ))}
            <option value="__new__">+ Créer une nouvelle activité...</option>
          </select>

          <div className="action-buttons">
            <button
              onClick={handleValidate}
              disabled={!selectedActivityId || selectedActivityId === "__new__"}
            >
              Valider
            </button>
            <button onClick={onResetSelection}>Réinitialiser</button>
          </div>
        </div>

        {hasConflicts && (
          <div className="conflict-options">
            <p>
              ⚠️ {conflictingSlots.length} créneau(x) déjà occupé(s) :<br />
              {conflictingSlots.join(", ")}
            </p>
            <button onClick={onClearAndAssign}>
              1) Effacer toutes les activités de la sélection
            </button>
            <button onClick={onForceReplace}>
              2) Remplacer les existantes et remplir les cases vides
            </button>
          </div>
        )}

        {error && <p className="error-text">{error}</p>}
      </div>

      {/* Modal */}
      {isCreating && (
        <div className="card">
          <CreateActivityModal
            onClose={() => setIsCreating(false)}
            onCreate={(activity) => {
              addActivity(activity);
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
