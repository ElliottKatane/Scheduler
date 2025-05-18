import { useContext, useState } from "react";
import { ActivityContext } from "../context/ActivityContext";
import { TimeSlotPreviewProps } from "../types";
import CreateActivityModal from "./CreateActivityModal";
import { mergeTimeSlots } from "../utils/mergeTimeSlots";
import "../CSS/TimeSlotPreview.css";

const TimeSlotPreview: React.FC<TimeSlotPreviewProps> = ({
  selectedSlots,
  // selectedActivityId,
  setSelectedActivityId,
  onAssignActivity,
  // error,
  // conflictingSlots,
  // onForceReplace,
  // onClearAndAssign,
  // hasConflicts,
  // onResetSelection,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const { activities, addActivity } = useContext(ActivityContext)!;

  const mergedSlots = mergeTimeSlots(
    new Map(
      Array.from(selectedSlots).map((slotId) => [
        slotId,
        "preview", // placeholder activityId since mergeTimeSlots requires one
      ])
    )
  );

  return (
    <div className="preview-container">
      <h4>Créneaux sélectionnés</h4>
      <div className="slot-list">
        <ul>
          {mergedSlots.map((slot, index) => (
            <li key={index}>
              {slot.day} : {slot.startHour.toString().padStart(2, "0")}h
              {slot.startMinute === 30 ? "30" : ""} -{" "}
              {slot.endHour.toString().padStart(2, "0")}h
              {slot.endMinute === 30 ? "30" : ""}
            </li>
          ))}
        </ul>
      </div>

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
