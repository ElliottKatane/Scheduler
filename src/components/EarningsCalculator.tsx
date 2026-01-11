import { useMemo, useState } from "react";

type Row = {
  id: string;
  rate: number; // taux horaire
  hoursPerWeek: number; // heures / semaine
};

const createRow = (): Row => ({
  id: crypto.randomUUID(),
  rate: 0,
  hoursPerWeek: 0,
});

const toNumber = (value: string): number => {
  const v = value.replace(",", ".").trim();
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const formatMoney = (amount: number, currency = "CAD") =>
  new Intl.NumberFormat("fr-CA", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);

export default function EarningsCalculator() {
  const [rows, setRows] = useState<Row[]>([createRow()]);

  const addRow = (afterId?: string) => {
    setRows((prev) => {
      const newRow = createRow();
      if (!afterId) return [...prev, newRow];

      const index = prev.findIndex((r) => r.id === afterId);
      if (index === -1) return [...prev, newRow];

      return [...prev.slice(0, index + 1), newRow, ...prev.slice(index + 1)];
    });
  };

  const removeRow = (id: string) => {
    setRows((prev) => {
      const next = prev.filter((r) => r.id !== id);
      return next.length ? next : [createRow()];
    });
  };

  const updateRow = (id: string, patch: Partial<Row>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const computedRows = useMemo(
    () =>
      rows.map((r) => {
        const monthly = r.rate * r.hoursPerWeek * 4;
        const yearly = monthly * 12;
        return { ...r, monthly, yearly };
      }),
    [rows]
  );

  return (
    <div className="w-full max-w-5xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Calculateur de revenus</h2>
        <button
          onClick={() => addRow()}
          className="rounded-md border px-3 py-1 text-sm hover:bg-gray-100"
        >
          +
        </button>
      </div>

      {/* Rows */}
      <div className="space-y-3">
        {computedRows.map((row, index) => (
          <div
            key={row.id}
            className="grid grid-cols-[120px_160px_1fr_1fr_40px] items-end gap-3 rounded-lg border p-4"
          >
            <div className="text-sm text-gray-500">Ligne {index + 1}</div>

            {/* Taux horaire */}
            <label className="flex flex-col gap-1">
              <span className="text-xs text-gray-500">Taux horaire</span>
              <input
                inputMode="decimal"
                value={row.rate}
                onChange={(e) =>
                  updateRow(row.id, { rate: toNumber(e.target.value) })
                }
                className="rounded-md border px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>

            {/* Heures / semaine */}
            <label className="flex flex-col gap-1">
              <span className="text-xs text-gray-500">Heures / semaine</span>
              <input
                inputMode="decimal"
                value={row.hoursPerWeek}
                onChange={(e) =>
                  updateRow(row.id, {
                    hoursPerWeek: toNumber(e.target.value),
                  })
                }
                className="rounded-md border px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>

            {/* Résultats */}
            <div className="flex flex-col gap-1 text-sm">
              <span className="text-xs text-gray-500">Résultat</span>
              <div className="font-medium">
                {formatMoney(row.monthly)} / mois
              </div>
              <div className="text-green-600">
                {formatMoney(row.yearly)} / an
              </div>
            </div>

            {/* Supprimer */}
            <button
              onClick={() => removeRow(row.id)}
              className="self-center text-gray-400 hover:text-red-500"
              title="Supprimer la ligne"
            >
              ✕
            </button>

            {/* Add below */}
            <div className="col-span-full">
              <button
                onClick={() => addRow(row.id)}
                className="text-xs text-blue-600 hover:underline"
              >
                + Ajouter une ligne en dessous
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
