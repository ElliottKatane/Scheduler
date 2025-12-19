import { useContext, useMemo } from "react";
import { CurrentScheduleContext } from "../context/CurrentScheduleContext";
import { ActivityContext } from "../context/ActivityContext";

const HoursSummary = ({
  variant = "sidebar",
}: {
  variant?: "sidebar" | "modal";
}) => {
  const context = useContext(CurrentScheduleContext);
  const activityContext = useContext(ActivityContext);

  if (!context || !activityContext) return null;

  const { currentSchedule } = context;
  const { activities } = activityContext;

  if (!currentSchedule) return null;

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
      counts[name].hours += 0.5;
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

  const entries = Object.values(summary);
  const hasData = entries.length > 0;

  const globalHours = entries.reduce((sum, item) => sum + item.hours, 0);
  const globalTotal = entries.reduce((sum, item) => sum + (item.total ?? 0), 0);

  return (
    <div>
      {variant === "sidebar" && (
        <h3 className="text-lg font-semibold mb-2">
          Résumé des heures et coûts
        </h3>
      )}

      {hasData ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm table-auto">
            <thead>
              <tr className="border-b border-gray-600/30">
                <th className="py-2 px-4 text-center whitespace-nowrap">
                  Activité
                </th>
                <th className="py-2 px-4 text-center whitespace-nowrap">
                  Heures
                </th>
                <th className="py-2 px-4 text-center whitespace-nowrap">
                  Montant
                </th>
              </tr>
            </thead>

            <tbody>
              {Object.entries(summary).map(([name, { hours, rate, total }]) => (
                <tr key={name} className="border-b border-gray-600/10">
                  <td className="py-2 pr-4">
                    <div className="max-w-[28rem] truncate">
                      {name}
                      {typeof rate === "number" ? (
                        <span className="opacity-70">
                          {" "}
                          ({rate.toFixed(2)}/h)
                        </span>
                      ) : null}
                    </div>
                  </td>

                  <td className="py-2 pr-4 whitespace-nowrap">
                    {hours.toFixed(2)} h
                  </td>

                  <td className="py-2 pr-0 whitespace-nowrap text-right">
                    {total != null ? total.toFixed(2) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>

            <tfoot>
              <tr className="border-t border-gray-600/30">
                <td className="py-2 pr-4 font-semibold text-right">Total</td>
                <td className="py-2 pr-4 font-semibold whitespace-nowrap">
                  {globalHours.toFixed(2)} h
                </td>
                <td className="py-2 pr-0 font-semibold whitespace-nowrap text-right">
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
