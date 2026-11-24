// Calendar dates (entryDate, dateOfBirth) are stored at midnight UTC.
export const dateFmt = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeZone: "UTC" });

const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });

export function formatMoney(value: number | null | undefined) {
  return value == null ? "—" : money.format(value);
}

export function splitHeight(inches: number | null | undefined) {
  if (inches == null) return null;
  const rounded = Math.round(inches * 10) / 10;
  const feet = Math.floor(rounded / 12);
  return { feet, inches: Math.round((rounded - feet * 12) * 10) / 10 };
}

export function formatHeight(inches: number | null | undefined) {
  const h = splitHeight(inches);
  return h ? `${h.feet}′ ${h.inches}″` : null;
}

export function toDateInput(value: Date | null | undefined) {
  return value ? value.toISOString().slice(0, 10) : undefined;
}
