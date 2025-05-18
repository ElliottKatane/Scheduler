import { WEEK_DAYS, TIME_SLOTS } from "../constants";
import { mergeTimeSlots } from "../utils/mergeTimeSlots";
import "../CSS/ScheduleSnippet.css";

interface Props {
  slotToActivityMap: Map<string, string>;
  activities: { id: string; color: string }[];
  onClick?: () => void;
  title?: string;
  enableMergedView?: boolean;
}

const ScheduleSnippet: React.FC<Props> = ({
  slotToActivityMap,
  activities,
  onClick,
  title = "Emploi du temps",
  enableMergedView = false,
}) => {
  const getColor = (activityId: string | undefined) => {
    const activity = activities.find((a) => a.id === activityId);
    return activity?.color || "#ff00ff";
  };

  const merged = enableMergedView ? mergeTimeSlots(slotToActivityMap) : [];
  const slotToMerged = new Map<string, (typeof merged)[0]>();
  const startSlots = new Set<string>();
  const endSlots = new Set<string>();
  if (enableMergedView) {
    merged.forEach((block) => {
      block.slotIds.forEach((id) => slotToMerged.set(id, block));
      startSlots.add(block.slotIds[0]);
      endSlots.add(block.slotIds[block.slotIds.length - 1]);
    });
  }

  return (
    <div
      className="schedule-snippet"
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      <h5>{title}</h5>
      <div className="grid-snippet">
        {TIME_SLOTS.flatMap((hour) =>
          ["00", "30"].map((minute) =>
            WEEK_DAYS.map((_, dayIndex) => {
              const slotId = `${hour}-${minute}-${dayIndex}`;
              const activityId = slotToActivityMap.get(slotId);
              const bg = getColor(activityId);

              if (enableMergedView && slotToMerged.has(slotId)) {
                const isStart = startSlots.has(slotId);
                const isEnd = endSlots.has(slotId);
                const isSingle = isStart && isEnd;
                const classes = [
                  "slot-mini",
                  isSingle ? "start end" : "",
                  !isStart && !isEnd ? "merged" : "",
                  isStart && !isEnd ? "start" : "",
                  isEnd && !isStart ? "end" : "",
                ]
                  .filter(Boolean)
                  .join(" ");
                return (
                  <div
                    key={slotId}
                    className={classes}
                    style={{ backgroundColor: bg }}
                  />
                );
              }

              return (
                <div
                  key={slotId}
                  className="slot-mini"
                  style={{ backgroundColor: bg }}
                />
              );
            })
          )
        )}
      </div>
    </div>
  );
};

export default ScheduleSnippet;
