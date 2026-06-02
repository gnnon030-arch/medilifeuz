import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Phone, Mail, MapPin } from "lucide-react";
import logo from "@/assets/medilife-logo.jpg";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

export function Footer() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAdmin, user } = useAuth();

  const openAdmin = () => {
    if (!user) {
      toast.error("Avval tizimga kiring");
      navigate({ to: "/login" });
      return;
    }
    if (!isAdmin) {
      toast.error("Sizda admin huquqi yo'q");
      return;
    }
    navigate({ to: "/admin" });
  };


  return (
    <footer className="border-t bg-card mt-16">
      <div className="container mx-auto px-4 py-10 grid gap-8 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <img src={logo} alt="MediLife" className="h-10 w-10 rounded-md object-cover" />
            <span className="font-bold text-xl text-primary">MediLife</span>
          </div>
          <p className="text-sm text-muted-foreground">{t("footer.tagline")}</p>
        </div>
        <div>
          <h3 className="font-semibold mb-3">{t("footer.call_center")}</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> <a href="tel:+998902608888">+998 90 260 88 88</a></li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> <a href="mailto:gnnon030@gmail.com">gnnon030@gmail.com</a></li>
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> {t("footer.address")}</li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-3">{t("footer.manager")}</h3>
          <p className="text-sm text-muted-foreground">{t("footer.manager_name")}</p>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="text-sm text-muted-foreground mt-4 hover:text-foreground transition-colors cursor-default select-none"
            title=""
          >
            {t("footer.rights")}
          </button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setPwd(""); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Admin panel</DialogTitle></DialogHeader>
          <form onSubmit={submit} className="space-y-3">
            <Input
              type="password"
              placeholder="Parol"
              autoFocus
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
            />
            <Button type="submit" className="w-full">Kirish</Button>
          </form>
        </DialogContent>
      </Dialog>
    </footer>
  );
}
