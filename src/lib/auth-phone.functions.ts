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
  code: z.string().trim().regex(/^\d{4}$/, "Kod 4 xonalik bo'lishi kerak"),
  full_name: z.string().trim().min(2).max(100).optional(),
  consume: z.boolean().optional(),
});

export const requestPhoneCode = createServerFn({ method: "POST" })
  .inputValidator((input) => RequestSchema.parse(input))
  .handler(async ({ data }) => {
    const { sha256Hex, syntheticEmail, formatPhoneDisplay } = await import("./auth-phone.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const email = syntheticEmail(data.phone);

    // Foydalanuvchi bor/yo'qligini aniqlash
    let exists = false;
    const { data: list } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    exists = !!list?.users?.some((u) => u.email?.toLowerCase() === email);

    if (data.mode === "login" && !exists) {
      throw new Error("Bu raqam ro'yxatdan o'tmagan. Avval ro'yxatdan o'ting.");
    }
    if (data.mode === "register" && exists) {
      throw new Error("Bu raqam allaqachon ro'yxatdan o'tgan. Kirish sahifasidan foydalaning.");
    }

    // Spamdan himoya: 60 sekundda 1 marta, soatda 5 marta
    const nowIso = new Date().toISOString();
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

    const code = String(Math.floor(1000 + Math.random() * 9000));
    const expires_at = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    // eski kodlarni kuchdan qoldirish
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

    // Telegramga yuborish
    const token = process.env["TELEGRAM_BOT_TOKEN"];
    const chatId = process.env["TELEGRAM_CHAT_ID"];
    if (token && chatId) {
      const text = [
        "🔐 <b>MediLife — tasdiqlash kodi</b>",
        `📞 ${formatPhoneDisplay(data.phone)}`,
        `🔢 Kod: <b>${code}</b>`,
        data.mode === "register" ? "📝 Ro'yxatdan o'tish" : "🔓 Kirish",
        `⏱ ${nowIso}`,
      ].join("\n");
      try {
        const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
        });
        if (!res.ok) console.error("Telegram OTP send failed", await res.text());
      } catch (e) {
        console.error("Telegram OTP send failed", e);
      }
    } else {
      console.error("Telegram sozlanmagan: TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID yo'q");
    }

    return { ok: true as const, expires_in: 300 };
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
          full_name: data.full_name ?? formatPhoneDisplay(data.phone),
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
        ...(data.full_name ? { full_name: data.full_name } : {}),
      },
      { onConflict: "id" },
    );

    await supabaseAdmin.from("phone_otps").update({ consumed: true }).eq("id", otp.id);

    const { data: link, error: lerr } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email,
    });
    if (lerr || !link?.properties?.hashed_token) {
      throw new Error(lerr?.message ?? "Sessiya yaratilmadi");
    }

    return { verified: true as const, token_hash: link.properties.hashed_token };
  });
