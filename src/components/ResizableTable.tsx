import React, { useState } from "react";
import "../CSS/ResizableTable.css";

interface ResizableTableProps {
  selectedSlots: Set<string>;
  slotToActivityMap: Map<string, string>;
  activities: any[];
  WEEK_DAYS: string[];
  TIME_SLOTS: number[];
  handleMouseDown: (e: React.MouseEvent) => void;
  handleMouseEnter: (e: React.MouseEvent) => void;
  clearSelection: () => void;
}

const ResizableTable: React.FC<ResizableTableProps> = ({
  selectedSlots,
  slotToActivityMap,
  activities,
  WEEK_DAYS,
  TIME_SLOTS,
  handleMouseDown,
  handleMouseEnter,
}) => {
  const [width, setWidth] = useState(600);
  const [height, setHeight] = useState(400);
  const [isResizing, setIsResizing] = useState(false);

  const resize = (e: MouseEvent) => {
    if (isResizing) {
      const newWidth = e.clientX;
      const newHeight = e.clientY;
      setWidth(newWidth);
      setHeight(newHeight);
    }
  };

  const rowHeight = Math.max(60, height / TIME_SLOTS.length);

  const stopResize = () => {
    setIsResizing(false);
    document.removeEventListener("mousemove", resize);
    document.removeEventListener("mouseup", stopResize);
  };

  return (
    <div className="container-main" style={{ width }}>
      <table className="schedule-table">
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
              <th style={{ height: rowHeight }}>
                {slot.toString().padStart(2, "0")}:00
              </th>
              {WEEK_DAYS.map((_, idx) => (
                <td
                  key={idx}
                  className="timeSlotCell"
                  style={{ height: rowHeight }}
                >
                  <div
                    className={`half-slot top ${
                      selectedSlots.has(`${slot}-00-${idx}`) ? "selected" : ""
                    }`}
                    id={`${slot}-00-${idx}`}
                    onMouseDown={handleMouseDown}
                    onMouseEnter={handleMouseEnter}
                  >
                    {activities.find(
                      (a) => a.id === slotToActivityMap.get(`${slot}-00-${idx}`)
                    )?.name || ""}
                  </div>
                  <div
                    className={`half-slot bottom ${
                      selectedSlots.has(`${slot}-30-${idx}`) ? "selected" : ""
                    }`}
                    id={`${slot}-30-${idx}`}
                    onMouseDown={handleMouseDown}
                    onMouseEnter={handleMouseEnter}
                  >
                    {activities.find(
                      (a) => a.id === slotToActivityMap.get(`${slot}-30-${idx}`)
                    )?.name || ""}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResizableTable;
