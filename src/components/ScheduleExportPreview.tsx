import { WEEK_DAYS, TIME_SLOTS } from "../constants";
import { Activity } from "../types";
import "../CSS/ScheduleExportPreview.css";

interface Props {
  slotToActivityMap: Map<string, string>;
  activities: Activity[];
}

const ScheduleExportPreview: React.FC<Props> = ({
  slotToActivityMap,
  activities,
}) => {
  const getColor = (slotId: string) => {
    const activityId = slotToActivityMap.get(slotId);
    const activity = activities.find((a) => a.id === activityId);
    return activity?.color || "#fff";
  };

  const getLabel = (slotId: string) => {
    const activityId = slotToActivityMap.get(slotId);
    const activity = activities.find((a) => a.id === activityId);
    return activity?.name || "";
  };

  return (
    <div id="full-export">
      <table>
        <thead>
          <tr>
            <th>Heures</th>
            {WEEK_DAYS.map((day, i) => (
              <th key={i}>{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TIME_SLOTS.map((hour) => (
            <tr key={hour}>
              <td className="hour-cell">{hour}h</td>
              {WEEK_DAYS.map((_, dayIndex) => {
                const slotId = `${hour}-${dayIndex}`;
                return (
                  <td
                    key={slotId}
                    style={{
                      backgroundColor: getColor(slotId),
                    }}
                  >
                    {getLabel(slotId)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ScheduleExportPreview;
