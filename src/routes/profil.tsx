import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { formatPhone, isValidPhone } from "@/lib/phone";

export const Route = createFileRoute("/profil")({
  component: ProfilePage,
  head: () => ({ meta: [{ title: "Profil — MediLife" }] }),
});

function ProfilePage() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+998 ");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/login" });
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).single().then(({ data }) => {
      if (data) {
        setName(data.full_name ?? "");
        setPhone(data.phone ? formatPhone(data.phone) : "+998 ");
      }
    });
  }, [user]);

  const save = async () => {
    if (!user) return;
    if (!isValidPhone(phone)) return toast.error(t("auth.phone_invalid"));
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ full_name: name, phone }).eq("id", user.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Saqlandi");
  };

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-10 max-w-xl">
      <h1 className="text-3xl font-bold mb-6">{t("nav.profile")}</h1>
      <Card className="p-6 space-y-4">
        <div><Label>{t("auth.email")}</Label><Input value={user.email ?? ""} disabled /></div>
        <div><Label>{t("auth.full_name")}</Label><Input value={name} onChange={(e) => setName(e.target.value)} maxLength={100} /></div>
        <div><Label>{t("auth.phone")}</Label><Input value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} placeholder="+998 90 123 45 67" /></div>
        <Button onClick={save} disabled={saving} className="w-full">{saving ? t("common.loading") : t("common.save")}</Button>
      </Card>
    </div>
  );
}
