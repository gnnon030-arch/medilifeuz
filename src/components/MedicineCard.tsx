import { useTranslation } from "react-i18next";
import { useNavigate } from "@tanstack/react-router";
import { Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useCart } from "@/hooks/use-cart";

export type Medicine = {
  id: string;
  name: string;
  name_cyrl?: string | null;
  description: string | null;
  image_url: string | null;
  price: number;
  unit: string;
  stock: number;
};

export function MedicineCard({ m }: { m: Medicine }) {
  const { t, i18n } = useTranslation();
  const { items, add, remove } = useCart();
  const navigate = useNavigate();
  const inCart = items.find((x) => x.id === m.id);
  const qty = inCart?.quantity ?? 0;
  const displayName = i18n.language === "uz_cyrl" && m.name_cyrl ? m.name_cyrl : m.name;

  const onAdd = () => {
    add({ id: m.id, name: displayName, price: Number(m.price), unit: m.unit, image_url: m.image_url });
    toast.success(`${displayName} — ${t("cart.add")}`, {
      duration: 5000,
      action: {
        label: t("nav.cart"),
        onClick: () => navigate({ to: "/savatcha" }),
      },
    });
  };

  const onRemove = () => {
    if (qty <= 0) return;
    remove(m.id);
    toast(`${displayName} — ${t("cart.remove")}`);
  };

  return (
    <Card className="overflow-hidden flex flex-col group hover:shadow-lg transition-shadow">
      <div className="aspect-square bg-muted overflow-hidden">
        {m.image_url ? (
          <img
            src={m.image_url}
            alt={displayName}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            onError={(e) => {
              const el = e.currentTarget;
              el.style.display = "none";
              const parent = el.parentElement;
              if (parent && !parent.querySelector(".img-fallback")) {
                const div = document.createElement("div");
                div.className = "img-fallback w-full h-full flex items-center justify-center text-muted-foreground text-sm";
                div.textContent = "No image";
                parent.appendChild(div);
              }
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">No image</div>
        )}
      </div>
      <div className="p-3 flex flex-col gap-2 flex-1">
        <h3 className="font-semibold line-clamp-2 min-h-[2.5rem]">{displayName}</h3>
        <div className="text-lg font-bold text-primary">
          {Number(m.price).toLocaleString()} {t("common.sum")}
        </div>
        <div className="mt-auto">
          {qty === 0 ? (
            <Button onClick={onAdd} className="w-full gap-1" size="sm">
              <Plus className="h-4 w-4" /> {t("common.add")}
            </Button>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <Button onClick={onRemove} variant="outline" size="icon"><Minus className="h-4 w-4" /></Button>
              <span className="font-semibold">{qty}</span>
              <Button onClick={onAdd} size="icon"><Plus className="h-4 w-4" /></Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
