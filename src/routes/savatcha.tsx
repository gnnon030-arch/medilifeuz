import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { formatPhone, isValidPhone } from "@/lib/phone";
import { placeOrder } from "@/lib/orders.functions";
import { YandexAddressPicker } from "@/components/YandexAddressPicker";
import { GoogleAddressPicker } from "@/components/GoogleAddressPicker";

export const Route = createFileRoute("/savatcha")({
  component: CartPage,
  head: () => ({ meta: [{ title: "Savatcha — MediLife" }] }),
});

function formatNamanganTime(d: Date): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Tashkent",
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: false,
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("day")}.${get("month")}.${get("year")} ${get("hour")}:${get("minute")}`;
}

type AddrMethod = "text" | "google" | "yandex";

function CartPage() {
  const { t } = useTranslation();
  const { items, add, remove, setQty, clear, total, count } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);
  const timeStr = useMemo(() => formatNamanganTime(now), [now]);

  const [tab, setTab] = useState<"cart" | "checkout">("cart");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+998 ");
  const [addrMethod, setAddrMethod] = useState<AddrMethod>("text");
  const [addressText, setAddressText] = useState("");
  const [addressGoogle, setAddressGoogle] = useState("");
  const [addressGoogleUrl, setAddressGoogleUrl] = useState<string | undefined>();
  const [addressYandex, setAddressYandex] = useState("");
  const [addressYandexUrl, setAddressYandexUrl] = useState<string | undefined>();
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.user_metadata?.full_name) setName(user.user_metadata.full_name as string);
    if (user?.phone) setPhone(formatPhone(user.phone));
  }, [user]);

  useEffect(() => {
    if (items.length === 0 && tab === "checkout") setTab("cart");
  }, [items.length, tab]);

  const grand = total;
  const isEmpty = items.length === 0;

  const goCheckout = () => { if (!isEmpty) setTab("checkout"); };

  const submit = async () => {
    if (!user) {
      toast.error("Avval tizimga kiring");
      navigate({ to: "/login" });
      return;
    }
    if (!name.trim()) return toast.error("Ismni kiriting");
    if (!isValidPhone(phone)) return toast.error(t("auth.phone_invalid"));

    let finalAddress = "";
    let mapUrl: string | undefined;
    if (addrMethod === "text") {
      const nonSpace = addressText.replace(/\s+/g, "");
      if (nonSpace.length < 20) return toast.error(t("cart.address_min"));
      finalAddress = addressText.trim();
    } else if (addrMethod === "google") {
      if (!addressGoogle.trim()) return toast.error(t("cart.address_text"));
      finalAddress = addressGoogle.trim();
      mapUrl = addressGoogleUrl;
    } else {
      if (!addressYandex.trim()) return toast.error(t("cart.address_text"));
      finalAddress = addressYandex.trim();
      mapUrl = addressYandexUrl;
    }

    if (isEmpty) return;
    setSubmitting(true);
    try {
      const res = await placeOrder({
        data: {
          customer_name: name.trim(),
          customer_phone: phone,
          address: finalAddress,
          map_url: mapUrl ?? null,
          note: note || null,
          items: items.map((i) => ({ medicine_id: i.id, quantity: i.quantity })),
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

  const textNonSpaceLen = addressText.replace(/\s+/g, "").length;

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <h1 className="text-4xl font-bold mb-2">{t("nav.cart")}</h1>
      <p className="text-sm text-muted-foreground mb-6">
        {t("cart.current_time")}: <span className="font-medium text-foreground">{timeStr}</span>
      </p>

      <Tabs value={tab} onValueChange={(v) => setTab(v as "cart" | "checkout")}>
        <TabsList className={isEmpty ? "grid w-full grid-cols-1" : "grid w-full grid-cols-2"}>
          <TabsTrigger value="cart">{t("nav.cart")}</TabsTrigger>
          {!isEmpty && <TabsTrigger value="checkout">{t("cart.checkout")}</TabsTrigger>}
        </TabsList>

        <TabsContent value="cart" className="space-y-3 mt-6">
          {isEmpty ? (
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
                    <p className="text-sm text-muted-foreground">{i.quantity} {i.unit} · {i.price.toLocaleString()} {t("common.sum")}</p>
                    <p className="text-sm font-semibold text-primary">= {(i.price * i.quantity).toLocaleString()} {t("common.sum")}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="outline" onClick={() => remove(i.id)}><Minus className="h-4 w-4" /></Button>
                    <span className="w-8 text-center font-semibold">{i.quantity}</span>
                    <Button size="icon" onClick={() => add({ id: i.id, name: i.name, price: i.price, unit: i.unit, image_url: i.image_url })}><Plus className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => setQty(i.id, 0)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </Card>
              ))}

              <Card className="p-4 mt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Jami dorilar:</span>
                  <span className="font-medium">{count} dona</span>
                </div>
                <div className="flex justify-between text-lg font-semibold">
                  <span>{t("cart.subtotal")}:</span>
                  <span>{total.toLocaleString()} {t("common.sum")}</span>
                </div>
                <div className="border-t pt-3 text-sm">
                  <div className="font-medium">🚚 {t("cart.delivery_only")}</div>
                  <div className="text-primary font-semibold mt-1">{t("cart.delivery_free_city")}</div>
                </div>
                <div className="flex justify-between text-lg font-bold pt-3 border-t">
                  <span>{t("cart.total")}:</span>
                  <span>{grand.toLocaleString()} {t("common.sum")}</span>
                </div>
                <Button onClick={goCheckout} disabled={isEmpty} size="lg" className="w-full">{t("cart.submit")}</Button>
              </Card>
            </>
          )}
        </TabsContent>

        {!isEmpty && (
          <TabsContent value="checkout" className="space-y-4 mt-6">
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
                <Label>{t("cart.address_method")}</Label>
                <Tabs value={addrMethod} onValueChange={(v) => setAddrMethod(v as AddrMethod)}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="text">{t("cart.address_method_text")}</TabsTrigger>
                    <TabsTrigger value="google">{t("cart.address_method_google")}</TabsTrigger>
                    <TabsTrigger value="yandex">{t("cart.address_method_yandex")}</TabsTrigger>
                  </TabsList>

                  <TabsContent value="text" className="space-y-2 mt-3">
                    <Input
                      value={addressText}
                      onChange={(e) => setAddressText(e.target.value.slice(0, 400))}
                      placeholder={t("cart.address_text_ph")}
                    />
                    <p className={`text-xs ${textNonSpaceLen < 20 ? "text-destructive" : "text-muted-foreground"}`}>
                      {textNonSpaceLen}/20 {textNonSpaceLen < 20 ? `— ${t("cart.address_min")}` : "✓"}
                    </p>
                  </TabsContent>

                  <TabsContent value="google" className="space-y-2 mt-3">
                    <GoogleAddressPicker onPick={(a, url) => { setAddressGoogle(a); setAddressGoogleUrl(url); }} />
                    {addressGoogle && (
                      <p className="text-sm"><span className="text-muted-foreground">{t("cart.address_picked")}:</span> <span className="font-medium">{addressGoogle}</span></p>
                    )}
                  </TabsContent>

                  <TabsContent value="yandex" className="space-y-2 mt-3">
                    <YandexAddressPicker onPick={(a) => setAddressYandex(a)} />
                    {addressYandex && (
                      <p className="text-sm"><span className="text-muted-foreground">{t("cart.address_picked")}:</span> <span className="font-medium">{addressYandex}</span></p>
                    )}
                  </TabsContent>
                </Tabs>
              </div>

              <div className="space-y-2">
                <Label>{t("cart.note_ph")}</Label>
                <Textarea value={note} onChange={(e) => setNote(e.target.value.slice(0, 500))} rows={3} />
              </div>

              <div className="border-t pt-3 space-y-2">
                <Label>{t("cart.order_list")}</Label>
                <ul className="text-sm space-y-1">
                  {items.map((i) => (
                    <li key={i.id} className="flex justify-between gap-2">
                      <span className="truncate">{i.name} × {i.quantity}</span>
                      <span className="font-medium shrink-0">{(i.price * i.quantity).toLocaleString()} {t("common.sum")}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t pt-4 space-y-1">
                <div className="flex justify-between text-sm"><span>{t("cart.subtotal")}</span><span>{total.toLocaleString()} {t("common.sum")}</span></div>
                <div className="flex justify-between text-sm"><span>{t("cart.delivery_fee")}</span><span className="text-primary font-semibold">{t("cart.delivery_free_city")}</span></div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t"><span>{t("cart.total")}</span><span>{grand.toLocaleString()} {t("common.sum")}</span></div>
              </div>

              <Button onClick={submit} disabled={submitting} size="lg" className="w-full">
                {submitting ? t("common.loading") : t("common.confirm")}
              </Button>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
