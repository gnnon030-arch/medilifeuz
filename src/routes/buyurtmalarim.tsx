import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/buyurtmalarim")({
  component: OrdersPage,
  head: () => ({ meta: [{ title: "Buyurtmalarim — MediLife" }] }),
});

function OrdersPage() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { if (!authLoading && !user) navigate({ to: "/login" }); }, [authLoading, user, navigate]);

  const { data = [], refetch } = useQuery({
    queryKey: ["my-orders", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("*, order_items(*), reviews(*)").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">{t("orders.title")}</h1>
      {data.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">Hozircha buyurtma yo'q</p>
      ) : (
        <div className="space-y-4">
          {data.map((o: any) => <OrderRow key={o.id} order={o} onChanged={refetch} />)}
        </div>
      )}
    </div>
  );
}

function statusVariant(s: string) {
  if (s === "delivered") return "default";
  if (s === "cancelled") return "destructive";
  return "secondary";
}

function OrderRow({ order, onChanged }: { order: any; onChanged: () => void }) {
  const { t } = useTranslation();
  const [rating, setRating] = useState(8);
  const [comment, setComment] = useState("");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const existingReview = order.reviews?.[0];

  const submit = async () => {
    setSaving(true);
    const { error } = await supabase.from("reviews").insert({ order_id: order.id, user_id: order.user_id, rating, comment });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Sharh saqlandi");
    setOpen(false);
    onChanged();
  };

  return (
    <Card className="p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-sm text-muted-foreground">#{order.id.slice(0, 8)} · {new Date(order.created_at).toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">{order.delivery_type === "courier" ? "Kuryer" : "O'zi olib ketadi"}</p>
        </div>
        <Badge variant={statusVariant(order.status)}>{t(`orders.status.${order.status}`)}</Badge>
      </div>
      <ul className="text-sm space-y-1 mb-3">
        {order.order_items?.map((i: any) => (
          <li key={i.id}>• {i.medicine_name} × {i.quantity} — {Number(i.line_total).toLocaleString()} so'm</li>
        ))}
      </ul>
      <div className="flex justify-between font-semibold border-t pt-2">
        <span>{t("cart.total")}</span><span>{Number(order.total).toLocaleString()} so'm</span>
      </div>

      {order.status === "delivered" && (
        <div className="mt-4 border-t pt-3">
          {existingReview ? (
            <div className="flex items-center gap-2 text-sm">
              <Star className="h-4 w-4 fill-primary text-primary" />
              <span className="font-semibold">{existingReview.rating}/10</span>
              {existingReview.comment && <span className="text-muted-foreground">— {existingReview.comment}</span>}
            </div>
          ) : open ? (
            <div className="space-y-3">
              <div>
                <p className="text-sm mb-2">{t("orders.rating")}: <span className="font-bold text-primary">{rating}/10</span></p>
                <Slider value={[rating]} onValueChange={(v) => setRating(v[0])} min={0} max={10} step={1} />
              </div>
              <Textarea placeholder={t("orders.comment")} value={comment} onChange={(e) => setComment(e.target.value.slice(0, 500))} rows={2} />
              <div className="flex gap-2">
                <Button onClick={submit} disabled={saving} size="sm">{t("common.save")}</Button>
                <Button onClick={() => setOpen(false)} variant="ghost" size="sm">{t("common.cancel")}</Button>
              </div>
            </div>
          ) : (
            <Button onClick={() => setOpen(true)} variant="outline" size="sm" className="gap-1"><Star className="h-4 w-4" /> {t("orders.rate")}</Button>
          )}
        </div>
      )}
    </Card>
  );
}
