export const NUMBER_FIELDS = [
  "length", "chest", "waist", "hip", "shoulder", "slLength", "armhole", "biceps",
  "neck", "thighs", "knees", "bottom", "fc", "bc", "hw", "lw",
] as const;
export const TEXT_FIELDS = ["size", "fabricNo", "pocket", "comment"] as const;

export type NumberField = (typeof NUMBER_FIELDS)[number];
export type TextField = (typeof TEXT_FIELDS)[number];
export type MeasurementField = NumberField | TextField;
export type MeasurementData = { [K in NumberField]?: number | null } & { [K in TextField]?: string | null };

type FieldDef = { key: Exclude<MeasurementField, "comment">; label: string };

const f = (key: FieldDef["key"], label: string): FieldDef => ({ key, label });

const TOP_WEAR_FIELDS = [
  f("size", "Size"), f("length", "Length"), f("chest", "Chest"), f("waist", "Waist"),
  f("hip", "Hip"), f("shoulder", "Shoulder"), f("slLength", "Sl. Length"), f("armhole", "Armhole"),
  f("biceps", "Biceps"), f("neck", "Neck"), f("fabricNo", "Fabric No."),
] as const;

const WAISTCOAT_FIELDS = [
  f("size", "Size"), f("length", "Length"), f("chest", "Chest"), f("waist", "Waist"),
  f("hip", "Hip"), f("shoulder", "Shoulder"), f("neck", "Neck"), f("fabricNo", "Fabric No."),
] as const;

export const GARMENTS = [
  {
    key: "blazer",
    relation: "blazerM",
    title: "Blazer",
    fields: TOP_WEAR_FIELDS,
  },
  {
    key: "waistcoat",
    relation: "waistcoatM",
    title: "Waistcoat",
    fields: WAISTCOAT_FIELDS,
  },
  {
    key: "trouser",
    relation: "trouserM",
    title: "Trousers",
    fields: [
      f("size", "Size"), f("length", "Length"), f("waist", "Waist"), f("hip", "Hip"),
      f("thighs", "Thighs"), f("knees", "Knees"), f("bottom", "Bottom"), f("fc", "F.C"),
      f("bc", "B.C"), f("hw", "H.W"), f("lw", "L.W"),
    ],
  },
  {
    key: "shirt",
    relation: "shirtM",
    title: "Shirt",
    fields: [
      ...TOP_WEAR_FIELDS.filter((field) => field.key !== "fabricNo"),
      f("pocket", "Pocket"),
    ],
  },
] as const;

export type Garment = (typeof GARMENTS)[number];
export type GarmentRelation = Garment["relation"];

export function isTextField(key: MeasurementField): key is TextField {
  return (TEXT_FIELDS as readonly string[]).includes(key);
}

const ALPHA_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const TROUSER_SIZES = ["28", "30", "32", "34", "36", "38", "40"];

export const SIZE_OPTIONS: Record<Garment["key"], string[]> = {
  blazer: ALPHA_SIZES,
  waistcoat: ALPHA_SIZES,
  trouser: TROUSER_SIZES,
  shirt: ALPHA_SIZES,
};

export const PRODUCTS = ["Blazer", "Trousers", "Shirt", "Waistcoat", "Tie/Bow"];
