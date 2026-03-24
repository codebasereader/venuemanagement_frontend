import React from "react";
import ProfitLossSummaryCard from "./ProfitLossSummaryCard.jsx";

export default function ProfitLossQuoteCard({
  index,
  quoteTotal,
  outflowPaid,
  labourCost,
  inflowReceived,
  net,
}) {
  return (
    <ProfitLossSummaryCard
      title={`Quote ${index + 1}`}
      quoteTotal={quoteTotal}
      outflowPaid={outflowPaid}
      labourCost={labourCost}
      inflowReceived={inflowReceived}
      net={net}
    />
  );
}
