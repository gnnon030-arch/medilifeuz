import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, LocateFixed } from "lucide-react";
import { GOOGLE_MAPS_API_KEY } from "@/lib/admin";

declare global {
  interface Window {
    google?: any;
    __gmapsInit?: () => void;
  }
}

const SCRIPT_ID = "google-maps-js";

function loadGmaps(): Promise<any> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("SSR"));
    if (window.google?.maps) return resolve(window.google);
    let s = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (!s) {
      window.__gmapsInit = () => resolve(window.google);
      s = document.createElement("script");
      s.id = SCRIPT_ID;
      s.async = true;
      s.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=geocoding&loading=async&callback=__gmapsInit`;
      s.onerror = () => reject(new Error("Google Maps yuklanmadi"));
      document.head.appendChild(s);
    } else {
      const check = setInterval(() => {
        if (window.google?.maps) { clearInterval(check); resolve(window.google); }
      }, 100);
    }
  });
}

export function GoogleAddressPicker({ onPick }: { onPick: (address: string) => void }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [picked, setPicked] = useState("");
  const mapDiv = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);

  const setMarker = (lat: number, lng: number, autoConfirm = false) => {
    const g = window.google;
    if (!g || !mapRef.current) return;
    const pos = { lat, lng };
    if (!markerRef.current) {
      markerRef.current = new g.maps.Marker({ position: pos, map: mapRef.current, draggable: true });
      markerRef.current.addListener("dragend", (e: any) => setMarker(e.latLng.lat(), e.latLng.lng()));
    } else {
      markerRef.current.setPosition(pos);
    }
    mapRef.current.panTo(pos);
    geocoderRef.current?.geocode({ location: pos }, (res: any[], status: string) => {
      const addr = status === "OK" && res[0]?.formatted_address ? res[0].formatted_address : `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      setPicked(addr);
      if (autoConfirm) { onPick(addr); setOpen(false); }
    });
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setMarker(pos.coords.latitude, pos.coords.longitude, true),
      () => {},
      { enableHighAccuracy: true, timeout: 10_000 }
    );
  };

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    loadGmaps()
      .then((g) => {
        if (cancelled || !mapDiv.current) return;
        const center = { lat: 40.9983, lng: 71.6726 };
        mapRef.current = new g.maps.Map(mapDiv.current, { center, zoom: 13 });
        geocoderRef.current = new g.maps.Geocoder();
        mapRef.current.addListener("click", (e: any) => setMarker(e.latLng.lat(), e.latLng.lng()));
        setLoading(false);
      })
      .catch(() => setLoading(false));
    return () => { cancelled = true; markerRef.current = null; mapRef.current = null; };
  }, [open]);

  const confirm = () => { if (picked) onPick(picked); setOpen(false); };

  return (
    <>
      <Button type="button" variant="outline" onClick={() => setOpen(true)} className="w-full">
        <MapPin className="h-4 w-4 mr-2" />
        {t("cart.address_map_btn_google")}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>{t("cart.address_map_google")}</DialogTitle></DialogHeader>
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
