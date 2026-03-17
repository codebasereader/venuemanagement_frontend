import React from "react";

export const TYPES = [
  { key: "most_auspicious", label: "Highly Auspicious" },
  { key: "auspicious", label: "Auspicious" },
  { key: "less_auspicious", label: "Less auspicious" },
];

export function CalendarTypeSelect({ value, onChange }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-[#6b6966]">Type</label>
      <select
        className="w-full rounded-xl border border-[#e2dfda] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      >
        <option value="">Select type…</option>
        {TYPES.map((t) => (
          <option key={t.key} value={t.key}>
            {t.label}
          </option>
        ))}
      </select>
    </div>
  );
}

