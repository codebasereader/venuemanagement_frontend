import React, { useMemo, useState } from "react";

function classNames(...args) {
  return args.filter(Boolean).join(" ");
}

function useMonth(year, month) {
  return useMemo(() => {
    const first = new Date(year, month, 1);
    const startWeekday = first.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const weeks = [];
    let currentDay = 1 - startWeekday;

    while (currentDay <= daysInMonth) {
      const week = [];
      for (let i = 0; i < 7; i += 1) {
        if (currentDay < 1 || currentDay > daysInMonth) {
          week.push(null);
        } else {
          week.push(currentDay);
        }
        currentDay += 1;
      }
      weeks.push(week);
    }
    return weeks;
  }, [year, month]);
}

export default function BulkDatePicker({ value = [], onChange }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const monthMatrix = useMonth(year, month);

  const toggleDate = (day) => {
    if (!day) return;
    const date = new Date(year, month, day);
    const iso = date.toISOString().slice(0, 10);
    const set = new Set(value);
    if (set.has(iso)) set.delete(iso);
    else set.add(iso);
    onChange?.(Array.from(set).sort());
  };

  const monthLabel = new Date(year, month, 1).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  const changeMonth = (delta) => {
    const d = new Date(year, month + delta, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => changeMonth(-1)}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#e2dfda] bg-white text-[#6b6966] text-xs"
          >
            {"<"}
          </button>
          <button
            type="button"
            onClick={() => changeMonth(1)}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#e2dfda] bg-white text-[#6b6966] text-xs"
          >
            {">"}
          </button>
        </div>
        <div className="text-sm font-semibold text-[#1a1917]">{monthLabel}</div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-[#9a9896]">
        {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {monthMatrix.map((week, wi) =>
          week.map((day, di) => {
            if (!day) {
              return <div key={`${wi}-${di}`} className="h-8 rounded-xl" />;
            }
            const iso = new Date(year, month, day).toISOString().slice(0, 10);
            const selected = value.includes(iso);
            return (
              <button
                key={`${wi}-${di}`}
                type="button"
                onClick={() => toggleDate(day)}
                className={classNames(
                  "h-8 w-8 rounded-xl flex items-center justify-center border text-xs",
                  selected
                    ? "bg-[#c9a84c] border-[#c9a84c] text-[#1a1917]"
                    : "bg-white border-[#e2dfda] text-[#1a1917] hover:bg-[#f5f3ef]",
                )}
              >
                {day}
              </button>
            );
          }),
        )}
      </div>
    </div>
  );
}

