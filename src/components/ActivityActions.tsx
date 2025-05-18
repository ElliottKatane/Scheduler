import React from "react";
import { Activity } from "../types";

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
}) => {
  if (!hasSelection) return null;

  return (
    <div className="card">
      <div className="activity-selector">
        <label htmlFor="activity-select">Associer à une activité :</label>
        <select
          id="activity-select"
          value={selectedActivityId}
          onChange={(e) => {
            const value = e.target.value;
            setSelectedActivityId(value);
          }}
        >
          <option value="">-- Choisir une activité --</option>
          {activities.map((act) => (
            <option key={act.id} value={act.id}>
              {act.name}
            </option>
          ))}
          <option value="__new__">+ Créer une nouvelle activité...</option>
        </select>

        <button
          onClick={() => {
            if (selectedActivityId) {
              onAssignActivity(selectedActivityId);
              setSelectedActivityId("");
            }
          }}
          disabled={!selectedActivityId}
        >
          Valider
        </button>
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

      <div className="reset-section">
        <button onClick={onResetSelection}>Réinitialiser la sélection</button>
      </div>
    </div>
  );
};

export default ActivityActions;
