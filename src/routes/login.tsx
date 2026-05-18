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

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Kirish — MediLife" }] }),
});

function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success(t("auth.success_login"));
    navigate({ to: "/" });
  };

  const onGoogle = async () => {
    setLoading(true);
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (res.error) {
      setLoading(false);
      toast.error(res.error.message ?? "Google sign-in failed");
      return;
    }
    if (res.redirected) return;
    setLoading(false);
    toast.success(t("auth.success_login"));
    navigate({ to: "/" });
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-md">
      <Card className="p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">{t("auth.login")}</h1>
        <Button onClick={onGoogle} disabled={loading} variant="outline" className="w-full mb-4" size="lg">
          {t("auth.google")}
        </Button>
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">yoki</span></div>
        </div>
        <form onSubmit={onEmail} className="space-y-3">
          <div className="space-y-1"><Label>{t("auth.email")}</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          <div className="space-y-1"><Label>{t("auth.password")}</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} /></div>
          <Button type="submit" disabled={loading} className="w-full" size="lg">{t("auth.login")}</Button>
        </form>
        <p className="text-sm text-center mt-4 text-muted-foreground">
          Akkauntingiz yo'qmi? <Link to="/register" className="text-primary font-medium">{t("auth.register")}</Link>
        </p>
      </Card>
    </div>
  );
}
