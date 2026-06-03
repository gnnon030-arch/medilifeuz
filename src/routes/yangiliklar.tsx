import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/yangiliklar")({
  component: NewsPage,
  head: () => ({ meta: [{ title: "Yangiliklar — MediLife" }] }),
});

function NewsPage() {
  const { t } = useTranslation();
  const { data = [] } = useQuery({
    queryKey: ["news-all"],
    queryFn: async () => {
      const { data } = await supabase.from("news").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (data.length <= 1) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % data.length), 6000);
    return () => clearInterval(id);
  }, [data.length]);

  const featured = data[idx];

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-4xl font-bold mb-8">{t("news.title")}</h1>
      {data.length === 0 ? (
        <p className="text-muted-foreground">{t("news.empty")}</p>
      ) : (
        <>
          {featured && (
            <Card key={featured.id} className="overflow-hidden mb-8 transition-all duration-700">
              {featured.image_url && <img src={featured.image_url} alt={featured.title} className="w-full h-64 md:h-80 object-cover" />}
              <div className="p-5">
                <h2 className="text-2xl font-semibold mb-2">{featured.title}</h2>
                {featured.body && <p className="text-muted-foreground whitespace-pre-wrap">{featured.body}</p>}
                <p className="text-xs text-muted-foreground mt-3">{new Date(featured.created_at).toLocaleDateString()}</p>
              </div>
              {data.length > 1 && (
                <div className="flex justify-center gap-1 pb-3">
                  {data.map((_: any, i: number) => (
                    <button key={i} onClick={() => setIdx(i)} className={`h-2 rounded-full transition-all ${i === idx ? "w-6 bg-primary" : "w-2 bg-muted-foreground/30"}`} aria-label={`slide ${i + 1}`} />
                  ))}
                </div>
              )}
            </Card>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.map((n: any) => (
              <Card key={n.id} className="overflow-hidden">
                {n.image_url && <img src={n.image_url} alt={n.title} className="w-full h-48 object-cover" />}
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2">{n.title}</h3>
                  {n.body && <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-4">{n.body}</p>}
                  <p className="text-xs text-muted-foreground mt-3">{new Date(n.created_at).toLocaleDateString()}</p>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
