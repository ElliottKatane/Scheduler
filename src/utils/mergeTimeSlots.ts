import { WEEK_DAYS } from "../constants";

export type SlotId = string;

export type MergedSlot = {
  dayIndex: number;
  day: string;
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  activityId: string;
  slotIds: string[]; // pour info ou debugging
};

export function mergeTimeSlots(
  slotToActivityMap: Map<SlotId, string>
): MergedSlot[] {
  const entries = Array.from(slotToActivityMap.entries())
    .map(([slotId, activityId]) => {
      const [hourStr, minuteStr, dayStr] = slotId.split("-");
      const hour = parseInt(hourStr, 10);
      const minute = parseInt(minuteStr, 10);
      const dayIndex = parseInt(dayStr, 10);
      return {
        slotId,
        activityId,
        hour,
        minute,
        dayIndex,
        day: WEEK_DAYS[dayIndex],
      };
    })
    .sort((a, b) =>
      a.dayIndex - b.dayIndex ||
      a.hour - b.hour ||
      a.minute - b.minute
    );

  const merged: MergedSlot[] = [];

  for (const slot of entries) {
    const last = merged[merged.length - 1];

    const isConsecutive =
      last &&
      last.activityId === slot.activityId &&
      last.dayIndex === slot.dayIndex &&
      last.endHour === slot.hour &&
      last.endMinute === slot.minute;

    if (isConsecutive) {
      const [nextHour, nextMinute] =
        slot.minute === 0 ? [slot.hour, 30] : [slot.hour + 1, 0];

      last.endHour = nextHour;
      last.endMinute = nextMinute;
      last.slotIds.push(slot.slotId);
    } else {
      const [endHour, endMinute] =
        slot.minute === 0 ? [slot.hour, 30] : [slot.hour + 1, 0];

      merged.push({
        dayIndex: slot.dayIndex,
        day: slot.day,
        startHour: slot.hour,
        startMinute: slot.minute,
        endHour,
        endMinute,
        activityId: slot.activityId,
        slotIds: [slot.slotId],
      });
    }
  }

  return merged;
}
