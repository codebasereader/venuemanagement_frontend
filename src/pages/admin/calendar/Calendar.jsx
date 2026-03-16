import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { message } from "antd";
import { CalendarTabs, RELIGIONS } from "./CalendarTabs";
import { TYPES } from "./CalendarTypeSelect";
import AddDayModal from "./AddDayModal";
import { createCalendarDaysBulk, listCalendarDays } from "../../../api/calendar";
export default function Calendar() {
  const accessToken = useSelector((state) => state.user.value.access_token);
  const [msgApi, contextHolder] = message.useMessage();

  const [tab, setTab] = useState("hindu");
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);

  const refresh = useCallback(
    async (religionKey = tab) => {
      if (!accessToken) return;
      setLoading(true);
      try {
        const data = await listCalendarDays(accessToken, { religion: religionKey });
        const arr = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
        setItems(arr);
      } catch (err) {
        msgApi.error(
          err?.response?.data?.message ??
            err?.message ??
            "Failed to load religious calendar days",
        );
      } finally {
        setLoading(false);
      }
    },
    [accessToken, msgApi, tab],
  );

  useEffect(() => {
    refresh(tab);
  }, [refresh, tab]);

  const handleSubmit = useCallback(
    async ({ religion, type, dates }) => {
      if (!accessToken) return;
      const itemsPayload = dates.map((d) => ({ religion, type, date: d }));
      try {
        await createCalendarDaysBulk(itemsPayload, accessToken);
        msgApi.success("Auspicious days saved");
        await refresh(religion);
      } catch (err) {
        msgApi.error(
          err?.response?.data?.message ??
            err?.message ??
            "Failed to save religious calendar days",
        );
      }
    },
    [accessToken, msgApi, refresh],
  );

  const currentItems = items.filter((item) => item.religion === tab);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {contextHolder}
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
        <CalendarTabs value={tab} onChange={setTab} />
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-[#ece9e4]">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#1a1917]">
            {RELIGIONS.find((r) => r.key === tab)?.label} calendar
          </h2>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1a1917] px-4 py-2 text-xs font-semibold text-white shadow-sm disabled:opacity-60"
            disabled={loading || !accessToken}
          >
            <span className="text-base leading-none">+</span>
            Add days
          </button>
        </div>

        {loading ? (
          <p className="py-6 text-center text-xs text-[#9a9896]">
            Loading calendar days…
          </p>
        ) : currentItems.length === 0 ? (
          <p className="py-6 text-center text-xs text-[#9a9896]">
            No auspicious days added yet. Use “Add days” to pick multiple
            dates.
          </p>
        ) : (
          <div className="grid gap-2 text-xs sm:grid-cols-2">
            {currentItems.map((item, idx) => {
              const typeLabel =
                TYPES.find((t) => t.key === item.type)?.label || item.type;
              const idKey = item._id ?? item.id ?? `${item.date}-${item.type}-${idx}`;
              return (
                <div
                  key={idKey}
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