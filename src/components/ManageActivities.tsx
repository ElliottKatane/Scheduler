import { useEffect, useState } from "react";
import { Activity } from "../types";

const ManageActivities = () => {
  const [activities, setActivities] = useState<Activity[]>(() => {
    const storedActivities = localStorage.getItem("activities");
    return storedActivities ? JSON.parse(storedActivities) : [];
  });

  const [newActivity, setNewActivity] = useState({ name: "", color: "" });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem("activities", JSON.stringify(activities));
  }, [activities]);

  const handleAddOrUpdateActivity = () => {
    if (!newActivity.name.trim() || !newActivity.color) return;

    if (editingId) {
      setActivities((prev) =>
        prev.map((act) =>
          act.id === editingId
            ? { ...act, name: newActivity.name, color: newActivity.color }
            : act
        )
      );
      setEditingId(null);
    } else {
      const newAct = {
        name: newActivity.name,
        color: newActivity.color,
        id: crypto.randomUUID(),
      };
      setActivities((prev) => [...prev, newAct]);
    }

    setNewActivity({ name: "", color: "" });
  };

  const handleDelete = (id: string) => {
    if (confirm("Supprimer cette activité ?")) {
      setActivities((prev) => prev.filter((act) => act.id !== id));
    }
  };

  const handleEdit = (id: string) => {
    const act = activities.find((a) => a.id === id);
    if (act) {
      setNewActivity({ name: act.name, color: act.color });
      setEditingId(id);
    }
  };

  return (
    <div className="manage-activities">
      <h3>{editingId ? "Modifier une activité" : "Ajouter une activité"}</h3>

      <label>
        Nom :
        <input
          type="text"
          value={newActivity.name}
          onChange={(e) =>
            setNewActivity({ ...newActivity, name: e.target.value })
          }
        />
      </label>

      <label>
        Couleur :
        <input
          type="color"
          value={newActivity.color}
          onChange={(e) =>
            setNewActivity({ ...newActivity, color: e.target.value })
          }
        />
      </label>

      <button onClick={handleAddOrUpdateActivity}>
        {editingId ? "Modifier" : "Ajouter"} l’activité
      </button>

      <h4>Activités enregistrées</h4>
      <ul>
        {activities.map((activity) => (
          <li key={activity.id}>
            <span style={{ color: activity.color }}>{activity.name}</span>
            {" — "}
            <button onClick={() => handleEdit(activity.id)}>✏️</button>
            <button onClick={() => handleDelete(activity.id)}>🗑️</button>
            {/* à venir : nombre d'heures associées */}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ManageActivities;
