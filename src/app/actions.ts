"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { cloudinaryConfigured, deleteImage, uploadImage } from "@/lib/cloudinary";
import { GARMENTS, isTextField, type MeasurementData } from "@/lib/measurements";
import { prisma } from "@/lib/prisma";
import type { ActionState } from "@/lib/types";

function str(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function isUniqueError(e: unknown) {
  return e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002";
}

type Parsed<T> = { data: T; error?: undefined } | { error: string; data?: undefined };

function parseNumber(raw: string, label: string, max = 100000): Parsed<number | null> {
  if (raw === "") return { data: null };
  const num = Number(raw);
  if (!Number.isFinite(num) || num < 0 || num > max) return { error: `Invalid value for ${label}` };
  return { data: num };
}

function parseDate(raw: string, label: string): Parsed<Date | null> {
  if (raw === "") return { data: null };
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return { error: `Invalid ${label}` };
  return { data: date };
}

// Customers

function normalizeMobile(value: string) {
  return value.replace(/[\s\-().]/g, "");
}

const customerSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  mobile: z
    .string()
    .transform(normalizeMobile)
    .pipe(z.string().min(1, "Mobile is required").max(20)),
  email: z.union([z.literal(""), z.email("Invalid email address")]),
});

function parseCustomer(formData: FormData) {
  const parsed = customerSchema.safeParse({
    name: str(formData, "name"),
    mobile: str(formData, "mobile"),
    email: str(formData, "email"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const dateOfBirth = parseDate(str(formData, "dateOfBirth"), "date of birth");
  if (dateOfBirth.error !== undefined) return { error: dateOfBirth.error };
  const feet = parseNumber(str(formData, "heightFeet"), "height (feet)", 9);
  if (feet.error !== undefined) return { error: feet.error };
  const inches = parseNumber(str(formData, "heightInches"), "height (inches)", 11.9);
  if (inches.error !== undefined) return { error: inches.error };
  const height = {
    data: feet.data == null && inches.data == null ? null : (feet.data ?? 0) * 12 + (inches.data ?? 0),
  };
  const weight = parseNumber(str(formData, "weight"), "weight", 500);
  if (weight.error !== undefined) return { error: weight.error };
  return {
    data: {
      name: parsed.data.name,
      mobile: parsed.data.mobile,
      email: parsed.data.email || null,
      dateOfBirth: dateOfBirth.data,
      height: height.data,
      weight: weight.data,
    },
  };
}

const DUPLICATE_MOBILE = "A customer with this mobile number already exists";

export async function createCustomer(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const result = parseCustomer(formData);
  if (!result.data) return { error: result.error };
  let id: string;
  try {
    id = (await prisma.customer.create({ data: result.data })).id;
  } catch (e) {
    if (isUniqueError(e)) return { error: DUPLICATE_MOBILE };
    throw e;
  }
  revalidatePath("/customers");
  redirect(`/customers/${id}`);
}

export async function updateCustomer(id: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const result = parseCustomer(formData);
  if (!result.data) return { error: result.error };
  try {
    await prisma.customer.update({ where: { id }, data: result.data });
  } catch (e) {
    if (isUniqueError(e)) return { error: DUPLICATE_MOBILE };
    throw e;
  }
  revalidatePath("/customers");
  revalidatePath(`/customers/${id}`);
  redirect(`/customers/${id}`);
}

export async function deleteCustomer(id: string) {
  await requireAdmin();
  const customer = await prisma.customer.delete({ where: { id } });
  if (customer.photoPublicId) await deleteImage(customer.photoPublicId).catch(console.error);
  revalidatePath("/customers");
  revalidatePath("/orders");
  redirect("/customers");
}

const MAX_PHOTO_BYTES = 10 * 1024 * 1024;

export async function uploadCustomerPhoto(
  customerId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  if (!cloudinaryConfigured) return { error: "Cloudinary is not configured" };
  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) return { error: "Choose a photo to upload" };
  if (!file.type.startsWith("image/")) return { error: "File must be an image" };
  if (file.size > MAX_PHOTO_BYTES) return { error: "Photo must be under 10 MB" };
  const existing = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!existing) return { error: "Customer not found" };
  try {
    const { url, publicId } = await uploadImage(file, "navy9-measures/customers");
    await prisma.customer.update({
      where: { id: customerId },
      data: { photoUrl: url, photoPublicId: publicId },
    });
  } catch (e) {
    console.error(e);
    return { error: "Upload failed. Check Cloudinary settings." };
  }
  if (existing.photoPublicId) await deleteImage(existing.photoPublicId).catch(console.error);
  revalidatePath(`/customers/${customerId}`);
  return { success: "Photo saved" };
}

export async function removeCustomerPhoto(customerId: string) {
  await requireAdmin();
  const existing = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!existing) return;
  await prisma.customer.update({
    where: { id: customerId },
    data: { photoUrl: null, photoPublicId: null },
  });
  if (existing.photoPublicId) await deleteImage(existing.photoPublicId).catch(console.error);
  revalidatePath(`/customers/${customerId}`);
}

// Orders

type ItemInput = { product: string; rate: number; quantity: number; amount: number };

function parseItems(formData: FormData): Parsed<ItemInput[]> {
  const products = formData.getAll("item.product").map((v) => String(v).trim());
  const rates = formData.getAll("item.rate").map((v) => String(v).trim());
  const quantities = formData.getAll("item.quantity").map((v) => String(v).trim());
  const items: ItemInput[] = [];
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    if (!product) continue;
    const rate = Number(rates[i] || 0);
    const quantity = Number(quantities[i] || 1);
    if (!Number.isFinite(rate) || rate < 0) return { error: `Invalid rate for ${product}` };
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 1000) {
      return { error: `Invalid quantity for ${product}` };
    }
    items.push({ product: product.slice(0, 100), rate, quantity, amount: Math.round(rate * quantity * 100) / 100 });
  }
  return { data: items };
}

type MeasurementsInput = Record<(typeof GARMENTS)[number]["relation"], MeasurementData | null>;

function parseMeasurements(formData: FormData): Parsed<MeasurementsInput> {
  const result = {} as MeasurementsInput;
  for (const garment of GARMENTS) {
    const data: MeasurementData = {};
    let filled = false;
    for (const field of [...garment.fields.map((f) => f.key), "comment" as const]) {
      const raw = str(formData, `${garment.key}.${field}`);
      if (isTextField(field)) {
        data[field] = raw ? raw.slice(0, field === "comment" ? 2000 : 100) : null;
      } else {
        const num = parseNumber(raw, `${garment.title} ${field}`, 1000);
        if (num.error !== undefined) return { error: num.error };
        data[field] = num.data;
      }
      if (data[field] != null) filled = true;
    }
    result[garment.relation] = filled ? data : null;
  }
  return { data: result };
}

function parseOrder(formData: FormData) {
  const orderNumber = str(formData, "orderNumber");
  if (!orderNumber) return { error: "Order number is required" };
  if (orderNumber.length > 30) return { error: "Order number is too long" };
  const entryDate = parseDate(str(formData, "entryDate"), "entry date");
  if (entryDate.error !== undefined) return { error: entryDate.error };
  const items = parseItems(formData);
  if (items.error !== undefined) return { error: items.error };
  const total = parseNumber(str(formData, "totalAmount"), "total amount", 100_000_000);
  if (total.error !== undefined) return { error: total.error };
  const advance = parseNumber(str(formData, "advanceAmount"), "advance amount", 100_000_000);
  if (advance.error !== undefined) return { error: advance.error };
  const measurements = parseMeasurements(formData);
  if (measurements.error !== undefined) return { error: measurements.error };

  const itemsTotal = items.data.reduce((sum, i) => sum + i.amount, 0);
  const totalAmount = total.data ?? (items.data.length ? itemsTotal : null);
  const advanceAmount = advance.data;
  const balanceAmount = totalAmount != null ? Math.round((totalAmount - (advanceAmount ?? 0)) * 100) / 100 : null;

  return {
    data: {
      order: {
        orderNumber,
        entryDate: entryDate.data ?? new Date(),
        totalAmount,
        advanceAmount,
        balanceAmount,
      },
      items: items.data,
      measurements: measurements.data,
    },
  };
}

function nestedMeasurement(data: MeasurementData | null, exists: boolean) {
  if (data) return exists ? { upsert: { create: data, update: data } } : { create: data };
  return exists ? { delete: true } : undefined;
}

const DUPLICATE_ORDER = "Order number is already in use";

export async function createOrder(customerId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const result = parseOrder(formData);
  if (!result.data) return { error: result.error };
  const { order, items, measurements } = result.data;
  let id: string;
  try {
    const created = await prisma.order.create({
      data: {
        ...order,
        customer: { connect: { id: customerId } },
        items: { create: items },
        blazerM: nestedMeasurement(measurements.blazerM, false),
        trouserM: nestedMeasurement(measurements.trouserM, false),
        shirtM: nestedMeasurement(measurements.shirtM, false),
      },
    });
    id = created.id;
  } catch (e) {
    if (isUniqueError(e)) return { error: DUPLICATE_ORDER };
    throw e;
  }
  revalidatePath("/orders");
  revalidatePath(`/customers/${customerId}`);
  redirect(`/orders/${id}`);
}

export async function updateOrder(orderId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const result = parseOrder(formData);
  if (!result.data) return { error: result.error };
  const { order, items, measurements } = result.data;
  const existing = await prisma.order.findUnique({
    where: { id: orderId },
    include: { blazerM: true, trouserM: true, shirtM: true },
  });
  if (!existing) return { error: "Order not found" };
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: {
        ...order,
        items: { deleteMany: {}, create: items },
        blazerM: nestedMeasurement(measurements.blazerM, !!existing.blazerM),
        trouserM: nestedMeasurement(measurements.trouserM, !!existing.trouserM),
        shirtM: nestedMeasurement(measurements.shirtM, !!existing.shirtM),
      },
    });
  } catch (e) {
    if (isUniqueError(e)) return { error: DUPLICATE_ORDER };
    throw e;
  }
  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);
  revalidatePath(`/customers/${existing.customerId}`);
  redirect(`/orders/${orderId}`);
}

export async function deleteOrder(orderId: string) {
  await requireAdmin();
  const order = await prisma.order.delete({ where: { id: orderId } });
  revalidatePath("/orders");
  revalidatePath(`/customers/${order.customerId}`);
  redirect(`/customers/${order.customerId}`);
}
