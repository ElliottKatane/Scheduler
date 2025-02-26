import { useEffect, useState } from "react";

interface Activity {
  name: string;
  color: string;
  id: string;
}

const ManageActivities = () => {
  // initialisation du useState avec localStorage
  const [activities, setActivities] = useState<Activity[]>(() => {
    const storedActivities = localStorage.getItem("activities");
    return storedActivities ? JSON.parse(storedActivities) : [];
  });
  const [newActivity, setNewActivity] = useState({ name: "", color: "" });

  // sauvegarder les activités dans le localStorage quand elles changent
  useEffect(() => {
    localStorage.setItem("activities", JSON.stringify(activities));
  }, [activities]);

  const handleAddActivity = () => {
    if (!newActivity.name.trim() || !newActivity.color) return;

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
