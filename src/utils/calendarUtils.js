// ─────────────────────────────────────────────────────────────
// calendarUtils.js
// Constants · pure date helpers · useBookings hook
// Everything calendar-related that isn't a React component.
// ─────────────────────────────────────────────────────────────

import { useState, useCallback } from "react";

// ── Constants ──────────────────────────────────────────────────

export const MONTH_ABBR = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
export const MONTH_FULL = ["January","February","March","April","May","June","July","August","September","October","November","December"];
export const DAY_LABELS = ["M","T","W","T","F","S","S"]; // Mon-first

/** Booking history starts from this year */
export const CALENDAR_START_YEAR = 2026;

// ── Pure date helpers ──────────────────────────────────────────

/** Days in a given month — handles leap years automatically. */
export function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Mon-based offset for the 1st of a month.
 * 0 = Monday … 6 = Sunday
 */
export function getStartOffset(year, month) {
  const day = new Date(year, month, 1).getDay(); // JS: 0 = Sun
  return day === 0 ? 6 : day - 1;
}

/** Canonical date key used to identify booked dates: "YYYY-MM-DD" */
export function toDateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Total days in a year, accounting for leap years. */
export function getDaysInYear(year) {
  return new Date(year, 1, 29).getDate() === 29 ? 366 : 365;
}

/**
 * Years available in the selector.
 * — Before 2026: returns [currentYear]
 * — From 2026 onward: returns [2026 … currentYear]
 */
export function getAvailableYears() {
  const current = new Date().getFullYear();
  if (current < CALENDAR_START_YEAR) return [current];
  return Array.from({ length: current - CALENDAR_START_YEAR + 1 }, (_, i) => CALENDAR_START_YEAR + i);
}

/** Time-of-day greeting. */
export function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

// ── useBookings hook ───────────────────────────────────────────

const STORAGE_KEY = "pipeflow_bookings_v1";

function loadBookings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function persistBookings(set) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  } catch { /* quota / private mode — fail silently */ }
}

/**
 * Manages booked-date state with localStorage persistence.
 *
 * @returns {{
 *   bookedDates:  Set<string>,
 *   toggleDate:   (key: string) => void,
 *   countForYear: (year: number) => number,
 * }}
 */
export function useBookings() {
  const [bookedDates, setBookedDates] = useState(loadBookings);

  const toggleDate = useCallback((key) => {
    setBookedDates((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      persistBookings(next);
      return next;
    });
  }, []);

  const countForYear = useCallback(
    (year) => [...bookedDates].filter((d) => d.startsWith(`${year}-`)).length,
    [bookedDates]
  );

  return { bookedDates, toggleDate, countForYear };
}