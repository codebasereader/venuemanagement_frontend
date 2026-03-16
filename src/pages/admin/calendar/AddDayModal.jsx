import React, { useState } from "react";
import { CalendarTypeSelect } from "./CalendarTypeSelect";
import BulkDatePicker from "./BulkDatePicker";
import { RELIGIONS } from "./CalendarTabs";

function classNames(...args) {
  return args.filter(Boolean).join(" ");
}

export default function AddDayModal({ isOpen, onClose, religion, onSubmit }) {
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

  const religionLabel = RELIGIONS.find((r) => r.key === religion)?.label || "Calendar";

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
          <CalendarTypeSelect value={type} onChange={setType} />
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
                : "bg-[#c9a84c] text-[#1a1917]",
            )}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

