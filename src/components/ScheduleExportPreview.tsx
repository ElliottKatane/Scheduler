import { WEEK_DAYS, TIME_SLOTS } from "../constants";
import { Activity } from "../types";

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
    <div id="full-export" style={{ padding: "1rem", width: "fit-content" }}>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ccc", padding: "4px" }}>Heures</th>
            {WEEK_DAYS.map((day, i) => (
              <th key={i} style={{ border: "1px solid #ccc", padding: "4px" }}>
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TIME_SLOTS.map((hour) => (
            <tr key={hour}>
              <td style={{ border: "1px solid #ccc", padding: "4px" }}>
                {hour}h
              </td>
              {WEEK_DAYS.map((_, dayIndex) => {
                const slotId = `${hour}-${dayIndex}`;
                return (
                  <td
                    key={slotId}
                    style={{
                      border: "1px solid #ccc",
                      padding: "4px",
                      backgroundColor: getColor(slotId),
                      minWidth: "100px",
                      height: "40px",
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
