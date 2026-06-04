import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, LocateFixed } from "lucide-react";
import { YANDEX_MAPS_API_KEY } from "@/lib/admin";

declare global {
  interface Window {
    ymaps?: any;
  }
}

const SCRIPT_ID = "yandex-maps-js";
const SCRIPT_SRC = `https://api-maps.yandex.ru/2.1/?apikey=${YANDEX_MAPS_API_KEY}&lang=ru_RU`;

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

export function YandexAddressPicker({ onPick }: { onPick: (address: string, mapUrl?: string) => void }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [picked, setPicked] = useState<string>("");
  const [coords, setCoords] = useState<number[] | null>(null);
  const mapDiv = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const placemark = useRef<any>(null);
  const ymapsRef = useRef<any>(null);

  const setMarker = async (coords: number[]) => {
    const ymaps = ymapsRef.current;
    if (!ymaps || !mapInstance.current) return;
    let addr = `${coords[0].toFixed(5)}, ${coords[1].toFixed(5)}`;
    try {
      const res = await ymaps.geocode(coords);
      const first = res.geoObjects.get(0);
      const got = first?.getAddressLine?.();
      if (got) addr = got;
    } catch {}
    setPicked(addr);
    setCoords(coords);
    if (!placemark.current) {
      placemark.current = new ymaps.Placemark(
        coords,
        { iconCaption: addr },
        { preset: "islands#redDotIconWithCaption", draggable: true }
      );
      placemark.current.events.add("dragend", () => {
        const c = placemark.current.geometry.getCoordinates();
        setMarker(c);
      });
      mapInstance.current.geoObjects.add(placemark.current);
    } else {
      placemark.current.geometry.setCoordinates(coords);
      placemark.current.properties.set("iconCaption", addr);
    }
    mapInstance.current.setCenter(coords, 16);
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setMarker([pos.coords.latitude, pos.coords.longitude]),
      () => {},
      { enableHighAccuracy: true, timeout: 10_000 }
    );
  };


  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    loadYmaps()
      .then((ymaps) => {
        if (cancelled || !mapDiv.current) return;
        ymapsRef.current = ymaps;
        const center = [40.9983, 71.6726]; // Namangan
        mapInstance.current = new ymaps.Map(mapDiv.current, {
          center,
          zoom: 13,
          controls: ["zoomControl", "searchControl", "geolocationControl"],
        });
        mapInstance.current.events.add("click", (e: any) => setMarker(e.get("coords")));
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
    if (picked) {
      const url = coords ? `https://yandex.com/maps/?ll=${coords[1]},${coords[0]}&z=17&pt=${coords[1]},${coords[0]}` : undefined;
      onPick(picked, url);
    }
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
          <div className="flex gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={useMyLocation} className="gap-2">
              <LocateFixed className="h-4 w-4" /> {t("cart.my_location")}
            </Button>
            <p className="text-xs text-muted-foreground self-center">{t("cart.map_hint")}</p>
          </div>
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
