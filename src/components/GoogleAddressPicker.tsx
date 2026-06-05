import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

function hideGoogleMapError() {
  document.querySelectorAll<HTMLElement>(".gm-err-container, .gm-err-content").forEach((el) => {
    el.style.display = "none";
  });
}

function watchGoogleMapError(container: HTMLElement, onFail: () => void) {
  const check = () => {
    const errorNode = container.querySelector(".gm-err-container, .gm-err-content");
    if (!errorNode) return;
    hideGoogleMapError();
    onFail();
  };
  const observer = new MutationObserver(check);
  observer.observe(container, { childList: true, subtree: true });
  check();
  return () => observer.disconnect();
}

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
      s.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&loading=async&callback=__gmapsInit`;
      s.onerror = () => {
        hideGoogleMapError();
        reject(new Error("Google Maps yuklanmadi"));
      };
      document.head.appendChild(s);
    } else {
      const check = setInterval(() => {
        if (window.google?.maps) { clearInterval(check); resolve(window.google); }
      }, 100);
    }
  });
}

export function GoogleAddressPicker({ onPick }: { onPick: (address: string, mapUrl?: string) => void }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mapFailed, setMapFailed] = useState(false);
  const [picked, setPicked] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const mapDiv = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);

  const setMarker = (lat: number, lng: number) => {
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
    setCoords({ lat, lng });
    setPicked(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    try {
      geocoderRef.current?.geocode({ location: pos }, (res: any[], status: string) => {
        if (status === "OK" && res[0]?.formatted_address) setPicked(res[0].formatted_address);
      });
    } catch {}
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setMarker(pos.coords.latitude, pos.coords.longitude),
      () => {},
      { enableHighAccuracy: true, timeout: 10_000 }
    );
  };


  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    let stopWatching: (() => void) | undefined;
    setLoading(true);
    setMapFailed(false);
    loadGmaps()
      .then((g) => {
        if (cancelled || !mapDiv.current) return;
        const center = { lat: 40.9983, lng: 71.6726 };
        mapRef.current = new g.maps.Map(mapDiv.current, { center, zoom: 13 });
        stopWatching = watchGoogleMapError(mapDiv.current, () => {
          setMapFailed(true);
          setLoading(false);
        });
        geocoderRef.current = new g.maps.Geocoder();
        mapRef.current.addListener("click", (e: any) => setMarker(e.latLng.lat(), e.latLng.lng()));
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        hideGoogleMapError();
        setMapFailed(true);
        setLoading(false);
      });
    return () => { cancelled = true; stopWatching?.(); markerRef.current = null; mapRef.current = null; };
  }, [open]);

  const confirm = () => {
    if (picked) {
      const url = coords ? `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}` : undefined;
      onPick(picked, url);
    }
    setOpen(false);
  };

  return (
    <>
      <Button type="button" variant="outline" onClick={() => setOpen(true)} className="w-full">
        <MapPin className="h-4 w-4 mr-2" />
        {t("cart.address_map_btn_google")}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{t("cart.address_map_google")}</DialogTitle>
            <DialogDescription>{t("cart.map_hint")}</DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={useMyLocation} className="gap-2">
              <LocateFixed className="h-4 w-4" /> {t("cart.my_location")}
            </Button>
            <p className="text-xs text-muted-foreground self-center">{t("cart.map_hint")}</p>
          </div>
          <div ref={mapDiv} className="w-full h-[420px] rounded-md bg-muted" />
          {loading && <p className="text-sm text-muted-foreground">{t("common.loading")}</p>}
          {mapFailed && <p className="text-sm text-muted-foreground">{t("cart.google_map_unavailable")}</p>}
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
