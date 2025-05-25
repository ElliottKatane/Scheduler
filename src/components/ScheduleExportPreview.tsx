import { WEEK_DAYS, TIME_SLOTS } from "../constants";
import { Activity } from "../types";
import { mergeTimeSlots } from "../utils/mergeTimeSlots";
import "../CSS/ScheduleExportPreview.css";
import React, { useMemo } from "react";

interface Props {
  slotToActivityMap: Map<string, string>;
  activities: Activity[];
  smart?: boolean;
}

const ScheduleExportPreview: React.FC<Props> = ({
  slotToActivityMap,
  activities,
  smart = false,
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

  const activeDayIndices = useMemo(() => {
    const active = new Set<number>();
    slotToActivityMap.forEach((_, key) => {
      const parts = key.split("-");
      const dayIndex = parseInt(parts[2]);
      active.add(dayIndex);
    });
    return Array.from(active).sort();
  }, [slotToActivityMap]);

  const lastActiveSlotIndex = useMemo(() => {
    let maxIndex = -1;
    slotToActivityMap.forEach((_, key) => {
      const [hour, minute] = key.split("-");
      const index =
        TIME_SLOTS.indexOf(Number(hour)) * 2 + (minute === "30" ? 1 : 0);
      if (index > maxIndex) maxIndex = index;
    });
    return maxIndex;
  }, [slotToActivityMap]);
  const activeRowCount = useMemo(() => {
    let count = 0;
    for (let hourIndex = 0; hourIndex < TIME_SLOTS.length; hourIndex++) {
      for (let minIndex = 0; minIndex < 2; minIndex++) {
        const slotIndex = hourIndex * 2 + minIndex;
        if (slotIndex <= lastActiveSlotIndex) count++;
      }
    }
    return count;
  }, [lastActiveSlotIndex]);
  const tableClassName = smart ? "smart-export-table" : "";

  return (
    <div
      id="full-export"
      style={
        smart ? ({ "--row-count": activeRowCount } as React.CSSProperties) : {}
      }
    >
      <table className={tableClassName}>
        <thead>
          <tr>
            <th style={{ width: smart ? "25mm" : "40px", color: "black" }}>
              Heures
            </th>
            {WEEK_DAYS.map((day, i) =>
              !smart || activeDayIndices.includes(i) ? (
                <th key={i} style={{ color: "black" }}>
                  {day}
                </th>
              ) : null
            )}
          </tr>
        </thead>
        <tbody>
          {TIME_SLOTS.flatMap((hour, hourIndex) =>
            minutes.map((minute, minIndex) => {
              const slotIndex = hourIndex * 2 + minIndex;
              if (smart && slotIndex > lastActiveSlotIndex) return null;
              const label = minIndex === 0 ? `${hour}h` : "";
              return (
                <tr
                  key={`${hour}-${minute}`}
                  className={smart ? `smart-row` : ""}
                >
                  <td className="hour-cell">{label}</td>
                  {WEEK_DAYS.map((_, dayIndex) => {
                    if (smart && !activeDayIndices.includes(dayIndex))
                      return null;

                    const slotId = `${hour}-${minute}-${dayIndex}`;
                    const mergedBlock = slotToMerged.get(slotId);
                    const isStart = startSlotIds.has(slotId);
                    const activityId = slotToActivityMap.get(slotId);
                    const activity = getActivity(activityId);
                    const isInsideBlock = mergedBlock?.slotIds.includes(slotId);

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
                          fontSize: smart ? "10px" : "8px",
                          padding: smart ? "6px 4px" : "2px",
                          border: "1px solid #ccc",
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
  );
};

export default ScheduleExportPreview;
