import React, { useEffect, useMemo, useState } from "react";

const labelStyle = {
  display: "block",
  marginBottom: "6px",
  fontSize: "13px",
  fontWeight: 600,
  color: "#1a1917",
  fontFamily: "'DM Sans', sans-serif",
};

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "10px",
  border: "1px solid #e8e6e2",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: "14px",
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

const STEPS = [
  { key: "eventType", title: "Event type" },
  { key: "specialDay", title: "Special day" },
  { key: "guests", title: "Expected guests" },
  { key: "contact", title: "Contact details" },
];

function normalizePhone(value) {
  return String(value || "").replace(/[^\d+]/g, "");
}

function isValidPhone(value) {
  const v = normalizePhone(value);
  if (!v) return false;
  const digits = v.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
}

function toISOOrNull(datetimeLocalValue) {
  if (!datetimeLocalValue) return null;
  const d = new Date(datetimeLocalValue);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function buildLeadPayload(form) {
  const eventType = form.eventType === "other" ? "other" : form.eventType;
  const payload = {
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
      name: (form.name || "").trim(),
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
  return {
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
    name: lead.contact?.name ?? "",
    phone: lead.contact?.phone ?? "",
    altPhone: lead.contact?.altPhone ?? "",
  };
}

function validateStep(stepIndex, form) {
  const errors = {};

  if (stepIndex === 0) {
    if (!form.eventType) errors.eventType = "Please select an event type.";
    if (form.eventType === "other" && !(form.eventTypeOther || "").trim()) {
      errors.eventTypeOther = "Please enter the event type.";
    }
  }

  if (stepIndex === 1) {
    if (!form.startAt)
      errors.startAt = "Please select event start date & time.";
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

  if (stepIndex === 2) {
    if (!form.expectedGuests)
      errors.expectedGuests = "Please enter expected guests.";
    const n = Number(form.expectedGuests);
    if (!Number.isFinite(n) || n <= 0)
      errors.expectedGuests = "Guests must be a positive number.";
  }

  if (stepIndex === 3) {
    if (!(form.name || "").trim()) errors.name = "Please enter your name.";
    if (!isValidPhone(form.phone))
      errors.phone = "Please enter a valid phone number.";
    if (form.altPhone && !isValidPhone(form.altPhone)) {
      errors.altPhone = "Please enter a valid alternative phone number.";
    }
  }

  return errors;
}

function StepPills({ currentStep }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        flexWrap: "wrap",
        marginBottom: 16,
      }}
    >
      {STEPS.map((s, idx) => {
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
              fontSize: 12,
              fontWeight: 700,
              fontFamily: "'DM Sans', sans-serif",
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
  eventType: "",
  eventTypeOther: "",
  startAt: "",
  endAt: "",
  durationHours: 12,
  expectedGuests: "",
  name: "",
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

  useEffect(() => {
    if (!isOpen) return;
    setStep(0);
    setTouched({});
    setForm({
      ...defaultForm,
      ...(isEdit && editLead ? leadToInitialValues(editLead) : initialValues || {}),
    });
  }, [isOpen, isEdit, editLead, initialValues]);

  const stepErrors = useMemo(() => validateStep(step, form), [step, form]);
  const hasStepErrors = Object.keys(stepErrors).length > 0;

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const markTouched = (key) => setTouched((prev) => ({ ...prev, [key]: true }));

  const next = () => {
    const errs = validateStep(step, form);
    if (Object.keys(errs).length > 0) {
      setTouched((prev) => ({
        ...prev,
        ...Object.fromEntries(Object.keys(errs).map((k) => [k, true])),
      }));
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const back = () => setStep((s) => Math.max(s - 1, 0));

  const handleFinalSubmit = (e) => {
    e.preventDefault();
    const errs = validateStep(step, form);
    if (Object.keys(errs).length > 0) {
      setTouched((prev) => ({
        ...prev,
        ...Object.fromEntries(Object.keys(errs).map((k) => [k, true])),
      }));
      return;
    }

    const allErrs = {
      ...validateStep(0, form),
      ...validateStep(1, form),
      ...validateStep(2, form),
      ...validateStep(3, form),
    };
    if (Object.keys(allErrs).length > 0) {
      setTouched((prev) => ({
        ...prev,
        ...Object.fromEntries(Object.keys(allErrs).map((k) => [k, true])),
      }));
      const firstBadStep =
        [0, 1, 2, 3].find(
          (i) => Object.keys(validateStep(i, form)).length > 0,
        ) ?? 0;
      setStep(firstBadStep);
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

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 250,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        background: "rgba(26, 25, 23, 0.4)",
        backdropFilter: "blur(4px)",
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
          padding: 24,
          maxWidth: 520,
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
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
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: 18,
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
              Step {step + 1} of {STEPS.length}
            </div>
          </div>
          <button
            type="button"
            onClick={() => canClose && onClose?.()}
            style={{
              width: 34,
              height: 34,
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
          <StepPills currentStep={step} />

          <form
            onSubmit={(e) => {
              e.preventDefault();
              // Submit only via explicit button click so Enter in inputs doesn’t auto-submit on step 4
            }}
          >
            {step === 0 && (
              <>
                <label style={labelStyle}>
                  Enter event type <span style={{ color: "#d94f3d" }}>*</span>
                </label>
                <select
                  value={form.eventType}
                  onChange={(e) => {
                    setField("eventType", e.target.value);
                    if (e.target.value !== "other")
                      setField("eventTypeOther", "");
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
                      autoFocus
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

            {step === 1 && (
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

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                  }}
                >
                  <div>
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

                  <div>
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

            {step === 2 && (
              <>
                <label style={labelStyle}>
                  Expected guests <span style={{ color: "#d94f3d" }}>*</span>
                </label>
                <input
                  type="number"
                  min={1}
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

            {step === 3 && (
              <>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                  }}
                >
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={labelStyle}>
                      Your name <span style={{ color: "#d94f3d" }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={form.name}
                      onChange={(e) => setField("name", e.target.value)}
                      onBlur={() => markTouched("name")}
                      style={inputStyle}
                    />
                    {touched.name && stepErrors.name && (
                      <div style={errorTextStyle}>{stepErrors.name}</div>
                    )}
                  </div>

                  <div>
                    <label style={labelStyle}>
                      Phone number <span style={{ color: "#d94f3d" }}>*</span>
                    </label>
                    <input
                      type="tel"
                      inputMode="tel"
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

                  <div>
                    <label style={labelStyle}>Alternative phone number</label>
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

              <div style={{ display: "flex", gap: 10, marginLeft: "auto" }}>
                {step < STEPS.length - 1 ? (
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
  );
}
