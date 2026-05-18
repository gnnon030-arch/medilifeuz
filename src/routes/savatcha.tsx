import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { formatPhone, isValidPhone } from "@/lib/phone";
import { placeOrder } from "@/lib/orders.functions";

export const Route = createFileRoute("/savatcha")({
  component: CartPage,
  head: () => ({ meta: [{ title: "Savatcha — MediLife" }] }),
});

const COURIER_HOURS_FREE = "10:00–22:00";

function isOffHoursNamangan(): boolean {
  // Asia/Tashkent (UTC+5). Free window 10:00–22:00
  const fmt = new Intl.DateTimeFormat("en-US", { hour: "numeric", hour12: false, timeZone: "Asia/Tashkent" });
  const h = parseInt(fmt.format(new Date()), 10);
  return h < 10 || h >= 22;
}

function CartPage() {
  const { t } = useTranslation();
  const { items, add, remove, setQty, clear, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(id);
  }, []);
  const timeStr = new Intl.DateTimeFormat("uz-UZ", { timeZone: "Asia/Tashkent", hour: "2-digit", minute: "2-digit", day: "2-digit", month: "long" }).format(now);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+998 ");
  const [delivery, setDelivery] = useState<"pickup" | "courier">("courier");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.user_metadata?.full_name) setName(user.user_metadata.full_name as string);
    if (user?.phone) setPhone(formatPhone(user.phone));
  }, [user]);

  const offHours = isOffHoursNamangan();
  const courierFee = delivery === "courier" && offHours ? 20000 : 0;
  const grand = total + courierFee;

  const submit = async () => {
    if (!user) {
      toast.error("Avval tizimga kiring");
      navigate({ to: "/login" });
      return;
    }
    if (!name.trim()) return toast.error("Ismni kiriting");
    if (!isValidPhone(phone)) return toast.error(t("auth.phone_invalid"));
    if (items.length === 0) return;
    setSubmitting(true);
    try {
      const res = await placeOrder({
        data: {
          user_id: user.id,
          customer_name: name.trim(),
          customer_phone: phone,
          delivery_type: delivery,
          delivery_fee: courierFee,
          note: note || null,
          items: items.map((i) => ({
            medicine_id: i.id,
            medicine_name: i.name,
            unit_price: i.price,
            quantity: i.quantity,
          })),
        },
      });
      toast.success(`${t("cart.submitted")} #${res.orderId.slice(0, 8)}`);
      clear();
      navigate({ to: "/buyurtmalarim" });
    } catch (e: any) {
      toast.error(e.message ?? "Xatolik");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <h1 className="text-4xl font-bold mb-2">{t("nav.cart")}</h1>
      <p className="text-sm text-muted-foreground mb-6">{t("cart.current_time")}: <span className="font-medium text-foreground">{timeStr}</span></p>

      <Tabs defaultValue="cart">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="cart">{t("nav.cart")}</TabsTrigger>
          <TabsTrigger value="checkout">{t("cart.checkout")}</TabsTrigger>
        </TabsList>

        <TabsContent value="cart" className="space-y-3 mt-6">
          {items.length === 0 ? (
            <p className="text-muted-foreground text-center py-12">{t("cart.empty")}</p>
          ) : (
            <>
              {items.map((i) => (
                <Card key={i.id} className="p-3 flex items-center gap-3">
                  <div className="w-16 h-16 rounded-md bg-muted overflow-hidden shrink-0">
                    {i.image_url && <img src={i.image_url} alt={i.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{i.name}</h3>
                    <p className="text-sm text-muted-foreground">{i.unit} · {i.price.toLocaleString()} {t("common.sum")}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="outline" onClick={() => remove(i.id)}><Minus className="h-4 w-4" /></Button>
                    <span className="w-8 text-center font-semibold">{i.quantity}</span>
                    <Button size="icon" onClick={() => add({ id: i.id, name: i.name, price: i.price, unit: i.unit, image_url: i.image_url })}><Plus className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => setQty(i.id, 0)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </Card>
              ))}
              <Card className="p-4 mt-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>{t("cart.subtotal")}:</span>
                  <span>{total.toLocaleString()} {t("common.sum")}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">🚚 {t("cart.free_courier")} ({COURIER_HOURS_FREE})</p>
                {offHours && <p className="text-sm text-destructive mt-1">⚠️ {t("cart.outside_hours")}</p>}
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="checkout" className="space-y-4 mt-6">
          {items.length === 0 ? (
            <p className="text-muted-foreground text-center py-12">{t("cart.empty")}</p>
          ) : (
            <Card className="p-6 space-y-4">
              <div className="space-y-2">
                <Label>{t("auth.full_name")}</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={100} />
              </div>
              <div className="space-y-2">
                <Label>{t("auth.phone")}</Label>
                <Input value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} placeholder="+998 90 123 45 67" />
              </div>
              <div className="space-y-2">
                <Label>Eslatma (ixtiyoriy)</Label>
                <Textarea value={note} onChange={(e) => setNote(e.target.value.slice(0, 500))} rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Yetkazib berish</Label>
                <RadioGroup value={delivery} onValueChange={(v) => setDelivery(v as any)}>
                  <div className="flex items-center gap-2"><RadioGroupItem value="pickup" id="pickup" /><Label htmlFor="pickup" className="cursor-pointer">{t("cart.pickup")}</Label></div>
                  <div className="flex items-center gap-2"><RadioGroupItem value="courier" id="courier" /><Label htmlFor="courier" className="cursor-pointer">{t("cart.courier")}</Label></div>
                </RadioGroup>
              </div>

              <div className="border-t pt-4 space-y-1">
                <div className="flex justify-between text-sm"><span>{t("cart.subtotal")}</span><span>{total.toLocaleString()}</span></div>
                <div className="flex justify-between text-sm"><span>{t("cart.delivery_fee")}</span><span>{courierFee.toLocaleString()}</span></div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t"><span>{t("cart.total")}</span><span>{grand.toLocaleString()} {t("common.sum")}</span></div>
              </div>

              <Button onClick={submit} disabled={submitting} size="lg" className="w-full">
                {submitting ? t("common.loading") : t("cart.submit")}
              </Button>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
