import { useState } from "react";

interface Activity {
  name: string;
  color: string;
  id: string;
}

const ManageActivities = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [newActivity, setNewActivity] = useState({ name: "", color: "" });

  const handleAddActivity = () => {
    const activity = {
      name: newActivity.name,
      color: newActivity.color,
      id: crypto.randomUUID(),
    };
    setActivities((prev) => [...prev, activity]);

    setNewActivity({ name: "", color: "" });
  };

  return (
    <div>
      <label htmlFor="name">
        Name{" "}
        <input
          type="text"
          value={newActivity.name}
          onChange={(e) =>
            setNewActivity({ ...newActivity, name: e.target.value })
          }
        />
      </label>
      <label htmlFor="color">
        Color{" "}
        <input
          type="color"
          value={newActivity.color}
          onChange={(e) =>
            setNewActivity({ ...newActivity, color: e.target.value })
          }
        />
      </label>
      <button onClick={handleAddActivity}> Ajouter activité </button>
      <h2>Liste des activités</h2>
      <ul>
        {activities.map((activity) => (
          <li key={activity.id}>
            <span style={{ color: activity.color }}> {activity.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ManageActivities;
