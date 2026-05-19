import { Link, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Moon, Sun, ShoppingCart, User as UserIcon, LogOut, Shield } from "lucide-react";
import logo from "@/assets/medilife-logo.jpg";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import i18n from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";

export function Header() {
  const { t } = useTranslation();
  const { count } = useCart();
  const { user } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  const changeLang = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("medilife-lang", lng);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  const linkCls = "px-3 py-2 rounded-md text-sm font-medium hover:bg-accent transition-colors";

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto flex h-16 items-center gap-2 px-4">
        <Link to="/" className="flex items-center gap-2 mr-auto">
          <img src={logo} alt="MediLife" className="h-10 w-10 rounded-md object-cover" />
          <span className="font-bold text-xl text-primary">MediLife</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 mx-auto">
          <Link to="/" className={linkCls} activeProps={{ className: linkCls + " text-primary" }} activeOptions={{ exact: true }}>{t("nav.home")}</Link>
          <Link to="/yangiliklar" className={linkCls} activeProps={{ className: linkCls + " text-primary" }}>{t("nav.news")}</Link>
          <Link to="/dorilar" className={linkCls} activeProps={{ className: linkCls + " text-primary" }}>{t("nav.medicines")}</Link>
          <Link to="/filiallar" className={linkCls} activeProps={{ className: linkCls + " text-primary" }}>{t("nav.branches")}</Link>
        </nav>

        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="font-semibold uppercase">
                {i18n.language}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => changeLang("uz")}>O'zbek</DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeLang("ru")}>Русский</DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeLang("en")}>English</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon" onClick={toggle} aria-label="theme">
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          <Link to="/savatcha">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {count > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 min-w-5 px-1 flex items-center justify-center" variant="default">
                  {count}
                </Badge>
              )}
            </Button>
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon"><UserIcon className="h-5 w-5" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate({ to: "/profil" })}>
                  <UserIcon className="h-4 w-4 mr-2" /> {t("nav.profile")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ to: "/buyurtmalarim" })}>
                  {t("nav.orders")}
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem onClick={() => navigate({ to: "/admin" })}>
                    <Shield className="h-4 w-4 mr-2" /> Admin
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="h-4 w-4 mr-2" /> {t("auth.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login">
              <Button variant="default" size="sm">{t("auth.login")}</Button>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile nav */}
      <nav className="md:hidden flex items-center justify-center gap-1 pb-2 px-2 overflow-x-auto">
        <Link to="/" className={linkCls} activeProps={{ className: linkCls + " text-primary" }} activeOptions={{ exact: true }}>{t("nav.home")}</Link>
        <Link to="/yangiliklar" className={linkCls} activeProps={{ className: linkCls + " text-primary" }}>{t("nav.news")}</Link>
        <Link to="/dorilar" className={linkCls} activeProps={{ className: linkCls + " text-primary" }}>{t("nav.medicines")}</Link>
        <Link to="/filiallar" className={linkCls} activeProps={{ className: linkCls + " text-primary" }}>{t("nav.branches")}</Link>
      </nav>
    </header>
  );
}
