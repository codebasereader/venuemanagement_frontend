export const NAME_PREFIXES = [
  { value: "MR", label: "Mr." },
  { value: "MRS", label: "Mrs." },
  { value: "MISS", label: "Miss" },
  { value: "MASTER", label: "Master" },
];

export function getEntityId(entity) {
  if (!entity) return "";
  return String(entity.id ?? entity._id ?? "");
}

export function normalizeVenue(venue) {
  if (!venue || typeof venue !== "object") return null;
  const id = getEntityId(venue);
  if (!id) return null;
  return {
    id,
    name: venue.name ?? "",
    address: venue.address ?? "",
  };
}

export function normalizeDatabaseCategory(category) {
  if (!category || typeof category !== "object") {
    return { id: "", name: "" };
  }
  return {
    id: getEntityId(category),
    name: category.name ?? "",
  };
}

export function normalizeDatabaseVenueEntry(entry) {
  if (!entry || typeof entry !== "object") {
    return {
      id: "",
      venueId: "",
      venueName: "",
      venueAddress: "",
      prefix: NAME_PREFIXES[0].value,
      name: "",
      contactNumber1: "",
      contactNumber2: "",
      email: "",
      address: "",
      companyName: "",
      departmentName: "",
      designation: "",
      referredBy: "",
    };
  }

  return {
    id: getEntityId(entry),
    venueId: entry.venueId ?? "",
    venueName: entry.venueName ?? "",
    venueAddress: entry.venueAddress ?? "",
    prefix: entry.prefix || NAME_PREFIXES[0].value,
    name: entry.name ?? "",
    contactNumber1: entry.contactNumber1 ?? "",
    contactNumber2: entry.contactNumber2 ?? "",
    email: entry.email ?? "",
    address: entry.address ?? "",
    companyName: entry.companyName ?? "",
    departmentName: entry.departmentName ?? "",
    designation: entry.designation ?? "",
    referredBy: entry.referredBy ?? "",
  };
}

export function normalizeDatabaseEntry(entry) {
  if (!entry || typeof entry !== "object") {
    return {
      id: "",
      categoryId: "",
      categoryName: "",
      prefix: NAME_PREFIXES[0].value,
      name: "",
      contactNumber1: "",
      contactNumber2: "",
      email: "",
      address: "",
      companyName: "",
      departmentName: "",
      designation: "",
      referredBy: "",
    };
  }

  return {
    id: getEntityId(entry),
    categoryId: entry.categoryId ?? "",
    categoryName: entry.categoryName ?? "",
    prefix: entry.prefix || NAME_PREFIXES[0].value,
    name: entry.name ?? "",
    contactNumber1: entry.contactNumber1 ?? "",
    contactNumber2: entry.contactNumber2 ?? "",
    email: entry.email ?? "",
    address: entry.address ?? "",
    companyName: entry.companyName ?? "",
    departmentName: entry.departmentName ?? "",
    designation: entry.designation ?? "",
    referredBy: entry.referredBy ?? "",
  };
}

export function formatDatabaseFullName(entry) {
  const normalized = normalizeDatabaseEntry(entry);
  const prefix = normalized.prefix ? `${normalized.prefix} ` : "";
  return `${prefix}${normalized.name}`.trim() || "—";
}

function trimOrNull(value) {
  const trimmed = String(value ?? "").trim();
  return trimmed || null;
}

export function buildDatabaseVenuePayload(form) {
  return {
    venueId: form.venueId,
    prefix: form.prefix,
    name: form.name.trim(),
    contactNumber1: form.contactNumber1.trim(),
    contactNumber2: trimOrNull(form.contactNumber2),
    email: trimOrNull(form.email),
    address: trimOrNull(form.address),
    companyName: trimOrNull(form.companyName),
    departmentName: trimOrNull(form.departmentName),
    designation: trimOrNull(form.designation),
    referredBy: trimOrNull(form.referredBy),
  };
}

export function buildDatabaseEntryPayload(form) {
  return {
    venueId: form.venueId,
    categoryId: form.categoryId,
    prefix: form.prefix,
    name: form.name.trim(),
    contactNumber1: form.contactNumber1.trim(),
    contactNumber2: trimOrNull(form.contactNumber2),
    email: trimOrNull(form.email),
    address: trimOrNull(form.address),
    companyName: trimOrNull(form.companyName),
    departmentName: trimOrNull(form.departmentName),
    designation: trimOrNull(form.designation),
    referredBy: trimOrNull(form.referredBy),
  };
}
