import React from "react";

const RELIGIONS = [
  { key: "hindu", label: "Hindu" },
  { key: "muslim", label: "Muslim" },
  { key: "christian", label: "Christian" },
];

function classNames(...args) {
  return args.filter(Boolean).join(" ");
}

export function CalendarTabs({ value, onChange }) {
  return (
    <div className="inline-flex rounded-xl bg-[#f0ede8] p-1 text-xs font-semibold">
      {RELIGIONS.map((r) => {
        const active = value === r.key;
        return (
          <button
            key={r.key}
            type="button"
            onClick={() => onChange?.(r.key)}
            className={classNames(
              "px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap",
              active ? "bg-white text-[#1a1917] shadow-sm" : "text-[#6b6966]",
            )}
          >
            {r.label}
          </button>
        );
      })}
    </div>
  );
}

export { RELIGIONS };

