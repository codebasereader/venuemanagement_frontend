import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { listQuotesByLead } from "../../api/quote.js";
import { listCommissions } from "../../api/commissions.js";
import { listLabours } from "../../api/labours.js";
import ProfitLossSummaryCard from "./ProfitLossSummaryCard.jsx";
import ProfitLossQuoteCard from "./ProfitLossQuoteCard.jsx";
import { asNumber, calcNetProfitLoss, sumBy } from "./profitLossMath.js";

function EmptyCard({ text }) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: 16,
        border: "1px dashed #e8e6e2",
        padding: 18,
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 13,
        color: "#6b6966",
      }}
    >
      {text}
    </div>
  );
}

export default function LeadProfitLossTab({ lead }) {
  const { access_token: token, venueId: reduxVenueId } = useSelector((state) => state.user.value);
  const venueId = reduxVenueId || lead?.venueId;
  const leadId = lead?._id;

  const [quotes, setQuotes] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [labours, setLabours] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadAll = useCallback(async () => {
    if (!venueId || !leadId || !token) return;
    setLoading(true);
    setError("");
    try {
      const [quotesRes, commissionsRes, laboursRes] = await Promise.all([
        listQuotesByLead(venueId, leadId, token, { confirmed: true }),
        listCommissions(venueId, leadId, token),
        listLabours(venueId, leadId, token),
      ]);
      setQuotes(Array.isArray(quotesRes) ? quotesRes : []);
      setCommissions(Array.isArray(commissionsRes) ? commissionsRes : []);
      setLabours(Array.isArray(laboursRes) ? laboursRes : []);
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message || "Failed to load profit/loss data.");
      setQuotes([]);
      setCommissions([]);
      setLabours([]);
    } finally {
      setLoading(false);
    }
  }, [venueId, leadId, token]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const outflowCommissions = useMemo(
    () => commissions.filter((c) => c?.direction === "outflow"),
    [commissions],
  );
  const inflowCommissions = useMemo(
    () => commissions.filter((c) => c?.direction === "inflow"),
    [commissions],
  );

  const quoteCount = quotes.length;

  const quoteCards = useMemo(() => {
    return quotes.map((q) => {
      const quoteId = q?._id;
      const quoteTotal = asNumber(q?.pricing?.totals?.total);
      const includeUnlinked = quoteCount === 1;

      const inflowReceived = sumBy(
        inflowCommissions.filter(
          (c) => c?.quoteId === quoteId || (includeUnlinked && !c?.quoteId),
        ),
        (c) => c?.amount,
      );

      const outflowPaid = sumBy(
        outflowCommissions.filter(
          (c) => c?.quoteId === quoteId || (includeUnlinked && !c?.quoteId),
        ),
        (c) => c?.amount,
      );

      const labourCost = sumBy(
        labours.filter((l) => l?.quoteId === quoteId || (includeUnlinked && !l?.quoteId)),
        (l) => l?.amount,
      );

      const net = calcNetProfitLoss({
        quoteTotal,
        outflowPaid,
        labourCost,
        inflowReceived,
      });

      return { quoteId, quoteTotal, outflowPaid, labourCost, inflowReceived, net };
    });
  }, [quotes, quoteCount, inflowCommissions, outflowCommissions, labours]);

  const totals = useMemo(() => {
    const quoteTotal = sumBy(quotes, (q) => q?.pricing?.totals?.total);
    const outflowPaid = sumBy(outflowCommissions, (c) => c?.amount);
    const labourCost = sumBy(labours, (l) => l?.amount);
    const inflowReceived = sumBy(inflowCommissions, (c) => c?.amount);
    const net = calcNetProfitLoss({ quoteTotal, outflowPaid, labourCost, inflowReceived });
    return { quoteTotal, outflowPaid, labourCost, inflowReceived, net };
  }, [quotes, outflowCommissions, inflowCommissions, labours]);

  if (!venueId || !leadId || !token) {
    return <EmptyCard text="Missing venue assignment or auth token." />;
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {!!error && (
        <div
          style={{
            padding: "12px 14px",
            borderRadius: 12,
            background: "#fde8e6",
            border: "1px solid #f6c8c2",
            color: "#a33b2d",
            fontSize: 13,
            fontWeight: 800,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {error}
        </div>
      )}

      {loading && (
        <div
          style={{
            padding: 24,
            textAlign: "center",
            color: "#6b6966",
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 700,
          }}
        >
          Loading profit/loss…
        </div>
      )}

      {!loading && quotes.length === 0 && (
        <EmptyCard text="No confirmed quotes yet. Confirm at least one quote to view profit/loss." />
      )}

      {!loading && quotes.length > 0 && (
        <>
          {quoteCards.map((card, idx) => (
            <ProfitLossQuoteCard
              key={card.quoteId || idx}
              index={idx}
              quoteTotal={card.quoteTotal}
              outflowPaid={card.outflowPaid}
              labourCost={card.labourCost}
              inflowReceived={card.inflowReceived}
              net={card.net}
            />
          ))}
          <ProfitLossSummaryCard
            title="Overall (All confirmed quotes)"
            quoteTotal={totals.quoteTotal}
            outflowPaid={totals.outflowPaid}
            labourCost={totals.labourCost}
            inflowReceived={totals.inflowReceived}
            net={totals.net}
          />
        </>
      )}
    </div>
  );
}
