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

export const Route = createFileRoute("/register")({
  component: RegisterPage,
  head: () => ({
    meta: [
      { title: "Ro'yxatdan o'tish — MediLife dorixona" },
      { name: "description", content: "Telefon raqamingiz bilan MediLife dorixonada tez ro'yxatdan o'ting." },
      { property: "og:title", content: "Ro'yxatdan o'tish — MediLife dorixona" },
      { property: "og:description", content: "Telefon raqam va tasdiqlash kodi bilan ro'yxatdan o'tish." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState<"phone" | "code" | "name">("phone");
  const [phone, setPhone] = useState("+998 ");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidPhone(phone)) return toast.error("Telefon raqamni to'liq kiriting");
    setLoading(true);
    try {
      const res = await requestPhoneCode({ data: { phone, mode: "register" } });
      if (res.first_name && !name) setName(res.first_name);
      toast.success("Tasdiqlash kodi yuborildi");
      setStep("code");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Kod yuborilmadi");
    } finally {
      setLoading(false);
    }
  };

  const checkCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return toast.error("6 xonalik kodni kiriting");
    setLoading(true);
    try {
      await verifyPhoneCode({ data: { phone, code, consume: false } });
      setStep("name");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Kod noto'g'ri");
    } finally {
      setLoading(false);
    }
  };

  const finish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) return toast.error("Ismni kiriting");
    setLoading(true);
    try {
      const res = await verifyPhoneCode({ data: { phone, code, full_name: name.trim() } });
      if (!res.token_hash) throw new Error("Sessiya yaratilmadi");
      const { error } = await supabase.auth.verifyOtp({ token_hash: res.token_hash, type: "email" });
      if (error) throw new Error(error.message);
      toast.success(t("auth.success_signup"));
      navigate({ to: "/" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-md">
      <Card className="p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">{t("auth.register")}</h1>

        {step === "phone" && (
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
        )}

        {step === "code" && (
          <form onSubmit={checkCode} className="space-y-4">
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
              {loading ? "Tekshirilmoqda..." : "Davom etish"}
            </Button>
            <Button type="button" variant="ghost" className="w-full" onClick={() => { setStep("phone"); setCode(""); }}>
              Raqamni o'zgartirish
            </Button>
          </form>
        )}

        {step === "name" && (
          <form onSubmit={finish} className="space-y-4">
            <div className="space-y-1">
              <Label>{t("auth.full_name")}</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={100} required autoFocus />
            </div>
            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? "Yaratilmoqda..." : t("auth.register")}
            </Button>
          </form>
        )}

        <p className="text-sm text-center mt-4 text-muted-foreground">
          Akkauntingiz bormi? <Link to="/login" className="text-primary font-medium">{t("auth.login")}</Link>
        </p>
      </Card>
    </div>
  );
}
