import { useContext } from "react";
import { CurrentScheduleContext } from "../context/CurrentScheduleContext";
import { ActivityContext } from "../context/ActivityContext";
import { countHoursByAllTags } from "../utils/countHoursByTag";

const HoursSummary = () => {
  const context = useContext(CurrentScheduleContext);
  const activityContext = useContext(ActivityContext);

  // Vérification du contexte
  if (!context || !activityContext) return null;

  const { currentSchedule } = context;
  const { activities } = activityContext;

  if (!currentSchedule) return null;

  const tagCounts = countHoursByAllTags(currentSchedule.data, activities, 0.5);

  const hasCounts = Object.keys(tagCounts).length > 0;

  return (
    <div className="rounded-xl border border-gray-300 bg-white dark:bg-gray-800 p-4 shadow-sm space-y-4">
      <h3 className="text-lg font-semibold mb-2">Résumé des heures</h3>
      {hasCounts ? (
        <ul className="list-disc list-inside">
          {Object.entries(tagCounts).map(([tag, count]) => (
            <li key={tag}>
              {tag}: {count} h
            </li>
          ))}
        </ul>
      ) : (
        <p>Aucun tag renseigné.</p>
      )}
    </div>
  );
};

export default HoursSummary;
