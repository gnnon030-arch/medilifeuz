import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Phone, MapPin, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GOOGLE_MAPS_API_KEY } from "@/lib/admin";

export const Route = createFileRoute("/filiallar")({
  component: BranchesPage,
  head: () => ({ meta: [{ title: "Filiallar — MediLife" }] }),
});

function BranchesPage() {
  const { t } = useTranslation();
  const { data = [] } = useQuery({
    queryKey: ["branches-all"],
    queryFn: async () => {
      const { data } = await supabase.from("branches").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-4xl font-bold mb-8">{t("branches.title")}</h1>
      {data.length === 0 ? (
        <p className="text-muted-foreground">Hozircha filiallar qo'shilmagan.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {data.map((b: any) => {
            const q = encodeURIComponent(b.address || b.name || "Namangan");
            const mapType = b.map_type || "google";
            let embedSrc: string | null = null;
            if (mapType === "google") {
              embedSrc = `https://www.google.com/maps?q=${q}&output=embed`;
            } else if (mapType === "yandex") {
              embedSrc = `https://yandex.uz/map-widget/v1/?text=${q}&z=15&l=map`;
            }
            return (
              <Card key={b.id} className="overflow-hidden">
                {b.image_url && (
                  <img
                    src={b.image_url}
                    alt={b.name}
                    className="w-full h-48 object-cover"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                  />
                )}
                <div className="p-5 space-y-3">
                  <h3 className="text-xl font-semibold">{b.name}</h3>
                  {b.address && <p className="text-sm flex items-start gap-2"><MapPin className="h-4 w-4 mt-0.5 text-primary shrink-0" />{b.address}</p>}
                  {b.phone && <p className="text-sm flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /><a href={`tel:${b.phone}`}>{b.phone}</a></p>}
                  {embedSrc && (
                    <div className="aspect-video rounded-md overflow-hidden border">
                      <iframe
                        src={embedSrc}
                        width="100%" height="100%" style={{ border: 0 }} loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade" title={b.name}
                        allowFullScreen
                      />
                    </div>
                  )}
                  {b.map_url && (
                    <a href={b.map_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="gap-2"><ExternalLink className="h-4 w-4" /> {t("branches.view_map")}</Button>
                    </a>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
// GOOGLE_MAPS_API_KEY kept imported in case of future embed-v1 usage
void GOOGLE_MAPS_API_KEY;
