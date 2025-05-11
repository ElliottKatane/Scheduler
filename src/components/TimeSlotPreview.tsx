import { WEEK_DAYS } from "../constants";
import { useContext, useState } from "react";
import { ActivityContext } from "../context/ActivityContext";
import { TimeSlotPreviewProps } from "../types";
import CreateActivityModal from "./CreateActivityModal";
import "../CSS/TimeSlotPreview.css";

const TimeSlotPreview: React.FC<TimeSlotPreviewProps> = ({
  selectedSlots,
  selectedActivityId,
  setSelectedActivityId,
  onAssignActivity,
  error,
  conflictingSlots,
  onForceReplace,
  onClearAndAssign,
  hasConflicts,
  onResetSelection,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const { activities, addActivity } = useContext(ActivityContext)!;

  const formattedSlots = Array.from(selectedSlots)
    .map((slotId) => {
      const [hour, day] = slotId.split("-");
      return {
        slotId,
        dayIndex: parseInt(day, 10),
        hour: parseInt(hour, 10),
        day: WEEK_DAYS[parseInt(day, 10)],
        startHour: parseInt(hour, 10),
        endHour: parseInt(hour, 10) + 1,
      };
    })
    .sort((a, b) => a.dayIndex - b.dayIndex || a.hour - b.hour);

  return (
    <div className="preview-container">
      <h4>Selected Slots</h4>
      <div className="slot-list">
        <ul>
          {formattedSlots.map((slot) => (
            <li key={slot.slotId}>
              {slot.day} : {slot.startHour}h - {slot.endHour}h
            </li>
          ))}
        </ul>
      </div>

      {selectedSlots.size > 0 && (
        <>
          <div className="activity-selector">
            <label htmlFor="activity-select">Associer à une activité :</label>
            <select
              id="activity-select"
              value={selectedActivityId}
              onChange={(e) => {
                const value = e.target.value;
                value === "__new__"
                  ? setIsCreating(true)
                  : setSelectedActivityId(value);
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
                ⚠️ {conflictingSlots.length} créneau(x) déjà occupé(s) :
                <br />
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
            <button onClick={onResetSelection}>
              Réinitialiser la sélection
            </button>
          </div>
        </>
      )}

      {isCreating && (
        <CreateActivityModal
          onClose={() => setIsCreating(false)}
          onCreate={(activity) => {
            addActivity(activity);
            setSelectedActivityId(activity.id);
            setIsCreating(false);
            onAssignActivity(activity.id);
          }}
        />
      )}
    </div>
  );
};

export default TimeSlotPreview;
