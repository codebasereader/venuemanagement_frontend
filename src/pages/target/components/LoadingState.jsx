import React from "react";
import { SpinnerIcon } from "./TargetIcons";
import { FONT } from "../utils/targetStyles";

/**
 * Full-area centered loading state for the content card.
 */
export default function LoadingState({ text = "Loading…" }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "64px 20px",
        gap: 12,
        color: "#9a9896",
        fontFamily: FONT,
        fontSize: 14,
      }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <SpinnerIcon size={28} />
      {text}
    </div>
  );
}
