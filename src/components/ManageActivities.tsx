import { useEffect, useState, useContext } from "react";
import { Activity } from "../types";
import { ActivityContext } from "../context/ActivityContext";

const ManageActivities = () => {
  const context = useContext(ActivityContext);
  if (!context) return null;

  const { activities, addActivity, updateActivity, deleteActivity } = context;

  const [newActivity, setNewActivity] = useState({ name: "", color: "" });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem("activities", JSON.stringify(activities));
  }, [activities]);

  const handleAddOrUpdateActivity = () => {
    if (!newActivity.name.trim() || !newActivity.color) return;

    if (editingId) {
      updateActivity({
        id: editingId,
        name: newActivity.name,
        color: newActivity.color,
      });
      setEditingId(null);
    } else {
      addActivity({
        id: crypto.randomUUID(),
        name: newActivity.name,
        color: newActivity.color,
      });
    }

    setNewActivity({ name: "", color: "" });
  };

  const handleDelete = (id: string) => {
    if (
      confirm(
        "Supprimer cette activité ? Cela supprimera aussi les heures associées."
      )
    ) {
      deleteActivity(id);
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
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAddOrUpdateActivity();
        }}
      >
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

        <button type="submit">
          {editingId ? "Modifier" : "Ajouter"} l’activité
        </button>
      </form>

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
