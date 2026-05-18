import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MedicineCard, type Medicine } from "@/components/MedicineCard";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/dorilar")({
  component: MedicinesPage,
  head: () => ({ meta: [{ title: "Dorilar — MediLife" }] }),
});

function MedicinesPage() {
  const { t } = useTranslation();
  const [q, setQ] = useState("");

  const { data = [] } = useQuery({
    queryKey: ["medicines-all"],
    queryFn: async () => {
      const { data } = await supabase.from("medicines").select("*").order("created_at", { ascending: false });
      return (data ?? []) as Medicine[];
    },
  });

  const filtered = data.filter((m) => m.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <h1 className="text-4xl font-bold">{t("medicines.title")}</h1>
        <Input placeholder={t("common.search")} value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
      </div>
      {filtered.length === 0 ? (
        <p className="text-muted-foreground">{t("medicines.empty")}</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((m) => <MedicineCard key={m.id} m={m} />)}
        </div>
      )}
    </div>
  );
}
