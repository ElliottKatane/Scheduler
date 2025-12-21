import { useContext, useMemo, useState } from "react";
import { CurrentScheduleContext } from "../context/CurrentScheduleContext";
import { ActivityContext } from "../context/ActivityContext";

type Row = {
  label: string; // affiché dans la colonne "Activité"
  hours: number;
  avgRate?: number; // moyenne pondérée si applicable
  total?: number; // total si tous les taux sont définis
  kind: "label" | "activity";
};

const HoursSummary = ({
  variant = "sidebar",
}: {
  variant?: "sidebar" | "modal";
}) => {
  const context = useContext(CurrentScheduleContext);
  const activityContext = useContext(ActivityContext);

  const [groupByLabel, setGroupByLabel] = useState(false);

  if (!context || !activityContext) return null;

  const { currentSchedule } = context;
  const { activities } = activityContext;

  if (!currentSchedule) return null;

  const rows = useMemo((): Row[] => {
    // Map id -> activity (perf + évite find() dans la boucle)
    const byId = new Map(activities.map((a) => [a.id, a]));

    // accumulator
    const acc: Record<
      string,
      {
        kind: "label" | "activity";
        hours: number;

        // pour moyenne pondérée
        ratedHours: number;
        totalCost: number;

        // si au moins une entrée du groupe n’a pas de taux
        hasMissingRate: boolean;

        // affichage
        label: string;
      }
    > = {};

    for (const [, activityId] of currentSchedule.data) {
      const act = byId.get(activityId);
      if (!act) continue;

      const slotHours = 0.5;

      const firstLabel = act.labels?.[0]?.trim();
      const shouldGroup = groupByLabel && !!firstLabel;

      const key = shouldGroup ? `label:${firstLabel}` : `activity:${act.name}`;
      const kind: Row["kind"] = shouldGroup ? "label" : "activity";
      const display = shouldGroup ? firstLabel! : act.name;

      if (!acc[key]) {
        acc[key] = {
          kind,
          hours: 0,
          ratedHours: 0,
          totalCost: 0,
          hasMissingRate: false,
          label: display,
        };
      }

      acc[key].hours += slotHours;

      if (typeof act.hourlyRate === "number") {
        acc[key].ratedHours += slotHours;
        acc[key].totalCost += slotHours * act.hourlyRate;
      } else {
        acc[key].hasMissingRate = true;
      }
    }

    // output rows
    const out: Row[] = Object.values(acc).map((g) => {
      const avgRate =
        g.ratedHours > 0
          ? Number((g.totalCost / g.ratedHours).toFixed(2))
          : undefined;

      const total = g.hasMissingRate
        ? undefined
        : Number(g.totalCost.toFixed(2));

      return {
        kind: g.kind,
        label: g.label,
        hours: g.hours,
        avgRate,
        total,
      };
    });

    // tri simple pour stabilité (labels puis activités, alpha)
    out.sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === "label" ? -1 : 1;
      return a.label.localeCompare(b.label, "fr", { sensitivity: "base" });
    });

    return out;
  }, [currentSchedule.data, activities, groupByLabel]);

  const hasData = rows.length > 0;

  const globalHours = rows.reduce((sum, r) => sum + r.hours, 0);

  // total global: seulement si toutes les lignes ont un total
  const hasAnyMissingTotal = rows.some((r) => r.total == null);
  const globalTotal = hasAnyMissingTotal
    ? undefined
    : rows.reduce((sum, r) => sum + (r.total ?? 0), 0);

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-2">
        {variant === "sidebar" && (
          <h3 className="text-lg font-semibold">Résumé des heures et coûts</h3>
        )}

        <label className="flex items-center gap-2 text-sm opacity-90 select-none">
          <input
            type="checkbox"
            checked={groupByLabel}
            onChange={(e) => setGroupByLabel(e.target.checked)}
            className="w-4 h-4"
          />
          Regrouper par label
        </label>
      </div>

      {hasData ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm table-auto">
            <thead>
              <tr className="border-b border-gray-600/30">
                <th className="py-2 px-4 text-center whitespace-nowrap">
                  {groupByLabel ? "Label / activité" : "Activité"}
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
              {rows.map((row) => (
                <tr
                  key={`${row.kind}:${row.label}`}
                  className="border-b border-gray-600/10"
                >
                  <td className="py-2 pr-4">
                    <div className="max-w-[28rem] truncate">
                      {row.label}
                      {typeof row.avgRate === "number" ? (
                        <span className="opacity-70">
                          {" "}
                          ({row.avgRate.toFixed(2)}/h)
                        </span>
                      ) : null}
                      {row.kind === "activity" && groupByLabel ? (
                        <span className="opacity-60"> (sans label)</span>
                      ) : null}
                    </div>
                  </td>

                  <td className="py-2 pr-4 whitespace-nowrap">
                    {row.hours.toFixed(2)} h
                  </td>

                  <td className="py-2 pr-0 whitespace-nowrap text-right">
                    {row.total != null ? row.total.toFixed(2) : "—"}
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
                  {globalTotal != null ? globalTotal.toFixed(2) : "—"}
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
