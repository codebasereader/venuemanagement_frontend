import React from "react";

const DURATIONS = [
  { key: "12", label: "Half Day" },
  { key: "24", label: "Full Day" },
  { key: "36", label: "1.5 Day" },
  { key: "48", label: "2 Days" },
];

export default function RackRatesSection({ rates = {}, onChange }) {
  const handleChange = (key, value) => {
    const next = { ...rates, [key]: value.replace(/[^\d]/g, "") };
    onChange?.(next);
  };

  return (
    <section style={{ marginBottom: "24px" }}>
      <h2
        style={{
          margin: "0 0 4px",
          fontSize: "18px",
          fontWeight: 700,
          color: "#1a1917",
          fontFamily: "'DM Serif Display', Georgia, serif",
        }}
      >
        RACK RATES
      </h2>
      <p style={{ margin: "0 0 16px", fontSize: "13px", color: "#6b6966" }}>
        Base pricing by event duration
      </p>
      <div
        style={{
          background: "#faf9f7",
          border: "1px solid #e8e6e2",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1px",
            background: "#e8e6e2",
          }}
        >
          <div
            style={{
              padding: "12px",
              background: "#f5f4f1",
              fontWeight: 600,
              fontSize: "13px",
              color: "#1a1917",
            }}
          >
            Duration
          </div>
          <div
            style={{
              padding: "12px",
              background: "#f5f4f1",
              fontWeight: 600,
              fontSize: "13px",
              color: "#1a1917",
            }}
          >
            Buyout
          </div>
          {DURATIONS.map(({ key, label }) => (
            <React.Fragment key={key}>
              <div
                style={{
                  padding: "12px",
                  background: "#faf9f7",
                  fontSize: "14px",
                  color: "#1a1917",
                }}
              >
                {label}
              </div>
              <div style={{ padding: "8px", background: "#faf9f7" }}>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "4px" }}
                >
                  <span style={{ fontSize: "14px", color: "#6b6966" }}>₹</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={String(rates[key] ?? "")}
                    onChange={(e) => handleChange(key, e.target.value)}
                    placeholder="0"
                    style={{
                      flex: 1,
                      minWidth: 0,
                      padding: "8px 10px",
                      border: "1px solid #e8e6e2",
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  />
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
