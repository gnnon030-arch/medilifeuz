import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AuthCtx = {
  user: User | null;
  fullName: string | null;
  phone: string | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
};

const Ctx = createContext<AuthCtx>({ user: null, fullName: null, phone: null, session: null, loading: true, isAdmin: false });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [fullName, setFullName] = useState<string | null>(null);
  const [phone, setPhone] = useState<string | null>(null);

  const loadProfile = (uid: string, meta?: Record<string, unknown>) => {
    setFullName((prev) => prev ?? ((meta?.["full_name"] as string) || null));
    setPhone((prev) => prev ?? ((meta?.["phone"] as string) || null));
    supabase
      .from("profiles")
      .select("full_name, phone")
      .eq("id", uid)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.full_name) setFullName(data.full_name);
        if (data?.phone) setPhone(data.phone);
      });
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        setTimeout(async () => {
          const { data } = await supabase.from("user_roles").select("role").eq("user_id", s.user.id);
          setIsAdmin(!!data?.some((r) => r.role === "admin"));
        }, 0);
        loadProfile(s.user.id, s.user.user_metadata as Record<string, unknown>);
      } else {
        setIsAdmin(false);
        setFullName(null);
        setPhone(null);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
      if (data.session?.user) {
        loadProfile(data.session.user.id, data.session.user.user_metadata as Record<string, unknown>);
        supabase.from("user_roles").select("role").eq("user_id", data.session.user.id).then(({ data: r }) => {
          setIsAdmin(!!r?.some((x) => x.role === "admin"));
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return <Ctx.Provider value={{ user, fullName, phone, session, loading, isAdmin }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
