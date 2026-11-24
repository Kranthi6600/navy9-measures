"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { cloudinaryConfigured, deleteImage, uploadImage } from "@/lib/cloudinary";
import { MEASUREMENT_KEYS, type MeasurementKey } from "@/lib/measurements";
import { prisma } from "@/lib/prisma";
import type { ActionState } from "@/lib/types";

const customerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  phone: z.string().trim().max(30),
  email: z.union([z.literal(""), z.email("Invalid email address")]),
  address: z.string().trim().max(500),
  notes: z.string().trim().max(2000),
});

function str(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function parseCustomer(formData: FormData) {
  const parsed = customerSchema.safeParse({
    name: str(formData, "name"),
    phone: str(formData, "phone"),
    email: str(formData, "email"),
    address: str(formData, "address"),
    notes: str(formData, "notes"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message } as const;
  const { name, phone, email, address, notes } = parsed.data;
  return {
    data: {
      name,
      phone: phone || null,
      email: email || null,
      address: address || null,
      notes: notes || null,
    },
  } as const;
}

export async function createCustomer(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const result = parseCustomer(formData);
  if ("error" in result) return { error: result.error };
  const customer = await prisma.customer.create({ data: result.data });
  revalidatePath("/customers");
  redirect(`/customers/${customer.id}`);
}

export async function updateCustomer(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const result = parseCustomer(formData);
  if ("error" in result) return { error: result.error };
  await prisma.customer.update({ where: { id }, data: result.data });
  revalidatePath("/customers");
  revalidatePath(`/customers/${id}`);
  redirect(`/customers/${id}`);
}

export async function deleteCustomer(id: string) {
  await requireAdmin();
  const photos = await prisma.photo.findMany({ where: { customerId: id } });
  await Promise.allSettled(photos.map((p) => deleteImage(p.publicId)));
  await prisma.customer.delete({ where: { id } });
  revalidatePath("/customers");
  redirect("/customers");
}

function parseMeasurement(formData: FormData) {
  const values = {} as Record<MeasurementKey, number | null>;
  for (const key of MEASUREMENT_KEYS) {
    const raw = str(formData, key);
    if (raw === "") {
      values[key] = null;
      continue;
    }
    const num = Number(raw);
    if (!Number.isFinite(num) || num < 0 || num > 1000) {
      return { error: `Invalid value for ${key}` } as const;
    }
    values[key] = num;
  }
  const unit = str(formData, "unit") === "CM" ? "CM" : "IN";
  const takenAtRaw = str(formData, "takenAt");
  const takenAt = takenAtRaw ? new Date(takenAtRaw) : new Date();
  if (Number.isNaN(takenAt.getTime())) return { error: "Invalid date" } as const;
  const notes = str(formData, "notes") || null;
  return { data: { ...values, unit, takenAt, notes } } as const;
}

export async function saveMeasurement(
  customerId: string,
  measurementId: string | null,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const result = parseMeasurement(formData);
  if ("error" in result) return { error: result.error };
  if (measurementId) {
    await prisma.measurement.update({
      where: { id: measurementId, customerId },
      data: result.data,
    });
  } else {
    await prisma.measurement.create({ data: { ...result.data, customerId } });
  }
  revalidatePath(`/customers/${customerId}`);
  redirect(`/customers/${customerId}`);
}

export async function deleteMeasurement(customerId: string, measurementId: string) {
  await requireAdmin();
  await prisma.measurement.delete({ where: { id: measurementId, customerId } });
  revalidatePath(`/customers/${customerId}`);
}

const MAX_PHOTO_BYTES = 10 * 1024 * 1024;

export async function uploadPhoto(
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
  try {
    const { url, publicId } = await uploadImage(file, `navy9-measures/${customerId}`);
    await prisma.photo.create({
      data: { customerId, url, publicId, caption: str(formData, "caption") || null },
    });
  } catch (e) {
    console.error(e);
    return { error: "Upload failed. Check Cloudinary settings." };
  }
  revalidatePath(`/customers/${customerId}`);
  return { success: "Photo uploaded" };
}

export async function deletePhoto(customerId: string, photoId: string) {
  await requireAdmin();
  const photo = await prisma.photo.delete({ where: { id: photoId, customerId } });
  await deleteImage(photo.publicId).catch(console.error);
  revalidatePath(`/customers/${customerId}`);
}
