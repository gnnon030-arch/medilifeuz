import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { formatPhone, isValidPhone } from "@/lib/phone";
import { requestPhoneCode, verifyPhoneCode } from "@/lib/auth-phone.functions";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Kirish — MediLife dorixona" },
      { name: "description", content: "MediLife onlayn dorixonaga telefon raqamingiz va SMS kod bilan kiring." },
      { property: "og:title", content: "Kirish — MediLife dorixona" },
      { property: "og:description", content: "Telefon raqam va tasdiqlash kodi bilan tez kirish." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("+998 ");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidPhone(phone)) return toast.error("Telefon raqamni to'liq kiriting");
    setLoading(true);
    try {
      await requestPhoneCode({ data: { phone, mode: "login" } });
      toast.success("Tasdiqlash kodi yuborildi");
      setStep("code");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Kod yuborilmadi");
    } finally {
      setLoading(false);
    }
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return toast.error("6 xonalik kodni kiriting");
    setLoading(true);
    try {
      const res = await verifyPhoneCode({ data: { phone, code } });
      if (!res.token_hash) throw new Error("Sessiya yaratilmadi");
      const { error } = await supabase.auth.verifyOtp({ token_hash: res.token_hash, type: "email" });
      if (error) throw new Error(error.message);
      toast.success(t("auth.success_login"));
      navigate({ to: "/" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Kod noto'g'ri");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-md">
      <Card className="p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">{t("auth.login")}</h1>

        {step === "phone" ? (
          <form onSubmit={sendCode} className="space-y-4">
            <div className="space-y-1">
              <Label>{t("auth.phone")}</Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                placeholder="+998 90 123 45 67"
                inputMode="tel"
                autoComplete="tel"
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? "Yuborilmoqda..." : "Kod olish"}
            </Button>
          </form>
        ) : (
          <form onSubmit={verify} className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              {phone} raqamiga yuborilgan 6 xonalik kodni kiriting
            </p>
            <div className="space-y-1">
              <Label>Tasdiqlash kodi</Label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="123456"
                inputMode="numeric"
                maxLength={6}
                className="text-center text-2xl tracking-[0.35em]"
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? "Tekshirilmoqda..." : "Kirish"}
            </Button>
            <Button type="button" variant="ghost" className="w-full" onClick={() => { setStep("phone"); setCode(""); }}>
              Raqamni o'zgartirish
            </Button>
          </form>
        )}

        <p className="text-sm text-center mt-4 text-muted-foreground">
          Akkauntingiz yo'qmi? <Link to="/register" className="text-primary font-medium">{t("auth.register")}</Link>
        </p>
      </Card>
    </div>
  );
}
