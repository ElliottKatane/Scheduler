import { useEffect, useState, useContext } from "react";
import { ActivityContext } from "../context/ActivityContext";
import { WEEK_DAYS } from "../constants";

const LocalStorageViewer = () => {
  const [contents, setContents] = useState<Record<string, any>>({});
  const { activities } = useContext(ActivityContext)!;

  const refresh = () => {
    const snapshot: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      try {
        snapshot[key] = JSON.parse(localStorage.getItem(key) || "");
      } catch {
        snapshot[key] = localStorage.getItem(key);
      }
    }
    setContents(snapshot);
  };

  useEffect(refresh, []);

  const clearKey = (key: string) => {
    if (confirm(`Supprimer "${key}" du localStorage ?`)) {
      localStorage.removeItem(key);
      refresh();
    }
  };

  const clearAll = () => {
    if (confirm("Vider tout le localStorage ?")) {
      localStorage.clear();
      refresh();
    }
  };

  const humanizeSlotToActivity = (data: [string, string][]) => {
    const map = new Map(data);
    const result: Record<string, string> = {};
    for (const [slotId, activityId] of map.entries()) {
      const [hour, day] = slotId.split("-");
      const label = `${WEEK_DAYS[parseInt(day)]} ${hour}h`;
      const activity = activities.find((a) => a.id === activityId);
      result[label] = activity ? activity.name : activityId;
    }
    return result;
  };

  return (
    <div style={{ padding: "1rem", fontFamily: "monospace" }}>
      <h3>Contenu du localStorage</h3>
      <button onClick={clearAll}>🧹 Vider tout</button>

      {Object.entries(contents).map(([key, value]) => (
        <div key={key} style={{ marginTop: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <strong>{key}</strong>
            <button onClick={() => clearKey(key)}>Supprimer</button>
          </div>
          <pre style={{ padding: "0.5rem" }}>
            {key === "slotToActivityMap" && Array.isArray(value)
              ? JSON.stringify(humanizeSlotToActivity(value), null, 2)
              : JSON.stringify(value, null, 2)}
          </pre>
        </div>
      ))}
    </div>
  );
};

export default LocalStorageViewer;
