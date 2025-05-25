import { WEEK_DAYS, TIME_SLOTS } from "../constants";
import { Activity } from "../types";
import { mergeTimeSlots } from "../utils/mergeTimeSlots";
import "../CSS/ScheduleExportPreview.css";

interface Props {
  slotToActivityMap: Map<string, string>;
  activities: Activity[];
}

const ScheduleExportPreview: React.FC<Props> = ({
  slotToActivityMap,
  activities,
}) => {
  const merged = mergeTimeSlots(slotToActivityMap);
  const slotToMerged = new Map<string, (typeof merged)[0]>();
  const startSlotIds = new Set<string>();

  merged.forEach((block) => {
    block.slotIds.forEach((id) => slotToMerged.set(id, block));
    startSlotIds.add(block.slotIds[0]);
  });

  const getActivity = (id: string | undefined) =>
    activities.find((a) => a.id === id) || null;

  const minutes = ["00", "30"];

  return (
    <div id="pdf-wrapper">
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
            {TIME_SLOTS.flatMap((hour) =>
              minutes.map((minute, minIndex) => {
                const label = minIndex === 0 ? `${hour}h` : "";
                return (
                  <tr key={`${hour}-${minute}`}>
                    <td className="hour-cell">{label}</td>
                    {WEEK_DAYS.map((_, dayIndex) => {
                      const slotId = `${hour}-${minute}-${dayIndex}`;
                      const mergedBlock = slotToMerged.get(slotId);
                      const isStart = startSlotIds.has(slotId);
                      const activityId = slotToActivityMap.get(slotId);
                      const activity = getActivity(activityId);
                      const isInsideBlock =
                        mergedBlock?.slotIds.includes(slotId);

                      const isLastInBlock =
                        isInsideBlock &&
                        mergedBlock?.slotIds[mergedBlock.slotIds.length - 1] ===
                          slotId;

                      const className =
                        "half-slot" +
                        (isInsideBlock && !isStart ? " no-top-border" : "") +
                        (isInsideBlock && !isLastInBlock
                          ? " no-bottom-border"
                          : "");

                      return (
                        <td
                          key={slotId}
                          className={className}
                          style={{
                            backgroundColor: isInsideBlock
                              ? activity?.color
                              : "#fff",
                            color: "#000",
                            fontSize: "8px",
                            padding: "2px",
                          }}
                        >
                          {isStart && activity ? (
                            <div>{activity.name}</div>
                          ) : null}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScheduleExportPreview;
