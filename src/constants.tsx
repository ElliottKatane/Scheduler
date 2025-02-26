export const WEEK_DAYS = [
  "LUNDI",
  "MARDI",
  "MERCREDI",
  "JEUDI",
  "VENDREDI",
  "SAMEDI",
  "DIMANCHE",
];
export const formatHoursInferiorTo10 = (hour: number): string => {
  return hour < 10 ? "0" + hour : hour.toString();
};

export const TIME_SLOTS: Array<string> = Array.from(
  { length: 22 - 6 + 1 }, // plage horaire 6h 22h
  (_, index) => {
    const hour = index + 6;
    return formatHoursInferiorTo10(hour);
  }
);
