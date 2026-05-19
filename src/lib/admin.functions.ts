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
