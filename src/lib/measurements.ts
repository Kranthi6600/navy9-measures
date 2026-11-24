export const MEASUREMENT_GROUPS = [
  {
    title: "Upper body",
    fields: [
      { key: "neck", label: "Neck" },
      { key: "chest", label: "Chest" },
      { key: "waist", label: "Waist" },
      { key: "hip", label: "Hip" },
      { key: "shoulder", label: "Shoulder" },
      { key: "sleeveLength", label: "Sleeve length" },
      { key: "armhole", label: "Armhole" },
      { key: "bicep", label: "Bicep" },
      { key: "wrist", label: "Wrist" },
      { key: "shirtLength", label: "Shirt length" },
      { key: "coatLength", label: "Coat length" },
    ],
  },
  {
    title: "Lower body",
    fields: [
      { key: "trouserWaist", label: "Trouser waist" },
      { key: "seat", label: "Seat" },
      { key: "thigh", label: "Thigh" },
      { key: "knee", label: "Knee" },
      { key: "calf", label: "Calf" },
      { key: "bottom", label: "Bottom (hem)" },
      { key: "inseam", label: "Inseam" },
      { key: "trouserLength", label: "Trouser length" },
      { key: "rise", label: "Rise" },
    ],
  },
] as const;

export type MeasurementKey =
  (typeof MEASUREMENT_GROUPS)[number]["fields"][number]["key"];

export const MEASUREMENT_KEYS: MeasurementKey[] = MEASUREMENT_GROUPS.flatMap(
  (g) => g.fields.map((f) => f.key),
);

export type MeasurementValues = Partial<Record<MeasurementKey, number | null>>;
