import React, { useEffect, useMemo, useState } from "react";

const labelStyle = {
  display: "block",
  marginBottom: "6px",
  fontSize: "13px",
  fontWeight: 600,
  color: "#1a1917",
  fontFamily: "'DM Sans', sans-serif",
};

/** 16px reduces iOS zoom-on-focus on date/time inputs */
const inputStyle = {
  width: "100%",
  maxWidth: "100%",
  minWidth: 0,
  padding: "12px 14px",
  borderRadius: "10px",
  border: "1px solid #e8e6e2",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: "16px",
  color: "#1a1917",
  background: "white",
  boxSizing: "border-box",
};

const helpTextStyle = {
  marginTop: 6,
  fontSize: 12,
  color: "#9a9896",
  fontFamily: "'DM Sans', sans-serif",
};

const errorTextStyle = {
  marginTop: 6,
  fontSize: 12,
  color: "#d94f3d",
  fontFamily: "'DM Sans', sans-serif",
  fontWeight: 600,
};

const btnBase = {
  padding: "10px 18px",
  borderRadius: "10px",
  border: "none",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: "14px",
  fontWeight: 600,
  cursor: "pointer",
  transition: "background 0.15s, opacity 0.15s",
};

const EVENT_TYPES = [
  { value: "wedding", label: "Wedding" },
  { value: "sangeet", label: "Sangeet" },
  { value: "reception", label: "Reception" },
  { value: "mehendi", label: "Mehendi" },
  { value: "engagement", label: "Engagement" },
  { value: "birthday", label: "Birthday" },
  { value: "corporate", label: "Corporate" },
  { value: "beegaraoota", label: "Beegara Oota" },
  { value: "other", label: "Other" },
];

const DURATIONS = [
  { value: 12, label: "12 hours" },
  { value: 24, label: "24 hours" },
  { value: 36, label: "36 hours" },
  { value: 48, label: "48 hours" },
];

const EVENT_STATUSES = [
  { value: "in_progress", label: "In progress" },
  { value: "confirmed", label: "Confirmed" },
  { value: "cancelled", label: "Cancelled" },
];

const NAME_PREFIXES = [
  { value: "mr", label: "Mr" },
  { value: "ms", label: "Ms" },
  { value: "mrs", label: "Mrs" },
  { value: "master", label: "Master" },
];

/** Wedding-style events: show bride & groom fields */
const BRIDE_GROOM_EVENT_TYPES = new Set([
  "wedding",
  "sangeet",
  "reception",
  "mehendi",
  "engagement",
]);

const STEP_DEFS = [
  { key: "eventStatus", title: "Event status" },
  { key: "eventType", title: "Event type" },
  { key: "specialDay", title: "Special day" },
  { key: "guests", title: "Expected guests" },
  { key: "contact", title: "Contact details" },
];

function stepsForForm(form) {
  const list = [...STEP_DEFS];
  if (form.eventStatus === "in_progress") {
    list.push({ key: "meetings", title: "Meeting dates" });
  }
  return list;
}

function newMeetingRow() {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
    meetingAt: "",
    notes: "",
  };
}

function normalizePhone(value) {
  return String(value || "").replace(/[^\d+]/g, "");
}

function isValidPhone(value) {
  const v = normalizePhone(value);
  if (!v) return false;
  const digits = v.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
}

function isValidEmail(value) {
  const s = String(value || "").trim();
  if (!s) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function toISOOrNull(datetimeLocalValue) {
  if (!datetimeLocalValue) return null;
  const d = new Date(datetimeLocalValue);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

const PREFIX_LABEL = {
  mr: "Mr.",
  ms: "Ms.",
  mrs: "Mrs.",
  master: "Master",
};

function formatContactDisplayName(prefix, clientName) {
  const p = PREFIX_LABEL[prefix] || "";
  const n = String(clientName || "").trim();
  return [p, n].filter(Boolean).join(" ");
}

export function isBrideGroomEventType(eventType) {
  return BRIDE_GROOM_EVENT_TYPES.has(String(eventType || "").toLowerCase());
}

/**
 * Builds the API payload for create/update lead.
 *
 * @typedef {Object} LeadMeetingPayload
 * @property {string|null} meetingAt — ISO 8601 datetime
 * @property {string|undefined} notes
 *
 * @typedef {Object} LeadContactPayload
 * @property {'mr'|'ms'|'mrs'|'master'} namePrefix
 * @property {string} name — Full display name (prefix + client name) for backward compatibility
 * @property {string} clientName
 * @property {string|undefined} brideName
 * @property {string|undefined} groomName
 * @property {string|undefined} email
 * @property {string|undefined} stateCityAddress
 * @property {string|undefined} pan
 * @property {string|undefined} gst
 * @property {string|undefined} companyName
 * @property {string} phone
 * @property {string|undefined} altPhone
 *
 * @typedef {Object} LeadPayload
 * @property {'in_progress'|'confirmed'|'cancelled'} eventStatus
 * @property {LeadMeetingPayload[]|undefined} meetings — Present when eventStatus is `in_progress` (can be empty array)
 * @property {string} eventType
 * @property {string|undefined} eventTypeOther
 * @property {{ startAt: string|null, endAt: string|null, durationHours: number|null }} specialDay
 * @property {number|null} expectedGuests
 * @property {LeadContactPayload} contact
 *
 * @param {object} form — Internal form state
 * @returns {LeadPayload}
 */
export function buildLeadPayload(form) {
  const eventType = form.eventType === "other" ? "other" : form.eventType;
  const meetings =
    form.eventStatus === "in_progress"
      ? (form.meetings || [])
          .filter((m) => m?.meetingAt)
          .map((m) => ({
            meetingAt: toISOOrNull(m.meetingAt),
            notes: String(m.notes || "").trim() || undefined,
          }))
      : undefined;

  const payload = {
    eventStatus: form.eventStatus || undefined,
    ...(form.eventStatus === "in_progress"
      ? { meetings: meetings && meetings.length ? meetings : [] }
      : {}),
    eventType,
    eventTypeOther:
      eventType === "other"
        ? (form.eventTypeOther || "").trim() || undefined
        : undefined,
    specialDay: {
      startAt: toISOOrNull(form.startAt),
      endAt: toISOOrNull(form.endAt),
      durationHours: form.durationHours ? Number(form.durationHours) : null,
    },
    expectedGuests: form.expectedGuests ? Number(form.expectedGuests) : null,
    contact: {
      namePrefix: form.namePrefix || "mr",
      name: formatContactDisplayName(form.namePrefix, form.clientName),
      clientName: (form.clientName || "").trim(),
      ...(isBrideGroomEventType(form.eventType)
        ? {
            brideName: (form.brideName || "").trim() || undefined,
            groomName: (form.groomName || "").trim() || undefined,
          }
        : {}),
      email: (form.email || "").trim() || undefined,
      stateCityAddress: (form.stateCityAddress || "").trim() || undefined,
      pan: (form.pan || "").trim().toUpperCase() || undefined,
      gst: (form.gst || "").trim().toUpperCase() || undefined,
      companyName: (form.companyName || "").trim() || undefined,
      phone: normalizePhone(form.phone),
      altPhone: form.altPhone ? normalizePhone(form.altPhone) : undefined,
    },
  };

  return payload;
}

/** Map API lead to form initial values for edit mode */
export function leadToInitialValues(lead) {
  if (!lead || typeof lead !== "object") return null;
  const sd = lead.specialDay || {};
  const startAt = sd.startAt ? new Date(sd.startAt) : null;
  const endAt = sd.endAt ? new Date(sd.endAt) : null;

  const rawMeetings = Array.isArray(lead.meetings) ? lead.meetings : [];
  const meetings =
    rawMeetings.length > 0
      ? rawMeetings.map((m, i) => ({
          id: m._id || m.id || `m-${i}-${Date.now()}`,
          meetingAt:
            m.meetingAt
              ? new Date(m.meetingAt).toISOString().slice(0, 16)
              : "",
          notes: m.notes ?? "",
        }))
      : [newMeetingRow()];

  const c = lead.contact || {};
  const legacyName = c.clientName ?? c.name ?? "";

  return {
    eventStatus: lead.eventStatus ?? "confirmed",
    meetings,
    eventType: lead.eventType || "",
    eventTypeOther: lead.eventTypeOther || "",
    startAt:
      startAt && !Number.isNaN(startAt.getTime())
        ? startAt.toISOString().slice(0, 16)
        : "",
    endAt:
      endAt && !Number.isNaN(endAt.getTime())
        ? endAt.toISOString().slice(0, 16)
        : "",
    durationHours: sd.durationHours ?? 12,
    expectedGuests: lead.expectedGuests ?? "",
    namePrefix: ["mr", "ms", "mrs", "master"].includes(
      String(c.namePrefix || "").toLowerCase(),
    )
      ? String(c.namePrefix).toLowerCase()
      : "mr",
    clientName: legacyName,
    brideName: c.brideName ?? "",
    groomName: c.groomName ?? "",
    email: c.email ?? "",
    stateCityAddress: c.stateCityAddress ?? "",
    pan: c.pan ?? "",
    gst: c.gst ?? "",
    companyName: c.companyName ?? "",
    phone: c.phone ?? "",
    altPhone: c.altPhone ?? "",
  };
}

function validateStepByKey(key, form) {
  const errors = {};

  if (key === "eventStatus") {
    if (!form.eventStatus) errors.eventStatus = "Please select an event status.";
  }

  if (key === "eventType") {
    if (!form.eventType) errors.eventType = "Please select an event type.";
    if (form.eventType === "other" && !(form.eventTypeOther || "").trim()) {
      errors.eventTypeOther = "Please enter the event type.";
    }
  }

  if (key === "specialDay") {
    if (!form.startAt) errors.startAt = "Please select event start date & time.";
    if (!form.endAt) errors.endAt = "Please select event end date & time.";
    if (!form.durationHours) errors.durationHours = "Please select a duration.";
    const start = form.startAt ? new Date(form.startAt) : null;
    const end = form.endAt ? new Date(form.endAt) : null;
    if (
      start &&
      end &&
      !Number.isNaN(start.getTime()) &&
      !Number.isNaN(end.getTime())
    ) {
      if (end.getTime() <= start.getTime())
        errors.endAt = "End date/time must be after start.";
    }
  }

  if (key === "guests") {
    if (!form.expectedGuests)
      errors.expectedGuests = "Please enter expected guests.";
    const n = Number(form.expectedGuests);
    if (!Number.isFinite(n) || n <= 0)
      errors.expectedGuests = "Guests must be a positive number.";
  }

  if (key === "contact") {
    if (!(form.clientName || "").trim())
      errors.clientName = "Please enter client name.";
    if (!isValidPhone(form.phone))
      errors.phone = "Please enter a valid phone number.";
    if (form.altPhone && !isValidPhone(form.altPhone)) {
      errors.altPhone = "Please enter a valid alternative phone number.";
    }
    if (!isValidEmail(form.email)) {
      errors.email = "Please enter a valid email address.";
    }
    if (isBrideGroomEventType(form.eventType)) {
      if (!(form.brideName || "").trim())
        errors.brideName = "Please enter bride name.";
      if (!(form.groomName || "").trim())
        errors.groomName = "Please enter groom name.";
    }
  }

  if (key === "meetings") {
    if (form.eventStatus !== "in_progress") return errors;
    const rows = form.meetings || [];
    const withDate = rows.filter((m) => m?.meetingAt);
    if (withDate.length === 0) {
      errors.meetings = "Add at least one meeting date.";
    }
  }

  return errors;
}

function StepPills({ steps, currentStep }) {
  return (
    <div
      className="add-leads-step-pills"
      style={{
        display: "flex",
        gap: 8,
        flexWrap: "wrap",
        marginBottom: 16,
      }}
    >
      {steps.map((s, idx) => {
        const active = idx === currentStep;
        const done = idx < currentStep;
        return (
          <div
            key={s.key}
            style={{
              padding: "8px 10px",
              borderRadius: 999,
              border: `1px solid ${active ? "#1a1917" : "#e8e6e2"}`,
              background: active ? "#1a1917" : done ? "#f0ede8" : "#faf9f7",
              color: active ? "white" : "#1a1917",
              fontSize: 11,
              fontWeight: 700,
              fontFamily: "'DM Sans', sans-serif",
              lineHeight: 1.25,
              maxWidth: "100%",
            }}
          >
            {idx + 1}. {s.title}
          </div>
        );
      })}
    </div>
  );
}

const defaultForm = {
  eventStatus: "",
  meetings: [newMeetingRow()],
  eventType: "",
  eventTypeOther: "",
  startAt: "",
  endAt: "",
  durationHours: 12,
  expectedGuests: "",
  namePrefix: "mr",
  clientName: "",
  brideName: "",
  groomName: "",
  email: "",
  stateCityAddress: "",
  pan: "",
  gst: "",
  companyName: "",
  phone: "",
  altPhone: "",
};

export default function AddLeads({
  isOpen,
  onClose,
  onSubmit,
  onUpdate,
  initialValues,
  editLead = null,
  submitting = false,
}) {
  const isEdit = Boolean(editLead?._id);
  const resolvedInitial = isEdit && editLead ? leadToInitialValues(editLead) : initialValues;

  const [step, setStep] = useState(0);
  const [touched, setTouched] = useState({});
  const [form, setForm] = useState({
    ...defaultForm,
    ...(resolvedInitial || {}),
  });

  const activeSteps = useMemo(() => stepsForForm(form), [form.eventStatus]);

  useEffect(() => {
    if (!isOpen) return;
    setStep(0);
    setTouched({});
    setForm({
      ...defaultForm,
      ...(isEdit && editLead ? leadToInitialValues(editLead) : initialValues || {}),
    });
  }, [isOpen, isEdit, editLead, initialValues]);

  useEffect(() => {
    setStep((s) => Math.min(s, Math.max(0, activeSteps.length - 1)));
  }, [activeSteps.length]);

  const currentKey = activeSteps[step]?.key;
  const stepErrors = useMemo(
    () => (currentKey ? validateStepByKey(currentKey, form) : {}),
    [currentKey, form],
  );
  const hasStepErrors = Object.keys(stepErrors).length > 0;

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const markTouched = (key) => setTouched((prev) => ({ ...prev, [key]: true }));

  const next = () => {
    const key = activeSteps[step]?.key;
    if (!key) return;
    const errs = validateStepByKey(key, form);
    if (Object.keys(errs).length > 0) {
      setTouched((prev) => ({
        ...prev,
        ...Object.fromEntries(Object.keys(errs).map((k) => [k, true])),
      }));
      return;
    }
    setStep((s) => Math.min(s + 1, activeSteps.length - 1));
  };

  const back = () => setStep((s) => Math.max(s - 1, 0));

  const handleFinalSubmit = (e) => {
    e.preventDefault();
    const merged = {};
    let firstBad = -1;
    activeSteps.forEach((s, i) => {
      const eMap = validateStepByKey(s.key, form);
      if (Object.keys(eMap).length > 0 && firstBad < 0) firstBad = i;
      Object.assign(merged, eMap);
    });
    if (Object.keys(merged).length > 0) {
      setTouched((prev) => ({
        ...prev,
        ...Object.fromEntries(Object.keys(merged).map((k) => [k, true])),
      }));
      setStep(firstBad >= 0 ? firstBad : 0);
      return;
    }

    const payload = buildLeadPayload(form);
    if (isEdit && onUpdate) {
      onUpdate(editLead._id, payload);
    } else {
      onSubmit?.(payload);
    }
  };

  const canClose = !submitting;
  const title = isEdit ? "Edit Lead" : "Add Lead";
  const lastStepIndex = activeSteps.length - 1;
  const showBrideGroom = isBrideGroomEventType(form.eventType);

  const updateMeeting = (id, patch) => {
    setForm((prev) => ({
      ...prev,
      meetings: (prev.meetings || []).map((m) =>
        m.id === id ? { ...m, ...patch } : m,
      ),
    }));
  };

  const addMeetingRow = () => {
    setForm((prev) => ({
      ...prev,
      meetings: [...(prev.meetings || []), newMeetingRow()],
    }));
  };

  const removeMeetingRow = (id) => {
    setForm((prev) => {
      const list = prev.meetings || [];
      if (list.length <= 1) return prev;
      return { ...prev, meetings: list.filter((m) => m.id !== id) };
    });
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        .add-leads-datetime-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }
        @media (min-width: 520px) {
          .add-leads-datetime-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        .add-leads-contact-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }
        @media (min-width: 480px) {
          .add-leads-contact-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        .add-leads-name-row {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        @media (min-width: 400px) {
          .add-leads-name-row {
            flex-direction: row;
            align-items: flex-end;
          }
          .add-leads-name-prefix {
            flex: 0 0 auto;
            min-width: 112px;
          }
          .add-leads-name-field {
            flex: 1;
            min-width: 0;
          }
        }
      `}</style>
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 250,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "clamp(12px, 3vw, 20px)",
          background: "rgba(26, 25, 23, 0.4)",
          backdropFilter: "blur(4px)",
          overflow: "auto",
        }}
        onClick={() => {
          if (canClose) onClose?.();
        }}
        role="presentation"
      >
        <div
          style={{
            background: "white",
            borderRadius: 16,
            boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 0 0 1px #f1f0ee",
            padding: "clamp(16px, 4vw, 24px)",
            maxWidth: "min(560px, calc(100vw - 24px))",
            width: "100%",
            maxHeight: "min(92vh, 900px)",
            overflowY: "auto",
            margin: "auto",
          }}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div style={{ minWidth: 0 }}>
              <h3
                style={{
                  margin: 0,
                  fontSize: "clamp(17px, 4vw, 18px)",
                  fontWeight: 700,
                  color: "#1a1917",
                  fontFamily: "'DM Serif Display', Georgia, serif",
                }}
              >
                {title}
              </h3>
              <div
                style={{
                  marginTop: 4,
                  fontSize: 13,
                  color: "#6b6966",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Step {step + 1} of {activeSteps.length}
              </div>
            </div>
            <button
              type="button"
              onClick={() => canClose && onClose?.()}
              style={{
                width: 34,
                height: 34,
                flexShrink: 0,
                borderRadius: 10,
                border: "1px solid #e8e6e2",
                background: "#faf9f7",
                cursor: canClose ? "pointer" : "not-allowed",
                opacity: canClose ? 1 : 0.6,
              }}
              aria-label="Close"
              title="Close"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div style={{ marginTop: 16 }}>
            <StepPills steps={activeSteps} currentStep={step} />

            <form
              onSubmit={(e) => {
                e.preventDefault();
              }}
            >
              {currentKey === "eventStatus" && (
                <>
                  <label style={labelStyle}>
                    Event status <span style={{ color: "#d94f3d" }}>*</span>
                  </label>
                  <select
                    value={form.eventStatus}
                    onChange={(e) => {
                      const v = e.target.value;
                      setField("eventStatus", v);
                      if (v !== "in_progress") {
                        setField("meetings", [newMeetingRow()]);
                      }
                    }}
                    onBlur={() => markTouched("eventStatus")}
                    style={{ ...inputStyle, marginBottom: 10 }}
                  >
                    <option value="" disabled>
                      Select status…
                    </option>
                    {EVENT_STATUSES.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  {touched.eventStatus && stepErrors.eventStatus && (
                    <div style={errorTextStyle}>{stepErrors.eventStatus}</div>
                  )}
                  <div style={helpTextStyle}>
                    In progress lets you add one or more meeting dates and notes
                    as the final step.
                  </div>
                </>
              )}

              {currentKey === "eventType" && (
                <>
                  <label style={labelStyle}>
                    Event type <span style={{ color: "#d94f3d" }}>*</span>
                  </label>
                  <select
                    value={form.eventType}
                    onChange={(e) => {
                      setField("eventType", e.target.value);
                      if (e.target.value !== "other")
                        setField("eventTypeOther", "");
                      if (!isBrideGroomEventType(e.target.value)) {
                        setField("brideName", "");
                        setField("groomName", "");
                      }
                    }}
                    onBlur={() => markTouched("eventType")}
                    style={{ ...inputStyle, marginBottom: 10 }}
                  >
                    <option value="" disabled>
                      Select event type...
                    </option>
                    {EVENT_TYPES.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  {touched.eventType && stepErrors.eventType && (
                    <div style={errorTextStyle}>{stepErrors.eventType}</div>
                  )}

                  {form.eventType === "other" && (
                    <div style={{ marginTop: 14 }}>
                      <label style={labelStyle}>
                        Other event type{" "}
                        <span style={{ color: "#d94f3d" }}>*</span>
                      </label>
                      <input
                        type="text"
                        value={form.eventTypeOther}
                        onChange={(e) =>
                          setField("eventTypeOther", e.target.value)
                        }
                        onBlur={() => markTouched("eventTypeOther")}
                        placeholder="e.g. Anniversary, Baby shower"
                        style={inputStyle}
                      />
                      {touched.eventTypeOther && stepErrors.eventTypeOther && (
                        <div style={errorTextStyle}>
                          {stepErrors.eventTypeOther}
                        </div>
                      )}
                    </div>
                  )}

                  <div style={helpTextStyle}>
                    You can change this later if needed.
                  </div>
                </>
              )}

              {currentKey === "specialDay" && (
                <>
                  <div style={{ marginBottom: 14 }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "#1a1917",
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      When is your special day?
                    </div>
                    <div style={helpTextStyle}>
                      Add the event schedule so the team can plan availability.
                    </div>
                  </div>

                  <div className="add-leads-datetime-grid">
                    <div style={{ minWidth: 0 }}>
                      <label style={labelStyle}>
                        Event start <span style={{ color: "#d94f3d" }}>*</span>
                      </label>
                      <input
                        type="datetime-local"
                        value={form.startAt}
                        onChange={(e) => setField("startAt", e.target.value)}
                        onBlur={() => markTouched("startAt")}
                        style={inputStyle}
                      />
                      {touched.startAt && stepErrors.startAt && (
                        <div style={errorTextStyle}>{stepErrors.startAt}</div>
                      )}
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <label style={labelStyle}>
                        Event end <span style={{ color: "#d94f3d" }}>*</span>
                      </label>
                      <input
                        type="datetime-local"
                        value={form.endAt}
                        onChange={(e) => setField("endAt", e.target.value)}
                        onBlur={() => markTouched("endAt")}
                        style={inputStyle}
                      />
                      {touched.endAt && stepErrors.endAt && (
                        <div style={errorTextStyle}>{stepErrors.endAt}</div>
                      )}
                    </div>
                  </div>

                  <div style={{ marginTop: 12 }}>
                    <label style={labelStyle}>
                      Duration <span style={{ color: "#d94f3d" }}>*</span>
                    </label>
                    <select
                      value={form.durationHours}
                      onChange={(e) => setField("durationHours", e.target.value)}
                      onBlur={() => markTouched("durationHours")}
                      style={inputStyle}
                    >
                      {DURATIONS.map((d) => (
                        <option key={d.value} value={d.value}>
                          {d.label}
                        </option>
                      ))}
                    </select>
                    {touched.durationHours && stepErrors.durationHours && (
                      <div style={errorTextStyle}>{stepErrors.durationHours}</div>
                    )}
                  </div>
                </>
              )}

              {currentKey === "guests" && (
                <>
                  <label style={labelStyle}>
                    Expected guests <span style={{ color: "#d94f3d" }}>*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    inputMode="numeric"
                    placeholder="e.g. 250"
                    value={form.expectedGuests}
                    onChange={(e) => setField("expectedGuests", e.target.value)}
                    onBlur={() => markTouched("expectedGuests")}
                    style={inputStyle}
                  />
                  {touched.expectedGuests && stepErrors.expectedGuests && (
                    <div style={errorTextStyle}>{stepErrors.expectedGuests}</div>
                  )}
                  <div style={helpTextStyle}>
                    An estimate is fine — it helps with capacity and planning.
                  </div>
                </>
              )}

              {currentKey === "contact" && (
                <>
                  <div className="add-leads-name-row" style={{ marginBottom: 12 }}>
                    <div className="add-leads-name-prefix">
                      <label style={labelStyle}>Prefix</label>
                      <select
                        value={form.namePrefix}
                        onChange={(e) => setField("namePrefix", e.target.value)}
                        style={inputStyle}
                      >
                        {NAME_PREFIXES.map((p) => (
                          <option key={p.value} value={p.value}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="add-leads-name-field" style={{ minWidth: 0 }}>
                      <label style={labelStyle}>
                        Client name <span style={{ color: "#d94f3d" }}>*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Rahul Sharma"
                        value={form.clientName}
                        onChange={(e) => setField("clientName", e.target.value)}
                        onBlur={() => markTouched("clientName")}
                        style={inputStyle}
                      />
                      {touched.clientName && stepErrors.clientName && (
                        <div style={errorTextStyle}>{stepErrors.clientName}</div>
                      )}
                    </div>
                  </div>

                  {showBrideGroom && (
                    <div className="add-leads-contact-grid" style={{ marginBottom: 12 }}>
                      <div style={{ minWidth: 0 }}>
                        <label style={labelStyle}>
                          Bride name <span style={{ color: "#d94f3d" }}>*</span>
                        </label>
                        <input
                          type="text"
                          value={form.brideName}
                          onChange={(e) => setField("brideName", e.target.value)}
                          onBlur={() => markTouched("brideName")}
                          style={inputStyle}
                        />
                        {touched.brideName && stepErrors.brideName && (
                          <div style={errorTextStyle}>{stepErrors.brideName}</div>
                        )}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <label style={labelStyle}>
                          Groom name <span style={{ color: "#d94f3d" }}>*</span>
                        </label>
                        <input
                          type="text"
                          value={form.groomName}
                          onChange={(e) => setField("groomName", e.target.value)}
                          onBlur={() => markTouched("groomName")}
                          style={inputStyle}
                        />
                        {touched.groomName && stepErrors.groomName && (
                          <div style={errorTextStyle}>{stepErrors.groomName}</div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="add-leads-contact-grid">
                    <div style={{ gridColumn: "1 / -1", minWidth: 0 }}>
                      <label style={labelStyle}>Email</label>
                      <input
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        placeholder="name@example.com"
                        value={form.email}
                        onChange={(e) => setField("email", e.target.value)}
                        onBlur={() => markTouched("email")}
                        style={inputStyle}
                      />
                      {touched.email && stepErrors.email && (
                        <div style={errorTextStyle}>{stepErrors.email}</div>
                      )}
                    </div>

                    <div style={{ gridColumn: "1 / -1", minWidth: 0 }}>
                      <label style={labelStyle}>State, city & address</label>
                      <textarea
                        value={form.stateCityAddress}
                        onChange={(e) =>
                          setField("stateCityAddress", e.target.value)
                        }
                        onBlur={() => markTouched("stateCityAddress")}
                        placeholder="State, city, full address"
                        rows={3}
                        style={{
                          ...inputStyle,
                          resize: "vertical",
                          minHeight: 72,
                          lineHeight: 1.45,
                        }}
                      />
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <label style={labelStyle}>PAN</label>
                      <input
                        type="text"
                        autoCapitalize="characters"
                        placeholder="e.g. ABCDE1234F"
                        value={form.pan}
                        onChange={(e) => setField("pan", e.target.value)}
                        style={inputStyle}
                      />
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <label style={labelStyle}>GST</label>
                      <input
                        type="text"
                        autoCapitalize="characters"
                        placeholder="GSTIN"
                        value={form.gst}
                        onChange={(e) => setField("gst", e.target.value)}
                        style={inputStyle}
                      />
                    </div>

                    <div style={{ gridColumn: "1 / -1", minWidth: 0 }}>
                      <label style={labelStyle}>Company name</label>
                      <input
                        type="text"
                        value={form.companyName}
                        onChange={(e) => setField("companyName", e.target.value)}
                        style={inputStyle}
                      />
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <label style={labelStyle}>
                        Phone <span style={{ color: "#d94f3d" }}>*</span>
                      </label>
                      <input
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        placeholder="e.g. +91 9876543210"
                        value={form.phone}
                        onChange={(e) => setField("phone", e.target.value)}
                        onBlur={() => markTouched("phone")}
                        style={inputStyle}
                      />
                      {touched.phone && stepErrors.phone && (
                        <div style={errorTextStyle}>{stepErrors.phone}</div>
                      )}
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <label style={labelStyle}>Alternative phone</label>
                      <input
                        type="tel"
                        inputMode="tel"
                        placeholder="Optional"
                        value={form.altPhone}
                        onChange={(e) => setField("altPhone", e.target.value)}
                        onBlur={() => markTouched("altPhone")}
                        style={inputStyle}
                      />
                      {touched.altPhone && stepErrors.altPhone && (
                        <div style={errorTextStyle}>{stepErrors.altPhone}</div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {currentKey === "meetings" && (
                <>
                  <div style={{ marginBottom: 12 }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "#1a1917",
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      Meeting dates & notes
                    </div>
                    <div style={helpTextStyle}>
                      Add one or more meetings. Each row needs a date & time; notes
                      are optional.
                    </div>
                  </div>

                  {(form.meetings || []).map((row, idx) => (
                    <div
                      key={row.id}
                      style={{
                        marginBottom: 14,
                        padding: 14,
                        borderRadius: 12,
                        border: "1px solid #ece9e4",
                        background: "#faf9f7",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 10,
                          gap: 8,
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 800,
                            color: "#6b6966",
                            fontFamily: "'DM Sans', sans-serif",
                          }}
                        >
                          Meeting {idx + 1}
                        </span>
                        {(form.meetings || []).length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeMeetingRow(row.id)}
                            style={{
                              ...btnBase,
                              padding: "6px 12px",
                              fontSize: 12,
                              background: "#fff",
                              border: "1px solid #e8e6e2",
                              color: "#d94f3d",
                            }}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <label style={labelStyle}>
                        Meeting date & time{" "}
                        <span style={{ color: "#d94f3d" }}>*</span>
                      </label>
                      <input
                        type="datetime-local"
                        value={row.meetingAt}
                        onChange={(e) =>
                          updateMeeting(row.id, { meetingAt: e.target.value })
                        }
                        style={{ ...inputStyle, marginBottom: 10 }}
                      />
                      <label style={labelStyle}>Meeting notes</label>
                      <textarea
                        value={row.notes}
                        onChange={(e) =>
                          updateMeeting(row.id, { notes: e.target.value })
                        }
                        placeholder="Discussion points, follow-ups…"
                        rows={3}
                        style={{
                          ...inputStyle,
                          resize: "vertical",
                          minHeight: 72,
                          lineHeight: 1.45,
                        }}
                      />
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addMeetingRow}
                    style={{
                      ...btnBase,
                      width: "100%",
                      background: "#f5f4f1",
                      color: "#1a1917",
                      border: "1px dashed #d4cfc4",
                    }}
                  >
                    + Add another meeting
                  </button>

                  {touched.meetings && stepErrors.meetings && (
                    <div style={{ ...errorTextStyle, marginTop: 10 }}>
                      {stepErrors.meetings}
                    </div>
                  )}
                </>
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  marginTop: 22,
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="button"
                  onClick={back}
                  disabled={step === 0 || submitting}
                  style={{
                    ...btnBase,
                    background: "#f5f4f1",
                    color: "#1a1917",
                    opacity: step === 0 || submitting ? 0.6 : 1,
                    cursor: step === 0 || submitting ? "not-allowed" : "pointer",
                  }}
                >
                  Back
                </button>

                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    marginLeft: "auto",
                    flexWrap: "wrap",
                    justifyContent: "flex-end",
                  }}
                >
                  {step < lastStepIndex ? (
                    <button
                      type="button"
                      onClick={next}
                      disabled={submitting}
                      style={{
                        ...btnBase,
                        background: "#1a1917",
                        color: "white",
                        opacity: submitting ? 0.7 : 1,
                        cursor: submitting ? "not-allowed" : "pointer",
                      }}
                      title={
                        hasStepErrors ? "Please fix errors to continue" : "Next"
                      }
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleFinalSubmit}
                      disabled={submitting}
                      style={{
                        ...btnBase,
                        background: "#1a1917",
                        color: "white",
                        opacity: submitting ? 0.7 : 1,
                        cursor: submitting ? "not-allowed" : "pointer",
                      }}
                    >
                      {submitting ? "Submitting..." : "Submit"}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
