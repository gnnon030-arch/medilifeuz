import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MedicineCard, type Medicine } from "@/components/MedicineCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/dorilar")({
  component: MedicinesPage,
  head: () => ({ meta: [{ title: "Dorilar — MediLife" }] }),
});

const PAGE_SIZE = 200;

/** So'rovni PostgREST ilike patterniga aylantiradi (maxsus belgilarni tozalaydi). */
function tokens(q: string): string[] {
  return q
    .toLowerCase()
    .replace(/[,()%*"']/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 5);
}

function MedicinesPage() {
  const { t, i18n } = useTranslation();
  const [q, setQ] = useState("");
  const [dq, setDq] = useState("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [sort, setSort] = useState<"az" | "za" | "price-asc" | "price-desc">("az");

  useEffect(() => {
    const id = setTimeout(() => setDq(q.trim()), 250);
    return () => clearTimeout(id);
  }, [q]);

  const currentLang: "latin" | "cyrillic" = i18n.language === "uz_cyrl" ? "cyrillic" : "latin";

  const { data: filtered = [], isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: ["medicines-search", currentLang, dq, minPrice, maxPrice, sort],
    placeholderData: keepPreviousData,
    staleTime: 2 * 60 * 1000,
    retry: 3,
    retryDelay: (a) => Math.min(1000 * 2 ** a, 5000),
    queryFn: async () => {
      const min = Number(minPrice) || 0;
      const max = Number(maxPrice) || 0;

      const run = async (withLang: boolean) => {
        let query = supabase.from("medicines").select("*");
        if (withLang) query = query.eq("language", currentLang);
        for (const tok of tokens(dq)) {
          query = query.or(`name.ilike.%${tok}%,name_cyrl.ilike.%${tok}%`);
        }
        if (min > 0) query = query.gte("price", min);
        if (max > 0) query = query.lte("price", max);
        if (sort === "price-asc") query = query.order("price", { ascending: true });
        else if (sort === "price-desc") query = query.order("price", { ascending: false });
        else query = query.order(currentLang === "cyrillic" ? "name_cyrl" : "name", { ascending: sort === "az" });
        const { data, error } = await query.limit(PAGE_SIZE);
        if (error) throw new Error(error.message);
        return (data ?? []) as Medicine[];
      };

      const primary = await run(true);
      const rows = primary.length ? primary : await run(false);

      // Bir xil dorilarni (nomi + narxi bir xil) faqat bir marta ko'rsatamiz
      const seen = new Set<string>();
      const unique: Medicine[] = [];
      for (const m of rows) {
        const key = `${(m.name ?? "").toLowerCase().replace(/\s+/g, " ").trim()}|${(m as { name_cyrl?: string | null }).name_cyrl?.toLowerCase().replace(/\s+/g, " ").trim() ?? ""}|${m.price}`;
        if (seen.has(key)) continue;
        seen.add(key);
        unique.push(m);
      }
      return unique;
    },
  });



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
      ) : isError ? (
        <div className="text-muted-foreground">
          <p>Ma'lumot yuklanmadi. Internetni tekshirib, qayta urinib ko'ring.</p>
          <button className="mt-2 underline" onClick={() => refetch()}>Qayta yuklash</button>
        </div>
      ) : filtered.length === 0 ? (

        <p className="text-muted-foreground">{t("medicines.empty")}</p>
      ) : (
        <>
          <div className="text-xs text-muted-foreground mb-3">
            Topildi: {filtered.length} ta{filtered.length >= PAGE_SIZE ? "+ (aniqroq qidiring)" : ""}
            {isFetching ? " · yuklanmoqda…" : ""}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((m) => <MedicineCard key={m.id} m={m} />)}
          </div>
        </>
      )}
    </div>
  );
}
