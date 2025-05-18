import React from "react";
import "../CSS/ResizableTable.css";
import { mergeTimeSlots } from "../utils/mergeTimeSlots";
import { ResizableTableProps } from "../types";

const ResizableTable: React.FC<ResizableTableProps> = ({
  selectedSlots,
  slotToActivityMap,
  activities,
  WEEK_DAYS,
  TIME_SLOTS,
  handleMouseDown,
  handleMouseEnter,
  setSelectedSlots,
}) => {
  const rowHeight = 30;
  const merged = mergeTimeSlots(slotToActivityMap);

  const slotToMerged = new Map<string, (typeof merged)[0]>();
  const startSlotIds = new Set<string>();

  merged.forEach((block) => {
    block.slotIds.forEach((id) => slotToMerged.set(id, block));
    startSlotIds.add(block.slotIds[0]);
  });

  const getActivity = (id: string | undefined) =>
    activities.find((a) => a.id === id) || null;

  const formatDuration = (
    startH: number,
    startM: number,
    endH: number,
    endM: number
  ) => {
    const start = startH * 60 + startM;
    const end = endH * 60 + endM;
    const min = end - start;
    const h = Math.floor(min / 60);
    const m = min % 60;
    return `${h > 0 ? `${h}h` : ""}${m > 0 ? `${m}` : ""}`;
  };

  const minutes = ["00", "30"];

  return (
    <div className="container-main">
      <table className="schedule-table">
        <thead>
          <tr>
            <th>Heures/jour</th>
            {WEEK_DAYS.map((day, i) => (
              <th key={i}>{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TIME_SLOTS.flatMap((hour) =>
            minutes.map((minute, minIndex) => {
              const label =
                minIndex === 0 ? `${hour.toString().padStart(2, "0")}:00` : "";

              return (
                <tr key={`${hour}-${minute}`}>
                  <th style={{ height: rowHeight }}>{label}</th>
                  {WEEK_DAYS.map((_, dayIndex) => {
                    const slotId = `${hour}-${minute}-${dayIndex}`;
                    const mergedBlock = slotToMerged.get(slotId);
                    const isStart = startSlotIds.has(slotId);
                    const activityId = slotToActivityMap.get(slotId);
                    const activity = getActivity(activityId);
                    const isSelected = selectedSlots.has(slotId);
                    const isInsideBlock =
                      mergedBlock && mergedBlock.slotIds.includes(slotId);

                    const isLastInBlock =
                      isInsideBlock &&
                      mergedBlock!.slotIds[mergedBlock!.slotIds.length - 1] ===
                        slotId;

                    const className =
                      "half-slot" +
                      (isInsideBlock && !isStart ? " no-top-border" : "") +
                      (isInsideBlock && !isLastInBlock
                        ? " no-bottom-border"
                        : "") +
                      (isSelected ? " selected" : "");

                    return (
                      <td
                        key={slotId}
                        className={`timeSlotCell ${
                          slotToMerged.has(slotId) ? "merged-cell" : ""
                        }`}
                        style={{ height: rowHeight }}
                      >
                        <div
                          className={className}
                          id={slotId}
                          style={{
                            backgroundColor: isInsideBlock
                              ? activity?.color
                              : undefined,
                          }}
                          onMouseDown={
                            isInsideBlock
                              ? (e) => {
                                  e.preventDefault();
                                  setSelectedSlots((prev) => {
                                    const updated = new Set(prev);
                                    mergedBlock!.slotIds.forEach((id) =>
                                      updated.add(id)
                                    );
                                    return updated;
                                  });
                                }
                              : handleMouseDown
                          }
                          onMouseEnter={
                            isInsideBlock ? undefined : handleMouseEnter
                          }
                        >
                          {isStart && activity ? (
                            <>
                              <div className="activity-name">
                                {activity.name}
                              </div>
                              <div className="activity-duration">
                                {formatDuration(
                                  mergedBlock!.startHour,
                                  mergedBlock!.startMinute,
                                  mergedBlock!.endHour,
                                  mergedBlock!.endMinute
                                )}
                              </div>
                            </>
                          ) : null}
                        </div>
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

export default ResizableTable;
