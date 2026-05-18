import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({ meta: [{ title: "Admin — MediLife" }] }),
});

function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => { if (!loading && (!user || !isAdmin)) navigate({ to: "/" }); }, [loading, user, isAdmin, navigate]);
  if (!user || !isAdmin) return null;

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
      <Tabs defaultValue="news">
        <TabsList>
          <TabsTrigger value="news">Yangiliklar</TabsTrigger>
          <TabsTrigger value="medicines">Dorilar</TabsTrigger>
          <TabsTrigger value="branches">Filiallar</TabsTrigger>
          <TabsTrigger value="orders">Buyurtmalar</TabsTrigger>
        </TabsList>
        <TabsContent value="news" className="mt-6"><NewsAdmin /></TabsContent>
        <TabsContent value="medicines" className="mt-6"><MedicinesAdmin /></TabsContent>
        <TabsContent value="branches" className="mt-6"><BranchesAdmin /></TabsContent>
        <TabsContent value="orders" className="mt-6"><OrdersAdmin /></TabsContent>
      </Tabs>
    </div>
  );
}

async function uploadFile(file: File): Promise<string | null> {
  const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
  const { error } = await supabase.storage.from("media").upload(path, file);
  if (error) { toast.error(error.message); return null; }
  return supabase.storage.from("media").getPublicUrl(path).data.publicUrl;
}

function ImageInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [busy, setBusy] = useState(false);
  return (
    <div className="space-y-2">
      <Input placeholder="Rasm URL" value={value} onChange={(e) => onChange(e.target.value)} />
      <Input type="file" accept="image/*" disabled={busy} onChange={async (e) => {
        const f = e.target.files?.[0]; if (!f) return;
        setBusy(true);
        const url = await uploadFile(f);
        setBusy(false);
        if (url) onChange(url);
      }} />
      {value && <img src={value} alt="" className="h-20 rounded object-cover" />}
    </div>
  );
}

/* ---------------- NEWS ---------------- */
function NewsAdmin() {
  const { data = [], refetch } = useQuery({ queryKey: ["admin-news"], queryFn: async () => (await supabase.from("news").select("*").order("created_at", { ascending: false })).data ?? [] });
  const [editing, setEditing] = useState<any | null>(null);
  const [open, setOpen] = useState(false);

  const save = async (n: any) => {
    const payload = { title: n.title, body: n.body, image_url: n.image_url || null };
    const { error } = n.id ? await supabase.from("news").update(payload).eq("id", n.id) : await supabase.from("news").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Saqlandi"); setOpen(false); refetch();
  };

  return (
    <div className="space-y-4">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild><Button onClick={() => setEditing({ title: "", body: "", image_url: "" })} className="gap-1"><Plus className="h-4 w-4" /> Qo'shish</Button></DialogTrigger>
        <DialogContent>
          <DialogHeader><DialogTitle>Yangilik</DialogTitle></DialogHeader>
          {editing && <div className="space-y-3">
            <div><Label>Sarlavha</Label><Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
            <div><Label>Matn</Label><Textarea rows={4} value={editing.body ?? ""} onChange={(e) => setEditing({ ...editing, body: e.target.value })} /></div>
            <div><Label>Rasm</Label><ImageInput value={editing.image_url ?? ""} onChange={(v) => setEditing({ ...editing, image_url: v })} /></div>
            <Button onClick={() => save(editing)} className="w-full">Saqlash</Button>
          </div>}
        </DialogContent>
      </Dialog>
      <div className="grid md:grid-cols-2 gap-3">
        {data.map((n: any) => (
          <Card key={n.id} className="p-3 flex gap-3">
            {n.image_url && <img src={n.image_url} alt="" className="h-16 w-16 object-cover rounded" />}
            <div className="flex-1 min-w-0"><h3 className="font-medium truncate">{n.title}</h3><p className="text-xs text-muted-foreground line-clamp-2">{n.body}</p></div>
            <div className="flex flex-col gap-1">
              <Button size="icon" variant="ghost" onClick={() => { setEditing(n); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" onClick={async () => { if (confirm("O'chirish?")) { await supabase.from("news").delete().eq("id", n.id); refetch(); } }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ---------------- MEDICINES ---------------- */
function MedicinesAdmin() {
  const { data = [], refetch } = useQuery({ queryKey: ["admin-meds"], queryFn: async () => (await supabase.from("medicines").select("*").order("created_at", { ascending: false })).data ?? [] });
  const [editing, setEditing] = useState<any | null>(null);
  const [open, setOpen] = useState(false);

  const save = async (m: any) => {
    const payload = { name: m.name, description: m.description, image_url: m.image_url || null, price: Number(m.price) || 0, unit: m.unit, stock: parseInt(m.stock) || 0 };
    const { error } = m.id ? await supabase.from("medicines").update(payload).eq("id", m.id) : await supabase.from("medicines").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Saqlandi"); setOpen(false); refetch();
  };

  return (
    <div className="space-y-4">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild><Button onClick={() => setEditing({ name: "", description: "", image_url: "", price: 0, unit: "1 dona", stock: 0 })} className="gap-1"><Plus className="h-4 w-4" /> Qo'shish</Button></DialogTrigger>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Dori</DialogTitle></DialogHeader>
          {editing && <div className="space-y-3">
            <div><Label>Nomi</Label><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
            <div><Label>Tavsif</Label><Textarea rows={3} value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
            <div><Label>Rasm (URL yoki yuklash)</Label><ImageInput value={editing.image_url ?? ""} onChange={(v) => setEditing({ ...editing, image_url: v })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Narx (so'm)</Label><Input type="number" value={editing.price} onChange={(e) => setEditing({ ...editing, price: e.target.value })} /></div>
              <div><Label>Birlik</Label><Input value={editing.unit} placeholder="1 dona / 1 paket / 1 g" onChange={(e) => setEditing({ ...editing, unit: e.target.value })} /></div>
            </div>
            <div><Label>Mavjud miqdor</Label><Input type="number" value={editing.stock} onChange={(e) => setEditing({ ...editing, stock: e.target.value })} /></div>
            <Button onClick={() => save(editing)} className="w-full">Saqlash</Button>
          </div>}
        </DialogContent>
      </Dialog>
      <div className="grid md:grid-cols-2 gap-3">
        {data.map((m: any) => (
          <Card key={m.id} className="p-3 flex gap-3">
            {m.image_url && <img src={m.image_url} alt="" className="h-16 w-16 object-cover rounded" />}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate">{m.name}</h3>
              <p className="text-xs text-muted-foreground">{Number(m.price).toLocaleString()} so'm · {m.unit} · qoldiq: {m.stock}</p>
            </div>
            <div className="flex flex-col gap-1">
              <Button size="icon" variant="ghost" onClick={() => { setEditing(m); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" onClick={async () => { if (confirm("O'chirish?")) { await supabase.from("medicines").delete().eq("id", m.id); refetch(); } }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ---------------- BRANCHES ---------------- */
function BranchesAdmin() {
  const { data = [], refetch } = useQuery({ queryKey: ["admin-branches"], queryFn: async () => (await supabase.from("branches").select("*").order("created_at", { ascending: false })).data ?? [] });
  const [editing, setEditing] = useState<any | null>(null);
  const [open, setOpen] = useState(false);

  const save = async (b: any) => {
    const payload = { name: b.name, image_url: b.image_url || null, phone: b.phone, address: b.address, map_url: b.map_url };
    const { error } = b.id ? await supabase.from("branches").update(payload).eq("id", b.id) : await supabase.from("branches").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Saqlandi"); setOpen(false); refetch();
  };

  return (
    <div className="space-y-4">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild><Button onClick={() => setEditing({ name: "", image_url: "", phone: "", address: "", map_url: "" })} className="gap-1"><Plus className="h-4 w-4" /> Qo'shish</Button></DialogTrigger>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Filial</DialogTitle></DialogHeader>
          {editing && <div className="space-y-3">
            <div><Label>Nomi</Label><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
            <div><Label>Rasm</Label><ImageInput value={editing.image_url ?? ""} onChange={(v) => setEditing({ ...editing, image_url: v })} /></div>
            <div><Label>Telefon</Label><Input value={editing.phone ?? ""} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} /></div>
            <div><Label>Manzil</Label><Input value={editing.address ?? ""} onChange={(e) => setEditing({ ...editing, address: e.target.value })} /></div>
            <div><Label>Google Maps URL</Label><Input value={editing.map_url ?? ""} placeholder="https://www.google.com/maps/..." onChange={(e) => setEditing({ ...editing, map_url: e.target.value })} /></div>
            <Button onClick={() => save(editing)} className="w-full">Saqlash</Button>
          </div>}
        </DialogContent>
      </Dialog>
      <div className="grid md:grid-cols-2 gap-3">
        {data.map((b: any) => (
          <Card key={b.id} className="p-3 flex gap-3">
            {b.image_url && <img src={b.image_url} alt="" className="h-16 w-16 object-cover rounded" />}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate">{b.name}</h3>
              <p className="text-xs text-muted-foreground truncate">{b.phone} · {b.address}</p>
            </div>
            <div className="flex flex-col gap-1">
              <Button size="icon" variant="ghost" onClick={() => { setEditing(b); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" onClick={async () => { if (confirm("O'chirish?")) { await supabase.from("branches").delete().eq("id", b.id); refetch(); } }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ---------------- ORDERS ---------------- */
function OrdersAdmin() {
  const { data = [], refetch } = useQuery({ queryKey: ["admin-orders"], queryFn: async () => (await supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false })).data ?? [] });
  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Holat o'zgartirildi"); refetch();
  };

  return (
    <div className="space-y-3">
      {data.map((o: any) => (
        <Card key={o.id} className="p-4">
          <div className="flex justify-between mb-2">
            <div>
              <p className="font-medium">{o.customer_name} · {o.customer_phone}</p>
              <p className="text-xs text-muted-foreground">#{o.id.slice(0, 8)} · {new Date(o.created_at).toLocaleString()} · {o.delivery_type === "courier" ? "Kuryer" : "O'zi"}</p>
            </div>
            <Select value={o.status} onValueChange={(v) => setStatus(o.id, v)}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Kutilmoqda</SelectItem>
                <SelectItem value="confirmed">Tasdiqlangan</SelectItem>
                <SelectItem value="delivering">Yetkazilmoqda</SelectItem>
                <SelectItem value="delivered">Yetkazildi</SelectItem>
                <SelectItem value="cancelled">Bekor</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <ul className="text-sm space-y-0.5">
            {o.order_items?.map((i: any) => <li key={i.id}>• {i.medicine_name} × {i.quantity} = {Number(i.line_total).toLocaleString()}</li>)}
          </ul>
          <p className="text-right font-semibold mt-2">Jami: {Number(o.total).toLocaleString()} so'm</p>
        </Card>
      ))}
    </div>
  );
}
