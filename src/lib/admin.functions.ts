import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// Admin panel parol — front + serverda tekshiriladi
const ADMIN_PASSWORD = "123654999";

const GuardSchema = z.object({ password: z.string().min(1).max(64) });

function guard(password: string) {
  if (password !== ADMIN_PASSWORD) {
    throw new Error("Noto'g'ri admin parol");
  }
}

async function uploadBase64ToMedia(fileName: string, contentType: string, base64: string) {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-120) || "image.jpg";
  const path = `admin/${Date.now()}-${safeName}`;
  const { error } = await supabaseAdmin.storage
    .from("media")
    .upload(path, Buffer.from(base64, "base64"), { contentType, upsert: false });
  if (error) throw new Error(error.message);
  return supabaseAdmin.storage.from("media").getPublicUrl(path).data.publicUrl;
}

const IdSchema = z.object({ password: z.string().min(1).max(64), id: z.string().uuid() });
const UploadSchema = z.object({
  password: z.string().min(1).max(64),
  file_name: z.string().min(1).max(180),
  content_type: z.string().min(1).max(80),
  base64: z.string().min(1),
});

export const adminUploadMedia = createServerFn({ method: "POST" })
  .inputValidator((i) => UploadSchema.parse(i))
  .handler(async ({ data }) => {
    guard(data.password);
    return { url: await uploadBase64ToMedia(data.file_name, data.content_type, data.base64) };
  });

const NewsSchema = z.object({
  password: z.string().min(1).max(64),
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(180),
  body: z.string().max(5000).nullable().optional(),
  image_url: z.string().max(1000).nullable().optional(),
});

export const adminListNews = createServerFn({ method: "POST" })
  .inputValidator((i) => GuardSchema.parse(i))
  .handler(async ({ data }) => {
    guard(data.password);
    const { data: rows, error } = await supabaseAdmin.from("news").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const adminSaveNews = createServerFn({ method: "POST" })
  .inputValidator((i) => NewsSchema.parse(i))
  .handler(async ({ data }) => {
    guard(data.password);
    const payload = { title: data.title, body: data.body ?? null, image_url: data.image_url || null };
    const query = data.id ? supabaseAdmin.from("news").update(payload).eq("id", data.id) : supabaseAdmin.from("news").insert(payload);
    const { error } = await query;
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteNews = createServerFn({ method: "POST" })
  .inputValidator((i) => IdSchema.parse(i))
  .handler(async ({ data }) => {
    guard(data.password);
    const { error } = await supabaseAdmin.from("news").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const MedicineSchema = z.object({
  password: z.string().min(1).max(64),
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(180),
  description: z.string().max(5000).nullable().optional(),
  image_url: z.string().max(1000).nullable().optional(),
  price: z.number().min(0),
  unit: z.string().min(1).max(80),
  stock: z.number().int().min(0),
});

export const adminListMedicines = createServerFn({ method: "POST" })
  .inputValidator((i) => GuardSchema.parse(i))
  .handler(async ({ data }) => {
    guard(data.password);
    const { data: rows, error } = await supabaseAdmin.from("medicines").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const adminSaveMedicine = createServerFn({ method: "POST" })
  .inputValidator((i) => MedicineSchema.parse(i))
  .handler(async ({ data }) => {
    guard(data.password);
    const payload = { name: data.name, description: data.description ?? null, image_url: data.image_url || null, price: data.price, unit: data.unit, stock: data.stock };
    const query = data.id ? supabaseAdmin.from("medicines").update(payload).eq("id", data.id) : supabaseAdmin.from("medicines").insert(payload);
    const { error } = await query;
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteMedicine = createServerFn({ method: "POST" })
  .inputValidator((i) => IdSchema.parse(i))
  .handler(async ({ data }) => {
    guard(data.password);
    const { error } = await supabaseAdmin.from("medicines").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const BranchSchema = z.object({
  password: z.string().min(1).max(64),
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(180),
  image_url: z.string().max(1000).nullable().optional(),
  phone: z.string().max(40).nullable().optional(),
  address: z.string().max(500).nullable().optional(),
  map_url: z.string().max(1500).nullable().optional(),
});

export const adminListBranches = createServerFn({ method: "POST" })
  .inputValidator((i) => GuardSchema.parse(i))
  .handler(async ({ data }) => {
    guard(data.password);
    const { data: rows, error } = await supabaseAdmin.from("branches").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const adminSaveBranch = createServerFn({ method: "POST" })
  .inputValidator((i) => BranchSchema.parse(i))
  .handler(async ({ data }) => {
    guard(data.password);
    const payload = { name: data.name, image_url: data.image_url || null, phone: data.phone ?? null, address: data.address ?? null, map_url: data.map_url ?? null };
    const query = data.id ? supabaseAdmin.from("branches").update(payload).eq("id", data.id) : supabaseAdmin.from("branches").insert(payload);
    const { error } = await query;
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteBranch = createServerFn({ method: "POST" })
  .inputValidator((i) => IdSchema.parse(i))
  .handler(async ({ data }) => {
    guard(data.password);
    const { error } = await supabaseAdmin.from("branches").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const OrderStatusSchema = z.object({
  password: z.string().min(1).max(64),
  id: z.string().uuid(),
  status: z.enum(["pending", "confirmed", "delivering", "delivered", "cancelled"]),
});

export const adminListOrders = createServerFn({ method: "POST" })
  .inputValidator((i) => GuardSchema.parse(i))
  .handler(async ({ data }) => {
    guard(data.password);
    const { data: rows, error } = await supabaseAdmin.from("orders").select("*, order_items(*)").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const adminSetOrderStatus = createServerFn({ method: "POST" })
  .inputValidator((i) => OrderStatusSchema.parse(i))
  .handler(async ({ data }) => {
    guard(data.password);
    const { error } = await supabaseAdmin.from("orders").update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminListUsers = createServerFn({ method: "POST" })
  .inputValidator((i) => GuardSchema.parse(i))
  .handler(async ({ data }) => {
    guard(data.password);

    // 1) Auth users
    const { data: usersData, error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
    if (error) throw new Error(error.message);

    // 2) Profiles
    const { data: profiles } = await supabaseAdmin.from("profiles").select("id, full_name, phone, email");
    const pMap = new Map((profiles ?? []).map((p: any) => [p.id, p]));

    return {
      users: usersData.users.map((u) => {
        const p: any = pMap.get(u.id);
        return {
          id: u.id,
          email: u.email ?? p?.email ?? "",
          phone: p?.phone ?? u.phone ?? "",
          full_name: p?.full_name ?? "",
          created_at: u.created_at,
          last_sign_in_at: u.last_sign_in_at ?? null,
        };
      }),
    };
  });

const ResetSchema = z.object({
  password: z.string().min(1).max(64),
  user_id: z.string().uuid(),
  new_password: z.string().min(6).max(72),
});

export const adminResetPassword = createServerFn({ method: "POST" })
  .inputValidator((i) => ResetSchema.parse(i))
  .handler(async ({ data }) => {
    guard(data.password);
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.user_id, { password: data.new_password });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const UpdateUserSchema = z.object({
  password: z.string().min(1).max(64),
  user_id: z.string().uuid(),
  full_name: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().optional(),
});

export const adminUpdateUser = createServerFn({ method: "POST" })
  .inputValidator((i) => UpdateUserSchema.parse(i))
  .handler(async ({ data }) => {
    guard(data.password);
    if (data.email) {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(data.user_id, { email: data.email });
      if (error) throw new Error(error.message);
    }
    const patch: any = {};
    if (data.full_name !== undefined) patch.full_name = data.full_name;
    if (data.phone !== undefined) patch.phone = data.phone;
    if (data.email !== undefined) patch.email = data.email;
    if (Object.keys(patch).length) {
      await supabaseAdmin.from("profiles").update(patch).eq("id", data.user_id);
    }
    return { ok: true };
  });

const DeleteSchema = z.object({ password: z.string().min(1).max(64), user_id: z.string().uuid() });
export const adminDeleteUser = createServerFn({ method: "POST" })
  .inputValidator((i) => DeleteSchema.parse(i))
  .handler(async ({ data }) => {
    guard(data.password);
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.user_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
