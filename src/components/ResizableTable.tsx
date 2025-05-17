import React from "react";
import "../CSS/ResizableTable.css";
import { mergeTimeSlots } from "../utils/mergeTimeSlots";
import { Activity } from "../types";

interface ResizableTableProps {
  selectedSlots: Set<string>;
  slotToActivityMap: Map<string, string>;
  activities: Activity[];
  WEEK_DAYS: string[];
  TIME_SLOTS: number[];
  handleMouseDown: (e: React.MouseEvent) => void;
  handleMouseEnter: (e: React.MouseEvent) => void;
  clearSelection: () => void;
  setSelectedSlots?: (slots: Set<string>) => void;
}

const ResizableTable: React.FC<ResizableTableProps> = ({
  selectedSlots,
  slotToActivityMap,
  activities,
  WEEK_DAYS,
  TIME_SLOTS,
  handleMouseDown,
  handleMouseEnter,
  clearSelection,
  setSelectedSlots,
}) => {
  const rowHeight = 30; // demi-heure = 30px

  const merged = mergeTimeSlots(slotToActivityMap);
  const slotToBlockMap = new Map<string, (typeof merged)[0]>();
  const blockStartSet = new Set<string>();
  for (const block of merged) {
    for (const id of block.slotIds) {
      slotToBlockMap.set(id, block);
    }
    blockStartSet.add(block.slotIds[0]);
  }

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
            minutes.map((minute, mIndex) => (
              <tr key={`${hour}-${minute}`}>
                <th style={{ height: rowHeight }}>
                  {mIndex === 0 ? `${hour.toString().padStart(2, "0")}:00` : ""}
                </th>
                {WEEK_DAYS.map((_, dayIndex) => {
                  const slotId = `${hour}-${minute}-${dayIndex}`;
                  const block = slotToBlockMap.get(slotId);
                  const activity = getActivity(slotToActivityMap.get(slotId));

                  if (block && block.slotIds[0] === slotId) {
                    const totalHeight = block.slotIds.length * rowHeight;
                    return (
                      <td
                        key={slotId}
                        className="timeSlotCell"
                        style={{ height: rowHeight }}
                      >
                        <div
                          className="merged-block"
                          style={{
                            backgroundColor: activity?.color || "#888",
                            height: totalHeight,
                          }}
                          onClick={() =>
                            setSelectedSlots?.(new Set(block.slotIds))
                          }
                        >
                          <div className="activity-name">{activity?.name}</div>
                          <div className="activity-duration">
                            {formatDuration(
                              block.startHour,
                              block.startMinute,
                              block.endHour,
                              block.endMinute
                            )}
                          </div>
                        </div>
                      </td>
                    );
                  } else if (!block) {
                    return (
                      <td
                        key={slotId}
                        className="timeSlotCell"
                        style={{ height: rowHeight }}
                      >
                        <div
                          className={`half-slot ${
                            selectedSlots.has(slotId) ? "selected" : ""
                          }`}
                          id={slotId}
                          onMouseDown={handleMouseDown}
                          onMouseEnter={handleMouseEnter}
                        />
                      </td>
                    );
                  } else {
                    // case du bloc déjà affiché plus haut
                    return (
                      <td
                        key={slotId}
                        className="timeSlotCell"
                        style={{ height: rowHeight }}
                      />
                    );
                  }
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ResizableTable;
