import { createServerFn } from "@tanstack/react-start";
import { Buffer } from "buffer";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error("Auth check failed");
  if (!data) throw new Error("Forbidden: admin role required");
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

const IdSchema = z.object({ id: z.string().uuid() });
const EmptySchema = z.object({}).optional();
const UploadSchema = z.object({
  file_name: z.string().min(1).max(180),
  content_type: z.string().min(1).max(80),
  base64: z.string().min(1),
});

export const adminUploadMedia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => UploadSchema.parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    return { url: await uploadBase64ToMedia(data.file_name, data.content_type, data.base64) };
  });

const NewsSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(180),
  body: z.string().max(5000).nullable().optional(),
  image_url: z.string().max(1000).nullable().optional(),
});

export const adminListNews = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => (i ?? {}))
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { data: rows, error } = await supabaseAdmin.from("news").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const adminSaveNews = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => NewsSchema.parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const payload = { title: data.title, body: data.body ?? null, image_url: data.image_url || null };
    const query = data.id ? supabaseAdmin.from("news").update(payload).eq("id", data.id) : supabaseAdmin.from("news").insert(payload);
    const { error } = await query;
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteNews = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => IdSchema.parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin.from("news").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const MedicineSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(180),
  name_cyrl: z.string().max(180).nullable().optional(),
  description: z.string().max(5000).nullable().optional(),
  image_url: z.string().max(1000).nullable().optional(),
  price: z.number().min(0),
  unit: z.string().min(1).max(80),
  stock: z.number().int().min(0),
});

export const adminListMedicines = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => (i ?? {}))
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { data: rows, error } = await supabaseAdmin.from("medicines").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const adminSaveMedicine = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => MedicineSchema.parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const payload = { name: data.name, name_cyrl: data.name_cyrl || null, description: data.description ?? null, image_url: data.image_url || null, price: data.price, unit: data.unit, stock: data.stock };
    const query = data.id ? supabaseAdmin.from("medicines").update(payload).eq("id", data.id) : supabaseAdmin.from("medicines").insert(payload);
    const { error } = await query;
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteMedicine = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => IdSchema.parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin.from("medicines").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const BranchSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(180),
  image_url: z.string().max(1000).nullable().optional(),
  phone: z.string().max(40).nullable().optional(),
  address: z.string().max(500).nullable().optional(),
  map_url: z.string().max(1500).nullable().optional(),
  map_type: z.enum(["text", "google", "yandex"]).optional(),
  google_map_url: z.string().max(1500).nullable().optional(),
  yandex_map_url: z.string().max(1500).nullable().optional(),
});


export const adminListBranches = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => (i ?? {}))
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { data: rows, error } = await supabaseAdmin.from("branches").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const adminSaveBranch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => BranchSchema.parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const payload = {
      name: data.name,
      image_url: data.image_url || null,
      phone: data.phone ?? null,
      address: data.address ?? null,
      map_url: data.map_url ?? null,
      map_type: data.map_type ?? "google",
      google_map_url: data.google_map_url ?? null,
      yandex_map_url: data.yandex_map_url ?? null,
    };
    const query = data.id ? supabaseAdmin.from("branches").update(payload).eq("id", data.id) : supabaseAdmin.from("branches").insert(payload);
    const { error } = await query;
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteBranch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => IdSchema.parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin.from("branches").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const OrderStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["pending", "confirmed", "delivering", "delivered", "cancelled"]),
});

export const adminListOrders = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => (i ?? {}))
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { data: rows, error } = await supabaseAdmin.from("orders").select("*, order_items(*)").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const adminSetOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => OrderStatusSchema.parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin.from("orders").update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminListUsers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => (i ?? {}))
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);

    const { data: usersData, error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
    if (error) throw new Error(error.message);

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
  user_id: z.string().uuid(),
  new_password: z.string().min(6).max(72),
});

export const adminResetPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => ResetSchema.parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.user_id, { password: data.new_password });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const UpdateUserSchema = z.object({
  user_id: z.string().uuid(),
  full_name: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().optional(),
});

export const adminUpdateUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => UpdateUserSchema.parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
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

const DeleteSchema = z.object({ user_id: z.string().uuid() });
export const adminDeleteUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => DeleteSchema.parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.user_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => IdSchema.parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    await supabaseAdmin.from("order_items").delete().eq("order_id", data.id);
    await supabaseAdmin.from("reviews").delete().eq("order_id", data.id);
    const { error } = await supabaseAdmin.from("orders").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
