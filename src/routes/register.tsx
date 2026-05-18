import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { formatPhone, isValidPhone } from "@/lib/phone";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
  head: () => ({ meta: [{ title: "Ro'yxatdan o'tish — MediLife" }] }),
});

function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+998 ");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Ismni kiriting");
    if (!isValidPhone(phone)) return toast.error(t("auth.phone_invalid"));
    if (password !== confirm) return toast.error(t("auth.passwords_mismatch"));
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: name.trim(), phone },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success(t("auth.success_signup"));
    navigate({ to: "/" });
  };

  const onGoogle = async () => {
    setLoading(true);
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (res.error) { setLoading(false); return toast.error(res.error.message ?? "Google failed"); }
    if (res.redirected) return;
    navigate({ to: "/profil" });
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-md">
      <Card className="p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">{t("auth.register")}</h1>
        <Button onClick={onGoogle} disabled={loading} variant="outline" className="w-full mb-4" size="lg">{t("auth.google")}</Button>
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">yoki</span></div>
        </div>
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="space-y-1"><Label>{t("auth.full_name")}</Label><Input value={name} onChange={(e) => setName(e.target.value)} required maxLength={100} /></div>
          <div className="space-y-1"><Label>{t("auth.phone")}</Label><Input value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} placeholder="+998 90 123 45 67" required /></div>
          <div className="space-y-1"><Label>{t("auth.email")}</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          <div className="space-y-1"><Label>{t("auth.password")}</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} /></div>
          <div className="space-y-1"><Label>{t("auth.confirm_password")}</Label><Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={6} /></div>
          <Button type="submit" disabled={loading} className="w-full" size="lg">{t("auth.register")}</Button>
        </form>
        <p className="text-sm text-center mt-4 text-muted-foreground">
          Akkauntingiz bormi? <Link to="/login" className="text-primary font-medium">{t("auth.login")}</Link>
        </p>
      </Card>
    </div>
  );
}
