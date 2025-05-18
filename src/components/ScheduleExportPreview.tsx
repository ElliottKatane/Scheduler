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
                const slotId1 = `${hour}-00-${dayIndex}`;
                const slotId2 = `${hour}-30-${dayIndex}`;

                const label1 = getLabel(slotId1);
                const label2 = getLabel(slotId2);
                const color1 = getColor(slotId1);
                const color2 = getColor(slotId2);

                const isSame = label1 === label2 && label1 !== "";

                return (
                  <td
                    key={`${hour}-${dayIndex}`}
                    style={{
                      background: isSame
                        ? color1
                        : `linear-gradient(to bottom, ${color1} 50%, ${color2} 50%)`,
                      fontSize: "8px",
                      padding: "2px",
                      color: "#000",
                    }}
                  >
                    {label1 && <div>{label1}</div>}
                    {!isSame && label2 && <div>{label2}</div>}
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
