import { Activity } from "../types";

export function countHoursByAllTags(
  savedScheduleData: [string, string][],
  activities: Activity[],
  slotDurationInHours: number
): Record<string, number> {
  const activityIdToTags = new Map<string, string[]>(
    activities.map((activity) => [activity.id, activity.labels ?? []])
  );

  const tagCounts: Record<string, number> = {};

  savedScheduleData.forEach(([_, activityId]) => {
    const tags = activityIdToTags.get(activityId);
    if (!tags || tags.length === 0) return;

    tags.forEach((tag) => {
      if (tagCounts[tag] === undefined) {
        tagCounts[tag] = 0;
      }
      tagCounts[tag] += slotDurationInHours;
    });
  });

  return tagCounts;
}

