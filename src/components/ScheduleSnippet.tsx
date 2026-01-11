import { WEEK_DAYS, TIME_SLOTS } from "../constants";
import { mergeTimeSlots } from "../utils/mergeTimeSlots";
import React from "react";

interface Props {
  slotToActivityMap: Map<string, string>;
  activities: { id: string; color: string }[];
  onClick?: () => void;
  title?: string;
  enableMergedView?: boolean;

  // optionnel: contrôle la taille des cases (px)
  cell?: number; // ex: 10, 12, 14...
}

const ScheduleSnippet: React.FC<Props> = ({
  slotToActivityMap,
  activities,
  onClick,
  title = "",
  enableMergedView = false,
  cell = 12,
}) => {
  const getColor = (activityId: string | undefined) => {
    const activity = activities.find((a) => a.id === activityId);
    return activity?.color || "transparent";
  };

  // weekKey = YYYY-MM-DD depuis la 1ère clé du map (si map vide => null)
  const firstKey = slotToActivityMap.keys().next().value as string | undefined;
  const weekKey = firstKey ? firstKey.split("-").slice(0, 3).join("-") : null;

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

  // Nombre de lignes = nb d’heures * 2 (00 / 30)
  const rows = TIME_SLOTS.length * 2;
  const cols = WEEK_DAYS.length;

  // Taille responsive: la grille se centre, parent peut imposer sa largeur
  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: `repeat(${cols}, ${cell}px)`,
    gridTemplateRows: `repeat(${rows}, ${cell}px)`,
    gap: 2,
  };

  return (
    <div onClick={onClick} className={onClick ? "cursor-pointer" : undefined}>
      {title ? (
        <h5 className="mb-2 text-center text-sm font-semibold text-gray-200">
          {title}
        </h5>
      ) : null}

      {/* Cadre léger autour de la vignette */}
      <div className="w-full flex justify-center">
        <div className="rounded-lg bg-white p-2 shadow-sm">
          {/* Grille */}
          <div style={gridStyle}>
            {TIME_SLOTS.flatMap((hour) =>
              ["00", "30"].flatMap((minute) =>
                WEEK_DAYS.map((_, dayIndex) => {
                  if (!weekKey) {
                    // map vide => cellule “vide”
                    return (
                      <div
                        key={`empty-${hour}-${minute}-${dayIndex}`}
                        className="bg-gray-100"
                        style={{ width: cell, height: cell }}
                      />
                    );
                  }

                  const slotId = `${weekKey}-${hour}-${minute}-${dayIndex}`;
                  const activityId = slotToActivityMap.get(slotId);
                  const bg = getColor(activityId);

                  if (enableMergedView && slotToMerged.has(slotId)) {
                    const isStart = startSlots.has(slotId);
                    const isEnd = endSlots.has(slotId);

                    // Borders internes: on “fusionne” visuellement
                    const rounded =
                      isStart && isEnd
                        ? "rounded-sm"
                        : isStart
                        ? "rounded-t-sm"
                        : isEnd
                        ? "rounded-b-sm"
                        : "";

                    const noTop = !isStart ? "border-t-0" : "";
                    const noBottom = !isEnd ? "border-b-0" : "";

                    return (
                      <div
                        key={slotId}
                        className={[
                          "border border-gray-300",
                          "bg-gray-100",
                          rounded,
                          noTop,
                          noBottom,
                        ].join(" ")}
                        style={{
                          width: cell,
                          height: cell,
                          backgroundColor:
                            bg === "transparent" ? undefined : bg,
                        }}
                      />
                    );
                  }

                  // Vue non-merged (ou slot non assigné)
                  return (
                    <div
                      key={slotId}
                      className="border border-gray-300 bg-gray-100"
                      style={{
                        width: cell,
                        height: cell,
                        backgroundColor: bg === "transparent" ? undefined : bg,
                      }}
                    />
                  );
                })
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleSnippet;
