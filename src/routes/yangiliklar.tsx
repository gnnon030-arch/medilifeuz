import { createFileRoute } from "@tanstack/react-router";
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

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-4xl font-bold mb-8">{t("news.title")}</h1>
      {data.length === 0 ? (
        <p className="text-muted-foreground">{t("news.empty")}</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((n: any) => (
            <Card key={n.id} className="overflow-hidden">
              {n.image_url && <img src={n.image_url} alt={n.title} className="w-full h-48 object-cover" />}
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">{n.title}</h3>
                {n.body && <p className="text-sm text-muted-foreground whitespace-pre-wrap">{n.body}</p>}
                <p className="text-xs text-muted-foreground mt-3">{new Date(n.created_at).toLocaleDateString()}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
