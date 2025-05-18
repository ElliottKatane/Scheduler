import React from "react";
import { Activity } from "../types";

interface Props {
  activities: Activity[];
  selectedActivityId: string;
  setSelectedActivityId: (id: string) => void;
  onAssignActivity: (id: string) => void;
  onResetSelection: () => void;
  hasSelection: boolean;
}

const ActivityActions: React.FC<Props> = ({
  activities,
  selectedActivityId,
  setSelectedActivityId,
  onAssignActivity,
  onResetSelection,
  hasSelection,
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

      <div className="reset-section">
        <button onClick={onResetSelection}>Réinitialiser la sélection</button>
      </div>
    </div>
  );
};

export default ActivityActions;
