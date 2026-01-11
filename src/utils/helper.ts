import { Activity } from "../types";

export const DEFAULT_RATE = 0; // ou 30 si tu veux un fallback global

export const formatMoney = (amount: number, currency: string = "CAD") =>
  amount.toLocaleString("fr-CA", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  });

export const computeHoursAndRevenue = (
  data: [string, string][],
  activities: Activity[],
  fallbackRate: number = DEFAULT_RATE
) => {
  const byId = new Map(activities.map((a) => [a.id, a]));

  let hours = 0;
  let revenue = 0;

  for (const [, activityId] of data) {
    const act = byId.get(activityId);
    const rate = act?.hourlyRate ?? fallbackRate;
    const slotHours = 0.5;

    hours += slotHours;
    revenue += slotHours * rate;
  }

  // devise: si toutes les activités ont la même, on l’affiche, sinon on met "CAD"
  const currencies = new Set(
    data.map(([, activityId]) => byId.get(activityId)?.currency).filter(Boolean)
  );
  const currency =
    currencies.size === 1 ? String(Array.from(currencies)[0]) : "CAD";

  return { hours, revenue, currency };
};
