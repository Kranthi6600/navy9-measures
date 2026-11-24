// Calendar dates (entryDate, dateOfBirth) are stored at midnight UTC.
export const dateFmt = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeZone: "UTC" });

const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });

export function formatMoney(value: number | null | undefined) {
  return value == null ? "—" : money.format(value);
}

export function toDateInput(value: Date | null | undefined) {
  return value ? value.toISOString().slice(0, 10) : undefined;
}
