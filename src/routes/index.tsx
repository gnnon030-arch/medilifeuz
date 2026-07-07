import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { MedicineCard, type Medicine } from "@/components/MedicineCard";
import { Button } from "@/components/ui/button";
import logo from "@/assets/medilife-logo.jpg";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "MediLife — Bosh sahifa" },
      { name: "description", content: "MediLife onlayn dorixona — yangiliklar, dorilar, filiallar." },
    ],
  }),
});

type News = { id: string; title: string; body: string | null; image_url: string | null };

function NewsCarousel({ items }: { items: News[] }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (items.length < 2) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % items.length), 5000);
    return () => clearInterval(id);
  }, [items.length]);

  if (items.length === 0) return null;
  const cur = items[idx];

  const prev = () => setIdx((i) => (i - 1 + items.length) % items.length);
  const next = () => setIdx((i) => (i + 1) % items.length);

  return (
    <div className="relative w-full h-[280px] md:h-[420px] rounded-2xl overflow-hidden shadow-lg group">
      {cur.image_url ? (
        <img src={cur.image_url} alt={cur.title} className="w-full h-full object-cover transition-opacity duration-500" />
      ) : (
        <div className="w-full h-full gradient-primary" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white max-w-2xl">
        <h3 className="text-2xl md:text-3xl font-bold mb-2 drop-shadow">{cur.title}</h3>
        {cur.body && <p className="text-sm md:text-base opacity-90 line-clamp-2">{cur.body}</p>}
      </div>
      {items.length > 1 && (
        <>
          <button onClick={prev} aria-label="prev" className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur rounded-full p-2 text-white transition">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button onClick={next} aria-label="next" className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur rounded-full p-2 text-white transition">
            <ChevronRight className="h-6 w-6" />
          </button>
          <div className="absolute bottom-3 right-4 flex gap-1">
            {items.map((_, i) => (
              <span key={i} className={`h-1.5 rounded-full transition-all ${i === idx ? "w-6 bg-white" : "w-1.5 bg-white/50"}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Home() {
  const { t, i18n } = useTranslation();
  const currentLang: "latin" | "cyrillic" = i18n.language === "uz_cyrl" ? "cyrillic" : "latin";

  const { data: news = [], isLoading: newsLoading } = useQuery({
    queryKey: ["news-home"],
    queryFn: async () => {
      const { data } = await supabase.from("news").select("id, title, body, image_url").order("created_at", { ascending: false }).limit(8);
      return (data ?? []) as News[];
    },
  });

  const { data: medicines = [], isLoading: medsLoading } = useQuery({
    queryKey: ["medicines-home", currentLang],
    queryFn: async () => {
      const { data } = await supabase.from("medicines").select("*").eq("language", currentLang).order("created_at", { ascending: false }).limit(8);
      return (data ?? []) as Medicine[];
    },
  });

  return (
    <div className="container mx-auto px-6 md:px-10 lg:px-16 py-8 space-y-16">
      {/* Hero */}
      <section className="grid md:grid-cols-2 gap-10 items-center py-10 md:py-16">
        <div className="space-y-6 ml-5">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05]">
            <span className="text-primary">MediLife</span>
            <span className="block mt-2">{t("home.hero_title")}</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl">{t("home.hero_sub")}</p>
          <div className="flex flex-nowrap gap-3">
            <Link to="/dorilar"><Button size="lg" className="gap-2">{t("home.cta")} <ArrowRight className="h-4 w-4" /></Button></Link>
            <Link to="/filiallar"><Button size="lg" variant="outline">{t("nav.branches")}</Button></Link>
          </div>
        </div>
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 gradient-primary rounded-full blur-3xl opacity-40 scale-110" />
            <img src={logo} alt="MediLife" className="relative w-80 h-80 md:w-[420px] md:h-[420px] lg:w-[480px] lg:h-[480px] object-cover rounded-3xl shadow-2xl" />
          </div>
        </div>
      </section>

      {/* News */}
      <section id="yangiliklar">
        <h2 className="text-3xl font-bold mb-6">{t("home.news_title")}</h2>
        {newsLoading ? <p className="text-muted-foreground">{t("common.loading")}</p> : news.length > 0 ? <NewsCarousel items={news} /> : <p className="text-muted-foreground">{t("news.empty")}</p>}
      </section>

      {/* Medicines */}
      <section id="dorilar">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-3xl font-bold">{t("home.medicines_title")}</h2>
          <Link to="/dorilar"><Button variant="ghost" className="gap-1">{t("common.search")} <ArrowRight className="h-4 w-4" /></Button></Link>
        </div>
        {medsLoading ? (
          <p className="text-muted-foreground">{t("common.loading")}</p>
        ) : medicines.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {medicines.map((m) => <MedicineCard key={m.id} m={m} />)}
          </div>
        ) : (
          <p className="text-muted-foreground">{t("medicines.empty")}</p>
        )}
      </section>

      {/* About */}
      <section id="about" className="rounded-2xl gradient-primary p-8 md:p-12 text-primary-foreground">
        <h2 className="text-3xl font-bold mb-3">{t("home.about_title")}</h2>
        <p className="text-lg opacity-90 max-w-3xl">{t("home.about_text")}</p>
      </section>
    </div>
  );
}
