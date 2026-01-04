import React from "react";
import "../CSS/ResizableTable.css";
import { mergeTimeSlots } from "../utils/mergeTimeSlots";
import { WEEK_DAYS, TIME_SLOTS, getWeekDates } from "../constants";
import { Activity } from "../types";

type Props = {
  selectedSlots: Set<string>;
  slotToActivityMap: Map<string, string>;
  activities: Activity[];
  handleMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleMouseEnter: (e: React.MouseEvent<HTMLDivElement>) => void;
  setSelectedSlots: React.Dispatch<React.SetStateAction<Set<string>>>;
  weekStartDate: string; // ISO: "YYYY-MM-DD" (lundi)
};

const ResizableTable: React.FC<Props> = ({
  selectedSlots,
  slotToActivityMap,
  activities,
  handleMouseDown,
  handleMouseEnter,
  setSelectedSlots,
  weekStartDate,
}) => {
  const rowHeight = 30;
  const headerRowHeight = 32; // hauteur de la 1ère ligne sticky (ajuste si besoin)

  const merged = mergeTimeSlots(slotToActivityMap);
  const weekDates = getWeekDates(weekStartDate); // ["05/01/2026", ...]

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

  const minutes = ["00", "30"] as const;

  // Largeur min de table: dépend du nombre de jours (évite “je vois que lundi/mardi”)
  // 90px pour la colonne heures + ~140px par jour (ajuste si besoin)
  const minTableWidth = 90 + WEEK_DAYS.length * 140;

  return (
    <div className="w-full">
      {/* Hint mobile */}
      <div className="lg:hidden text-xs text-gray-400 mb-2">
        Fais glisser horizontalement pour voir les autres jours.
      </div>

      {/* Scroll horizontal */}
      <div className="w-full overflow-x-auto [-webkit-overflow-scrolling:touch]">
        <table
          className="schedule-table w-max table-fixed"
          style={{ minWidth: `${minTableWidth}px` }}
        >
          <thead>
            {/* Ligne 1: dates */}
            <tr>
              <th
                className={[
                  "sticky left-0 z-50",
                  "bg-gray-900",
                  "text-left",
                ].join(" ")}
                style={{ width: 90, top: 0 }}
              >
                {/* vide ou "Semaine" */}
              </th>

              {weekDates.map((d, i) => (
                <th
                  key={i}
                  className={["sticky z-40", "bg-gray-900", "text-center"].join(
                    " "
                  )}
                  style={{ minWidth: 140, top: 0 }}
                >
                  {d}
                </th>
              ))}
            </tr>

            {/* Ligne 2: jours */}
            <tr>
              <th
                className={[
                  "sticky left-0 z-40",
                  "bg-gray-900",
                  "text-left",
                ].join(" ")}
                style={{ width: 90, top: headerRowHeight }}
              >
                Heures/jour
              </th>

              {WEEK_DAYS.map((day, i) => (
                <th
                  key={i}
                  className={["sticky z-30", "bg-gray-900", "text-center"].join(
                    " "
                  )}
                  style={{ minWidth: 140, top: headerRowHeight }}
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {TIME_SLOTS.flatMap((hour) =>
              minutes.map((minute, minIndex) => {
                const label =
                  minIndex === 0
                    ? `${hour.toString().padStart(2, "0")}:00`
                    : "";

                return (
                  <tr key={`${hour}-${minute}`}>
                    <th
                      className={[
                        "sticky left-0 z-20",
                        "bg-gray-950",
                        "text-left",
                      ].join(" ")}
                      style={{ height: rowHeight, width: 90 }}
                    >
                      {label}
                    </th>

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
                        mergedBlock!.slotIds[
                          mergedBlock!.slotIds.length - 1
                        ] === slotId;

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
                          style={{ height: rowHeight, minWidth: 140 }}
                        >
                          <div
                            className={className}
                            id={slotId}
                            style={{
                              backgroundColor: isInsideBlock
                                ? activity?.color
                                : undefined,
                            }}
                            onMouseDown={(e) => {
                              e.preventDefault();

                              if (isInsideBlock && mergedBlock) {
                                setSelectedSlots((prev) => {
                                  const isAlreadySelected =
                                    mergedBlock.slotIds.every((id) =>
                                      prev.has(id)
                                    );

                                  const updated = new Set(prev);

                                  if (isAlreadySelected) {
                                    mergedBlock.slotIds.forEach((id) =>
                                      updated.delete(id)
                                    );
                                  } else {
                                    mergedBlock.slotIds.forEach((id) =>
                                      updated.add(id)
                                    );
                                  }

                                  return updated;
                                });
                              } else {
                                handleMouseDown(e);
                              }
                            }}
                            onMouseEnter={
                              isInsideBlock ? undefined : handleMouseEnter
                            }
                          >
                            {isStart && activity ? (
                              <>
                                {/* Petites tailles mobile sans casser ton CSS existant */}
                                <div className="activity-name text-[10px] sm:text-xs">
                                  {activity.name}
                                </div>
                                <div className="activity-duration text-[10px] sm:text-xs">
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
    </div>
  );
};

export default ResizableTable;
