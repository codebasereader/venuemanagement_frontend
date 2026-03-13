import React, { useMemo, useState } from "react";

const RELIGIONS = [
  { key: "hindu", label: "Hindu" },
  { key: "muslim", label: "Muslim" },
  { key: "christian", label: "Christian" },
];

const TYPES = [
  { key: "most_auspicious", label: "Most auspicious" },
  { key: "auspicious", label: "Auspicious" },
  { key: "less_auspicious", label: "Less auspicious" },
];

function classNames(...args) {
  return args.filter(Boolean).join(" ");
}

function Tabs({ value, onChange }) {
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
              active ? "bg-white text-[#1a1917] shadow-sm" : "text-[#6b6966]"
            )}
          >
            {r.label}
          </button>
        );
      })}
    </div>
  );
}

function TypeSelect({ value, onChange }) {
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

function useMonth(year, month) {
  return useMemo(() => {
    const first = new Date(year, month, 1);
    const startWeekday = first.getDay(); // 0-6
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

function BulkDatePicker({ value = [], onChange }) {
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
                    : "bg-white border-[#e2dfda] text-[#1a1917] hover:bg-[#f5f3ef]"
                )}
              >
                {day}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

function AddDayModal({ isOpen, onClose, religion, onSubmit }) {
  const [type, setType] = useState("");
  const [dates, setDates] = useState([]);

  const handleSave = () => {
    if (!type || dates.length === 0) return;
    onSubmit?.({ religion, type, dates });
    onClose?.();
    setType("");
    setDates([]);
  };

  if (!isOpen) return null;

  const religionLabel =
    RELIGIONS.find((r) => r.key === religion)?.label || "Calendar";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="font-serif text-lg font-bold text-[#1a1917]">
              Add auspicious days
            </h2>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[#9a9896]">
              {religionLabel} calendar
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#e2dfda] bg-[#faf9f7] text-[#6b6966]"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <TypeSelect value={type} onChange={setType} />
          <div className="space-y-1">
            <div className="text-xs font-semibold text-[#6b6966]">
              Select multiple dates
            </div>
            <BulkDatePicker value={dates} onChange={setDates} />
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#e2dfda] bg-[#f5f3ef] px-4 py-2 text-xs font-semibold text-[#1a1917]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!type || dates.length === 0}
            className={classNames(
              "rounded-xl px-4 py-2 text-xs font-semibold",
              !type || dates.length === 0
                ? "bg-[#e2dfda] text-[#9a9896] cursor-not-allowed"
                : "bg-[#c9a84c] text-[#1a1917]"
            )}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Calendar() {
  const [tab, setTab] = useState("hindu");
  const [modalOpen, setModalOpen] = useState(false);
  const [bulkSelections, setBulkSelections] = useState({
    hindu: [],
    muslim: [],
    christian: [],
  });

  const handleSubmit = ({ religion, type, dates }) => {
    const items = dates.map((d) => ({ religion, type, date: d }));
    setBulkSelections((prev) => ({
      ...prev,
      [religion]: [...(prev[religion] || []), ...items],
    }));
    // In a real app you would POST items to backend here.
    // This state is only for previewing payload shape.
    // eslint-disable-next-line no-console
    console.log("Calendar payload", items);
  };

  const currentItems = bulkSelections[tab] || [];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="font-serif text-xl font-bold text-[#1a1917]">
            Religious calendar
          </h1>
          <p className="text-xs text-[#6b6966]">
            Manage auspicious dates separately for Hindu, Muslim and Christian
            calendars.
          </p>
        </div>
        <Tabs value={tab} onChange={setTab} />
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-[#ece9e4]">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#1a1917]">
            {RELIGIONS.find((r) => r.key === tab)?.label} calendar
          </h2>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1a1917] px-4 py-2 text-xs font-semibold text-white shadow-sm"
          >
            <span className="text-base leading-none">+</span>
            Add days
          </button>
        </div>

        {currentItems.length === 0 ? (
          <p className="py-6 text-center text-xs text-[#9a9896]">
            No auspicious days added yet. Use “Add days” to pick multiple
            dates.
          </p>
        ) : (
          <div className="grid gap-2 text-xs sm:grid-cols-2">
            {currentItems.map((item, idx) => {
              const typeLabel =
                TYPES.find((t) => t.key === item.type)?.label || item.type;
              return (
                <div
                  key={`${item.date}-${item.type}-${idx}`}
                  className="flex items-center justify-between rounded-xl border border-[#f0ede8] bg-[#faf9f7] px-3 py-2"
                >
                  <div>
                    <div className="font-semibold text-[#1a1917]">
                      {item.date}
                    </div>
                    <div className="text-[11px] uppercase tracking-wide text-[#9a9896]">
                      {typeLabel}
                    </div>
                  </div>
                  <div className="text-[10px] font-semibold text-[#6b6966]">
                    {RELIGIONS.find((r) => r.key === item.religion)?.label}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AddDayModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        religion={tab}
        onSubmit={handleSubmit}
      />
    </div>
  );
}