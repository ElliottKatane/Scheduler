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

export const getWeekDates = (weekStart: Date): string[] => {
  const dates: string[] = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);

    dates.push(
      d.toLocaleDateString("fr-CA", {
        day: "2-digit",
        month: "2-digit",
      })
    );
  }

  return dates;
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
export function getCurrentWeekMonday(): Date {
  const today = new Date();
  const day = today.getDay(); // 0 = dimanche, 1 = lundi, ...
  const diff = day === 0 ? -6 : 1 - day; // dimanche → lundi précédent

  const monday = new Date(today);
  monday.setHours(0, 0, 0, 0); // normalisation (important)
  monday.setDate(today.getDate() + diff);

  return monday;
}

export const formatWeekLabel = (date: Date) => {
  const end = addDays(date, 6);
  return `${date.toLocaleDateString("fr-CA")} → ${end.toLocaleDateString(
    "fr-CA"
  )}`;
};
export const toMonday = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + diff);
  return d;
};
export const getWeeksOfMonth = (year: number, month: number) => {
  const weeks: string[] = [];
  const firstDay = new Date(year, month, 1);
  let current = toMonday(firstDay);

  while (current.getMonth() <= month) {
    weeks.push(formatISO(current));
    current = addDays(current, 7);
  }

  return weeks;
};
