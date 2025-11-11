import { useContext, useMemo } from "react";
import { CurrentScheduleContext } from "../context/CurrentScheduleContext";
import { ActivityContext } from "../context/ActivityContext";

const HoursSummary = () => {
  const context = useContext(CurrentScheduleContext);
  const activityContext = useContext(ActivityContext);

  if (!context || !activityContext) return null;

  const { currentSchedule } = context;
  const { activities } = activityContext;

  if (!currentSchedule) return null;

  // Regroupe les heures par activité
  const summary = useMemo(() => {
    const counts: Record<
      string,
      { hours: number; rate?: number; total?: number }
    > = {};

    for (const [, activityId] of currentSchedule.data) {
      const act = activities.find((a) => a.id === activityId);
      if (!act) continue;

      const name = act.name;
      if (!counts[name]) counts[name] = { hours: 0, rate: act.hourlyRate };
      counts[name].hours += 0.5; // chaque case = 0.5h
    }

    for (const name in counts) {
      const { hours, rate } = counts[name];
      counts[name].total =
        typeof rate === "number"
          ? Number((hours * rate).toFixed(2))
          : undefined;
    }

    return counts;
  }, [currentSchedule.data, activities]);

  const hasData = Object.keys(summary).length > 0;
  const globalTotal = Object.values(summary).reduce(
    (sum, item) => sum + (item.total ?? 0),
    0
  );

  return (
    <div className="rounded-xl border border-gray-300 bg-white dark:bg-gray-800 p-4 shadow-sm space-y-4">
      <h3 className="text-lg font-semibold mb-2">Résumé des heures et coûts</h3>
      {hasData ? (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-600/30">
                <th className="py-1 pr-4">Activité</th>
                <th className="py-1 pr-4">Heures</th>
                <th className="py-1 pr-4">Taux horaire</th>
                <th className="py-1 pr-4">Montant</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(summary).map(([name, { hours, rate, total }]) => (
                <tr key={name} className="border-b border-gray-600/10">
                  <td className="py-1 pr-4">{name}</td>
                  <td className="py-1 pr-4">{hours.toFixed(2)} h</td>
                  <td className="py-1 pr-4">
                    {rate != null ? `${rate.toFixed(2)} /h` : "—"}
                  </td>
                  <td className="py-1 pr-4">
                    {total != null ? `${total.toFixed(2)}` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="py-2 pr-4 font-semibold text-right">
                  Total
                </td>
                <td className="py-2 pr-4 font-semibold">
                  {globalTotal.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        <p>Aucune activité.</p>
      )}
    </div>
  );
};

export default HoursSummary;
