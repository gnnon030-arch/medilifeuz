import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const OrderItemSchema = z.object({
  medicine_id: z.string().uuid(),
  quantity: z.number().int().positive().max(999),
});

const PlaceOrderSchema = z.object({
  customer_name: z.string().trim().min(1).max(100),
  customer_phone: z.string().trim().min(7).max(20),
  address: z.string().trim().min(1).max(600),
  map_url: z.string().url().max(500).optional().nullable(),
  note: z.string().max(500).optional().nullable(),
  items: z.array(OrderItemSchema).min(1).max(50),
});

export const placeOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => PlaceOrderSchema.parse(input))
  .handler(async ({ data, context }) => {
    const user_id = context.userId;
    const delivery_type = "courier";
    const delivery_fee = 0; // shahar bo'ylab bepul

    // 1) Server-side price lookup
    const ids = data.items.map((i) => i.medicine_id);
    const { data: meds, error: merr } = await supabaseAdmin
      .from("medicines")
      .select("id, name, price, stock")
      .in("id", ids);
    if (merr) throw new Error(merr.message);
    const medMap = new Map((meds ?? []).map((m: any) => [m.id, m]));

    const resolved = data.items.map((i) => {
      const m: any = medMap.get(i.medicine_id);
      if (!m) throw new Error("Dori topilmadi");
      if (Number(m.stock) < i.quantity) throw new Error(`Yetarli zaxira yo'q: ${m.name}`);
      const unit_price = Number(m.price);
      return {
        medicine_id: i.medicine_id,
        medicine_name: m.name as string,
        unit_price,
        quantity: i.quantity,
        line_total: unit_price * i.quantity,
      };
    });

    const subtotal = resolved.reduce((s, i) => s + i.line_total, 0);
    const total = subtotal + delivery_fee;

    // 2) create order
    const { data: order, error: oerr } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id,
        customer_name: data.customer_name,
        customer_phone: data.customer_phone,
        delivery_type,
        delivery_fee,
        subtotal,
        total,
        address: data.address,
        note: data.note ?? null,
        status: "pending",
      })
      .select()
      .single();
    if (oerr || !order) throw new Error(oerr?.message ?? "Failed to create order");

    // 3) insert items
    const items = resolved.map((i) => ({ order_id: order.id, ...i }));
    const { error: ierr } = await supabaseAdmin.from("order_items").insert(items);
    if (ierr) throw new Error(ierr.message);

    // 4) decrement stock
    for (const i of resolved) {
      const m: any = medMap.get(i.medicine_id);
      await supabaseAdmin
        .from("medicines")
        .update({ stock: Math.max(0, Number(m.stock) - i.quantity) })
        .eq("id", i.medicine_id);
    }

    // 5) Telegram notify
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (token && chatId) {
      const lines = [
        "🆕 <b>Yangi buyurtma — MediLife</b>",
        `👤 ${data.customer_name}`,
        `📞 ${data.customer_phone}`,
        `🚚 Yetkazib berish (shahar bo'ylab bepul)`,
        `📍 ${data.address}`,
      ];
      if (data.map_url) lines.push(`🗺 <a href="${data.map_url}">Xaritada ko'rish</a>`);
      lines.push(
        "",
        "<b>Dorilar:</b>",
        ...resolved.map((i) => `• ${i.medicine_name} × ${i.quantity} = ${(i.unit_price * i.quantity).toLocaleString()} so'm`),
        "",
        `Mahsulotlar: ${subtotal.toLocaleString()} so'm`,
        `Yetkazib berish: ${delivery_fee.toLocaleString()} so'm`,
        `<b>Jami: ${total.toLocaleString()} so'm</b>`,
      ];
      if (data.note) lines.push("", `📝 ${data.note}`);
      lines.push("", `🆔 Order: ${order.id}`);

      try {
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: chatId, text: lines.join("\n"), parse_mode: "HTML" }),
        });
      } catch (e) {
        console.error("Telegram send failed", e);
      }
    }

    return { orderId: order.id, total };
  });

const DeleteOrderSchema = z.object({ id: z.string().uuid() });

export const deleteMyOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => DeleteOrderSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { data: o, error } = await supabaseAdmin
      .from("orders")
      .select("id, user_id, status")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!o) throw new Error("Buyurtma topilmadi");
    // Allow if order belongs to user, or order has no owner yet (legacy orders)
    if (o.user_id && o.user_id !== context.userId) throw new Error("Ruxsat yo'q");
    if (o.status !== "delivered") throw new Error("Faqat yetkazilgan buyurtmani o'chirish mumkin");
    await supabaseAdmin.from("reviews").delete().eq("order_id", data.id);
    await supabaseAdmin.from("order_items").delete().eq("order_id", data.id);
    const { error: derr } = await supabaseAdmin.from("orders").delete().eq("id", data.id);
    if (derr) throw new Error(derr.message);
    return { ok: true };
  });


