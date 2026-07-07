import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MedicineCard, type Medicine } from "@/components/MedicineCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/dorilar")({
  component: MedicinesPage,
  head: () => ({ meta: [{ title: "Dorilar — MediLife" }] }),
});

function MedicinesPage() {
  const { t, i18n } = useTranslation();
  const [q, setQ] = useState("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [sort, setSort] = useState<"az" | "za" | "price-asc" | "price-desc">("az");

  const currentLang: "latin" | "cyrillic" = i18n.language === "uz_cyrl" ? "cyrillic" : "latin";

  const { data = [], isLoading } = useQuery({
    queryKey: ["medicines-all", currentLang],
    queryFn: async () => {
      const { data } = await supabase.from("medicines").select("*").eq("language", currentLang).order("created_at", { ascending: false });
      return (data ?? []) as Medicine[];
    },
  });

  const filtered = useMemo(() => {
    const s = q.toLowerCase();
    const min = Number(minPrice) || 0;
    const max = Number(maxPrice) || Number.POSITIVE_INFINITY;
    const pickName = (m: Medicine) => (i18n.language === "uz_cyrl" && m.name_cyrl ? m.name_cyrl : m.name) || "";
    const arr = data.filter((m) => {
      const nameMatch = !s || m.name.toLowerCase().includes(s) || (m.name_cyrl ?? "").toLowerCase().includes(s);
      const p = Number(m.price) || 0;
      return nameMatch && p >= min && p <= max;
    });
    arr.sort((a, b) => {
      if (sort === "price-asc") return (Number(a.price) || 0) - (Number(b.price) || 0);
      if (sort === "price-desc") return (Number(b.price) || 0) - (Number(a.price) || 0);
      const cmp = pickName(a).localeCompare(pickName(b), i18n.language === "uz_cyrl" ? "ru" : "uz");
      return sort === "az" ? cmp : -cmp;
    });
    return arr;
  }, [data, q, minPrice, maxPrice, sort, i18n.language]);

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
        <h1 className="text-4xl font-bold">{t("medicines.title")}</h1>
        <Input placeholder={t("common.search")} value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
      </div>
      <div className="flex flex-wrap items-center gap-2 mb-6 p-3 rounded-lg border bg-card">
        <span className="text-sm font-medium">Narx:</span>
        <Input type="number" placeholder="1 000" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="w-28" />
        <span className="text-muted-foreground">—</span>
        <Input type="number" placeholder="100 000" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="w-28" />
        <span className="text-sm text-muted-foreground">so'm</span>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm font-medium">Saralash:</span>
          <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="az">A → Z</SelectItem>
              <SelectItem value="za">Z → A</SelectItem>
              <SelectItem value="price-asc">Narx: arzon → qimmat</SelectItem>
              <SelectItem value="price-desc">Narx: qimmat → arzon</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {isLoading ? (
        <p className="text-muted-foreground">{t("common.loading")}</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground">{t("medicines.empty")}</p>
      ) : (
        <>
          <div className="text-xs text-muted-foreground mb-3">Topildi: {filtered.length} ta</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((m) => <MedicineCard key={m.id} m={m} />)}
          </div>
        </>
      )}
    </div>
  );
}
