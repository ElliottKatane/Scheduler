import React, { useState } from "react";

interface ResizableTableProps {
  selectedSlots: Set<string>;
  slotToActivityMap: Map<string, string>;
  activities: any[];
  WEEK_DAYS: string[];
  TIME_SLOTS: number[];
  handleMouseDown: (e: React.MouseEvent) => void;
  handleMouseEnter: (e: React.MouseEvent) => void;
  onAssignActivityToSelectedSlots: () => void;
}

const ResizableTable: React.FC<ResizableTableProps> = ({
  selectedSlots,
  slotToActivityMap,
  activities,
  WEEK_DAYS,
  TIME_SLOTS,
  handleMouseDown,
  handleMouseEnter,
  onAssignActivityToSelectedSlots,
}) => {
  const [width, setWidth] = useState(600); // Largeur initiale du tableau
  const [isResizing, setIsResizing] = useState(false);

  const startResize = (e: React.MouseEvent) => {
    setIsResizing(true);
    document.addEventListener("mousemove", resize);
    document.addEventListener("mouseup", stopResize);
  };

  const resize = (e: MouseEvent) => {
    if (isResizing) {
      const newWidth = e.clientX; // Nouvelle largeur basée sur la position de la souris
      setWidth(newWidth);
    }
  };

  const stopResize = () => {
    setIsResizing(false);
    document.removeEventListener("mousemove", resize);
    document.removeEventListener("mouseup", stopResize);
  };

  return (
    <div
      style={{
        width: width,
        resize: "horizontal",
        overflow: "auto",
        border: "1px solid black",
      }}
      className="container-main"
    >
      <table>
        <thead>
          <tr>
            <th>Heures/jour</th>
            {WEEK_DAYS.map((day, dayIndex) => (
              <th key={dayIndex}>{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TIME_SLOTS.map((slot, index) => (
            <tr key={index}>
              <th>{slot < 10 ? "0" + slot : slot}h</th>
              {WEEK_DAYS.map((_, idx) => {
                const slotId = `${slot}-${idx}`;
                const activityId = slotToActivityMap.get(slotId);
                const activity = activities.find((a) => a.id === activityId);

                return (
                  <td
                    key={idx}
                    id={slotId}
                    className={`timeSlotHour slot ${
                      selectedSlots.has(slotId) ? "selected" : ""
                    }`}
                    onMouseDown={handleMouseDown}
                    onMouseEnter={handleMouseEnter}
                    style={{
                      backgroundColor: activity?.color || undefined,
                      color: activity ? "#000" : undefined,
                    }}
                  >
                    {activity?.name || ""}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div
        className="resize-handle"
        style={{
          width: "10px",
          height: "100%",
          backgroundColor: "gray",
          position: "absolute",
          right: 0,
          cursor: "ew-resize",
        }}
        onMouseDown={startResize}
      />
    </div>
  );
};

export default ResizableTable;
