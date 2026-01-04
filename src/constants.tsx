// ======================
// JOURS DE LA SEMAINE
// ======================

export const WEEK_DAYS = [
  "LUNDI",
  "MARDI",
  "MERCREDI",
  "JEUDI",
  "VENDREDI",
  "SAMEDI",
  "DIMANCHE",
];

// ======================
// PLAGE HORAIRE
// ======================

export const TIME_SLOTS: number[] = Array.from(
  { length: 22 - 6 + 1 }, // de 6h à 22h inclus
  (_, index) => index + 6
);

export const formatHoursInferiorTo10 = (hour: number): string =>
  hour < 10 ? "0" + hour : hour.toString();

// ======================
// CALENDRIER 2026
// ======================

// bornes choisies
export const CALENDAR_START = "2026-01-05"; // lundi
export const CALENDAR_END = "2027-01-03"; // dimanche

// ======================
// HELPERS DATES
// ======================

// ISO (YYYY-MM-DD) -> Date sans surprise timezone
export const parseISODate = (iso: string): Date => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};

// Ajouter des jours
export const addDays = (date: Date, days: number): Date => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

// Formater en JJ/MM/AAAA
export const formatDateFR = (date: Date): string => {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

// Les 7 dates (JJ/MM/AAAA) d’une semaine à partir du lundi ISO
export const getWeekDates = (weekStartISO: string): string[] => {
  const monday = parseISODate(weekStartISO);
  return Array.from({ length: 7 }, (_, i) => formatDateFR(addDays(monday, i)));
};

// Naviguer de semaine en semaine
export const getNextWeek = (weekStartISO: string): string => {
  return formatISO(addDays(parseISODate(weekStartISO), 7));
};

export const getPreviousWeek = (weekStartISO: string): string => {
  return formatISO(addDays(parseISODate(weekStartISO), -7));
};

// Date -> ISO YYYY-MM-DD
export const formatISO = (date: Date): string => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

// Vérifier si une semaine est dans les bornes 2026
export const isWeekInRange = (weekStartISO: string): boolean => {
  return weekStartISO >= CALENDAR_START && weekStartISO <= CALENDAR_END;
};
export function getCurrentWeekMonday(): string {
  const today = new Date();
  const day = today.getDay(); // 0 = dimanche, 1 = lundi, ...
  const diff = day === 0 ? -6 : 1 - day; // dimanche → lundi précédent
  const monday = new Date(today);
  monday.setDate(today.getDate() + diff);

  return monday.toISOString().slice(0, 10); // YYYY-MM-DD
}
