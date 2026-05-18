import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const OrderItemSchema = z.object({
  medicine_id: z.string().uuid(),
  medicine_name: z.string().min(1).max(255),
  unit_price: z.number().nonnegative(),
  quantity: z.number().int().positive(),
});

const PlaceOrderSchema = z.object({
  user_id: z.string().uuid(),
  customer_name: z.string().trim().min(1).max(100),
  customer_phone: z.string().trim().min(7).max(20),
  delivery_type: z.enum(["pickup", "courier"]),
  delivery_fee: z.number().nonnegative(),
  note: z.string().max(500).optional().nullable(),
  items: z.array(OrderItemSchema).min(1).max(50),
});

export const placeOrder = createServerFn({ method: "POST" })
  .inputValidator((input) => PlaceOrderSchema.parse(input))
  .handler(async ({ data }) => {
    const subtotal = data.items.reduce((s, i) => s + i.unit_price * i.quantity, 0);
    const total = subtotal + data.delivery_fee;

    // 1) create order
    const { data: order, error: oerr } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: data.user_id,
        customer_name: data.customer_name,
        customer_phone: data.customer_phone,
        delivery_type: data.delivery_type,
        delivery_fee: data.delivery_fee,
        subtotal,
        total,
        note: data.note ?? null,
        status: "pending",
      })
      .select()
      .single();
    if (oerr || !order) throw new Error(oerr?.message ?? "Failed to create order");

    // 2) insert items
    const items = data.items.map((i) => ({
      order_id: order.id,
      medicine_id: i.medicine_id,
      medicine_name: i.medicine_name,
      unit_price: i.unit_price,
      quantity: i.quantity,
      line_total: i.unit_price * i.quantity,
    }));
    const { error: ierr } = await supabaseAdmin.from("order_items").insert(items);
    if (ierr) throw new Error(ierr.message);

    // 3) decrement stock
    for (const i of data.items) {
      const { data: med } = await supabaseAdmin.from("medicines").select("stock").eq("id", i.medicine_id).single();
      if (med) {
        await supabaseAdmin
          .from("medicines")
          .update({ stock: Math.max(0, (med.stock as number) - i.quantity) })
          .eq("id", i.medicine_id);
      }
    }

    // 4) Telegram notify
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (token && chatId) {
      const lines = [
        "🆕 <b>Yangi buyurtma — MediLife</b>",
        `👤 ${data.customer_name}`,
        `📞 ${data.customer_phone}`,
        `🚚 ${data.delivery_type === "courier" ? "Kuryer" : "O'zi olib ketadi"}`,
        "",
        "<b>Dorilar:</b>",
        ...data.items.map((i) => `• ${i.medicine_name} × ${i.quantity} = ${(i.unit_price * i.quantity).toLocaleString()} so'm`),
        "",
        `Mahsulotlar: ${subtotal.toLocaleString()} so'm`,
        `Yetkazib berish: ${data.delivery_fee.toLocaleString()} so'm`,
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
