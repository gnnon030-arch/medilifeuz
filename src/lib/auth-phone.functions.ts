import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const PhoneSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/[^\d]/g, ""))
  .refine((v) => v.length === 12 && v.startsWith("998"), "Telefon raqam noto'g'ri");

const RequestSchema = z.object({
  phone: PhoneSchema,
  mode: z.enum(["login", "register"]),
});

const VerifySchema = z.object({
  phone: PhoneSchema,
  code: z.string().trim().regex(/^\d{6}$/, "Kod 6 xonalik bo'lishi kerak"),
  full_name: z.string().trim().min(2).max(100).optional(),
  consume: z.boolean().optional(),
});

const BOT_USERNAME = "@medilife_account_bot";
const NOT_REGISTERED_MSG = `Siz hali botdan ro'yxatdan o'tmagansiz. Avval ${BOT_USERNAME} botiga kirib /start bosing va raqamingizni yuboring.`;

export const requestPhoneCode = createServerFn({ method: "POST" })
  .inputValidator((input) => RequestSchema.parse(input))
  .handler(async ({ data }) => {
    const { sha256Hex, syntheticEmail, formatPhoneDisplay } = await import("./auth-phone.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // 1) Telegram botdan ro'yxatdan o'tganini tekshirish
    const { data: tgUser } = await supabaseAdmin
      .from("telegram_users")
      .select("chat_id, first_name, phone_number")
      .eq("phone_number", data.phone)
      .maybeSingle();

    if (!tgUser) throw new Error(NOT_REGISTERED_MSG);

    const email = syntheticEmail(data.phone);
    const { data: list } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const exists = !!list?.users?.some((u) => u.email?.toLowerCase() === email);

    if (data.mode === "register" && exists) {
      throw new Error("Bu raqam allaqachon ro'yxatdan o'tgan. Kirish sahifasidan foydalaning.");
    }

    // Spamdan himoya: 60 sekundda 1 marta, soatda 5 marta
    const { data: recent } = await supabaseAdmin
      .from("phone_otps")
      .select("id, created_at")
      .eq("phone", data.phone)
      .gte("created_at", new Date(Date.now() - 60 * 60 * 1000).toISOString())
      .order("created_at", { ascending: false });
    if (recent && recent.length > 0) {
      const last = new Date(recent[0]!.created_at).getTime();
      if (Date.now() - last < 55_000) {
        throw new Error("Kod yuborildi. Iltimos, 1 daqiqadan so'ng qayta urinib ko'ring.");
      }
      if (recent.length >= 5) {
        throw new Error("Juda ko'p urinish. 1 soatdan so'ng qayta urinib ko'ring.");
      }
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expires_at = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    await supabaseAdmin
      .from("phone_otps")
      .update({ consumed: true })
      .eq("phone", data.phone)
      .eq("consumed", false);

    const { error } = await supabaseAdmin.from("phone_otps").insert({
      phone: data.phone,
      code_hash: await sha256Hex(`${data.phone}:${code}`),
      expires_at,
    });
    if (error) throw new Error(error.message);

    // 2) Kodni foydalanuvchining Telegram chatiga yuborish
    const token = process.env["TELEGRAM_BOT_TOKEN"];
    if (!token) throw new Error("Telegram bot sozlanmagan. Administratorga murojaat qiling.");

    const text = [
      "🔐 <b>MediLife — tasdiqlash kodi</b>",
      `🔢 Kod: <b>${code}</b>`,
      `📞 ${formatPhoneDisplay(data.phone)}`,
      "⏱ Kod 5 daqiqa amal qiladi. Uni hech kimga bermang!",
    ].join("\n");

    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: tgUser.chat_id, text, parse_mode: "HTML" }),
    });
    if (!res.ok) {
      console.error("Telegram OTP send failed", res.status, await res.text());
      throw new Error(`Kod yuborilmadi. ${BOT_USERNAME} botni bloklamaganingizni tekshiring.`);
    }

    return { ok: true as const, expires_in: 300, first_name: tgUser.first_name ?? null };
  });

export const verifyPhoneCode = createServerFn({ method: "POST" })
  .inputValidator((input) => VerifySchema.parse(input))
  .handler(async ({ data }) => {
    const { sha256Hex, syntheticEmail, formatPhoneDisplay } = await import("./auth-phone.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: rows, error } = await supabaseAdmin
      .from("phone_otps")
      .select("id, code_hash, attempts, consumed, expires_at")
      .eq("phone", data.phone)
      .eq("consumed", false)
      .order("created_at", { ascending: false })
      .limit(1);
    if (error) throw new Error(error.message);
    const otp = rows?.[0];
    if (!otp) throw new Error("Kod topilmadi. Yangi kod so'rang.");
    if (new Date(otp.expires_at).getTime() < Date.now()) throw new Error("Kod muddati tugagan. Yangi kod so'rang.");
    if (otp.attempts >= 5) throw new Error("Juda ko'p urinish. Yangi kod so'rang.");

    const hash = await sha256Hex(`${data.phone}:${data.code}`);
    if (hash !== otp.code_hash) {
      await supabaseAdmin.from("phone_otps").update({ attempts: otp.attempts + 1 }).eq("id", otp.id);
      throw new Error("Kod noto'g'ri");
    }

    // Faqat tekshirish (ism kiritish bosqichiga o'tish uchun)
    if (data.consume === false) return { verified: true as const, token_hash: null };

    const { data: tgUser } = await supabaseAdmin
      .from("telegram_users")
      .select("first_name, last_name")
      .eq("phone_number", data.phone)
      .maybeSingle();

    const tgName = [tgUser?.first_name, tgUser?.last_name].filter(Boolean).join(" ").trim();
    const fullName = data.full_name || tgName || formatPhoneDisplay(data.phone);

    const email = syntheticEmail(data.phone);
    const { data: list } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const existing = list?.users?.find((u) => u.email?.toLowerCase() === email);

    let userId = existing?.id;
    if (!userId) {
      const { data: created, error: cerr } = await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true,
        password: crypto.randomUUID() + crypto.randomUUID(),
        user_metadata: {
          full_name: fullName,
          phone: formatPhoneDisplay(data.phone),
        },
      });
      if (cerr || !created?.user) throw new Error(cerr?.message ?? "Foydalanuvchi yaratilmadi");
      userId = created.user.id;
    }

    await supabaseAdmin.from("profiles").upsert(
      {
        id: userId,
        phone: formatPhoneDisplay(data.phone),
        full_name: fullName,
      },
      { onConflict: "id" },
    );

    // Admin huquqiga ega telefon raqamlar
    const ADMIN_PHONES = ["998902608888", "998913620080"];
    if (ADMIN_PHONES.includes(data.phone)) {
      await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });
    }

    await supabaseAdmin.from("phone_otps").update({ consumed: true }).eq("id", otp.id);

    const { data: link, error: lerr } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email,
    });
    if (lerr || !link?.properties?.hashed_token) {
      throw new Error(lerr?.message ?? "Sessiya yaratilmadi");
    }

    return { verified: true as const, token_hash: link.properties.hashed_token, full_name: fullName };
  });
