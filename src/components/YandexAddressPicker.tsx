import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

declare global {
  interface Window {
    ymaps?: any;
  }
}

const SCRIPT_ID = "yandex-maps-js";
const SCRIPT_SRC = "https://api-maps.yandex.ru/2.1/?lang=ru_RU";

function loadYmaps(): Promise<any> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("SSR"));
    if (window.ymaps) {
      window.ymaps.ready(() => resolve(window.ymaps));
      return;
    }
    let s = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (!s) {
      s = document.createElement("script");
      s.id = SCRIPT_ID;
      s.src = SCRIPT_SRC;
      s.async = true;
      document.head.appendChild(s);
    }
    s.addEventListener("load", () => window.ymaps?.ready(() => resolve(window.ymaps)));
    s.addEventListener("error", () => reject(new Error("Yandex Maps yuklanmadi")));
  });
}

export function YandexAddressPicker({ onPick }: { onPick: (address: string) => void }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [picked, setPicked] = useState<string>("");
  const mapDiv = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const placemark = useRef<any>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    loadYmaps()
      .then((ymaps) => {
        if (cancelled || !mapDiv.current) return;
        // Namangan center
        const center = [40.9983, 71.6726];
        mapInstance.current = new ymaps.Map(mapDiv.current, {
          center,
          zoom: 13,
          controls: ["zoomControl", "searchControl", "geolocationControl"],
        });

        const resolveCoords = async (coords: number[]) => {
          const res = await ymaps.geocode(coords);
          const first = res.geoObjects.get(0);
          const addr = first?.getAddressLine?.() ?? `${coords[0].toFixed(5)}, ${coords[1].toFixed(5)}`;
          setPicked(addr);
          if (!placemark.current) {
            placemark.current = new ymaps.Placemark(coords, { iconCaption: addr }, { preset: "islands#redDotIconWithCaption" });
            mapInstance.current.geoObjects.add(placemark.current);
          } else {
            placemark.current.geometry.setCoordinates(coords);
            placemark.current.properties.set("iconCaption", addr);
          }
        };

        mapInstance.current.events.add("click", (e: any) => resolveCoords(e.get("coords")));
        setLoading(false);
      })
      .catch(() => setLoading(false));

    return () => {
      cancelled = true;
      try {
        mapInstance.current?.destroy?.();
      } catch {}
      mapInstance.current = null;
      placemark.current = null;
    };
  }, [open]);

  const confirm = () => {
    if (picked) onPick(picked);
    setOpen(false);
  };

  return (
    <>
      <Button type="button" variant="outline" onClick={() => setOpen(true)} className="w-full">
        <MapPin className="h-4 w-4 mr-2" />
        {t("cart.address_map_btn")}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{t("cart.address_map")}</DialogTitle>
          </DialogHeader>
          <div ref={mapDiv} className="w-full h-[420px] rounded-md bg-muted" />
          {loading && <p className="text-sm text-muted-foreground">{t("common.loading")}</p>}
          {picked && (
            <p className="text-sm">
              <span className="text-muted-foreground">{t("cart.address_picked")}:</span> <span className="font-medium">{picked}</span>
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>{t("common.close")}</Button>
            <Button onClick={confirm} disabled={!picked}>{t("common.confirm")}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
