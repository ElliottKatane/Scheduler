import { useContext, useState } from "react";
import { ActivityContext } from "../context/ActivityContext";
import { TimeSlotPreviewProps } from "../types";
import CreateActivityModal from "./CreateActivityModal";
import { mergeTimeSlots } from "../utils/mergeTimeSlots";

const TimeSlotPreview: React.FC<TimeSlotPreviewProps> = ({
  selectedSlots,
  setSelectedActivityId,
  onAssignActivity,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const { addActivity } = useContext(ActivityContext)!;

  const mergedSlots = mergeTimeSlots(
    new Map(
      Array.from(selectedSlots).map((slotId) => [
        slotId,
        "preview", // placeholder activityId since mergeTimeSlots requires one
      ])
    )
  );

  return (
    <div className="rounded-xl border border-gray-300 bg-white dark:bg-gray-800 p-4 shadow-sm space-y-4">
      <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
        Créneaux sélectionnés
      </h4>

      <div className="slot-list">
        {mergedSlots.length > 0 ? (
          <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
            {mergedSlots.map((slot, index) => (
              <li key={index}>
                {slot.day} : {slot.startHour.toString().padStart(2, "0")}h
                {slot.startMinute === 30 ? "30" : ""} -{" "}
                {slot.endHour.toString().padStart(2, "0")}h
                {slot.endMinute === 30 ? "30" : ""}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Aucun créneau sélectionné.
          </p>
        )}
      </div>

      {isCreating && (
        <div className="pt-4">
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
    </div>
  );
};

export default TimeSlotPreview;
