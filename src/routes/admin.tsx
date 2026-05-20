import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, KeyRound, LogOut } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ADMIN_PANEL_PASSWORD, isAdminUnlocked, setAdminUnlocked } from "@/lib/admin";
import {
  adminDeleteBranch,
  adminDeleteMedicine,
  adminDeleteNews,
  adminDeleteUser,
  adminListBranches,
  adminListMedicines,
  adminListNews,
  adminListOrders,
  adminListUsers,
  adminResetPassword,
  adminSaveBranch,
  adminSaveMedicine,
  adminSaveNews,
  adminSetOrderStatus,
  adminUpdateUser,
  adminUploadMedia,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({ meta: [{ title: "Admin — MediLife" }] }),
});

function AdminPage() {
  const navigate = useNavigate();
  const [unlocked, setUnlocked] = useState(false);
  useEffect(() => { setUnlocked(isAdminUnlocked()); }, []);
  if (!unlocked) {
    return (
      <div className="container mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="text-2xl font-semibold">Admin panel yopiq</h1>
        <p className="text-muted-foreground">Saytning eng pastida © 2000 MediLife yozuviga bosib parol kiriting.</p>
        <Button onClick={() => navigate({ to: "/" })}>Bosh sahifaga qaytish</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <Button variant="outline" size="sm" onClick={() => { setAdminUnlocked(false); navigate({ to: "/" }); }} className="gap-2">
          <LogOut className="h-4 w-4" /> Chiqish
        </Button>
      </div>
      <Tabs defaultValue="news">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="news">Yangiliklar</TabsTrigger>
          <TabsTrigger value="medicines">Dorilar</TabsTrigger>
          <TabsTrigger value="branches">Filiallar</TabsTrigger>
          <TabsTrigger value="orders">Buyurtmalar</TabsTrigger>
          <TabsTrigger value="users">Foydalanuvchilar</TabsTrigger>
        </TabsList>
        <TabsContent value="news" className="mt-6"><NewsAdmin /></TabsContent>
        <TabsContent value="medicines" className="mt-6"><MedicinesAdmin /></TabsContent>
        <TabsContent value="branches" className="mt-6"><BranchesAdmin /></TabsContent>
        <TabsContent value="orders" className="mt-6"><OrdersAdmin /></TabsContent>
        <TabsContent value="users" className="mt-6"><UsersAdmin /></TabsContent>
      </Tabs>
    </div>
  );
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = () => reject(new Error("Rasmni o'qib bo'lmadi"));
    reader.readAsDataURL(file);
  });
}

function ImageInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const uploadFn = useServerFn(adminUploadMedia);
  const [busy, setBusy] = useState(false);
  return (
    <div className="space-y-2">
      <Input placeholder="Rasm URL" value={value} onChange={(e) => onChange(e.target.value)} />
      <Input type="file" accept="image/*" disabled={busy} onChange={async (e) => {
        const f = e.target.files?.[0]; if (!f) return;
        try {
          setBusy(true);
          const base64 = await fileToBase64(f);
          const { url } = await uploadFn({ data: { password: ADMIN_PANEL_PASSWORD, file_name: f.name, content_type: f.type || "application/octet-stream", base64 } });
          if (url) onChange(url);
        } catch (err: any) {
          toast.error(err.message || "Rasm yuklashda xatolik");
        } finally {
          setBusy(false);
        }
      }} />
      {value && <img src={value} alt="" className="h-20 rounded object-cover" />}
    </div>
  );
}

/* ---------------- NEWS ---------------- */
function NewsAdmin() {
  const listFn = useServerFn(adminListNews);
  const saveFn = useServerFn(adminSaveNews);
  const deleteFn = useServerFn(adminDeleteNews);
  const { data = [], refetch } = useQuery({ queryKey: ["admin-news"], queryFn: () => listFn({ data: { password: ADMIN_PANEL_PASSWORD } }) });
  const [editing, setEditing] = useState<any | null>(null);
  const [open, setOpen] = useState(false);

  const save = async (n: any) => {
    try {
      await saveFn({ data: { password: ADMIN_PANEL_PASSWORD, id: n.id, title: n.title, body: n.body, image_url: n.image_url || null } });
      toast.success("Saqlandi"); setOpen(false); refetch();
    } catch { toast.error("Saqlashda xatolik. Qayta urinib ko'ring."); }
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
              <Button size="icon" variant="ghost" onClick={async () => { if (confirm("O'chirish?")) { await deleteFn({ data: { password: ADMIN_PANEL_PASSWORD, id: n.id } }); refetch(); } }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ---------------- MEDICINES ---------------- */
function MedicinesAdmin() {
  const listFn = useServerFn(adminListMedicines);
  const saveFn = useServerFn(adminSaveMedicine);
  const deleteFn = useServerFn(adminDeleteMedicine);
  const { data = [], refetch } = useQuery({ queryKey: ["admin-meds"], queryFn: () => listFn({ data: { password: ADMIN_PANEL_PASSWORD } }) });
  const [editing, setEditing] = useState<any | null>(null);
  const [open, setOpen] = useState(false);

  const save = async (m: any) => {
    try {
      await saveFn({ data: { password: ADMIN_PANEL_PASSWORD, id: m.id, name: m.name, description: m.description, image_url: m.image_url || null, price: Number(m.price) || 0, unit: m.unit, stock: parseInt(m.stock) || 0 } });
      toast.success("Saqlandi"); setOpen(false); refetch();
    } catch { toast.error("Saqlashda xatolik. Qayta urinib ko'ring."); }
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
              <Button size="icon" variant="ghost" onClick={async () => { if (confirm("O'chirish?")) { await deleteFn({ data: { password: ADMIN_PANEL_PASSWORD, id: m.id } }); refetch(); } }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ---------------- BRANCHES ---------------- */
function BranchesAdmin() {
  const listFn = useServerFn(adminListBranches);
  const saveFn = useServerFn(adminSaveBranch);
  const deleteFn = useServerFn(adminDeleteBranch);
  const { data = [], refetch } = useQuery({ queryKey: ["admin-branches"], queryFn: () => listFn({ data: { password: ADMIN_PANEL_PASSWORD } }) });
  const [editing, setEditing] = useState<any | null>(null);
  const [open, setOpen] = useState(false);

  const save = async (b: any) => {
    try {
      await saveFn({ data: { password: ADMIN_PANEL_PASSWORD, id: b.id, name: b.name, image_url: b.image_url || null, phone: b.phone, address: b.address, map_url: b.map_url } });
      toast.success("Saqlandi"); setOpen(false); refetch();
    } catch { toast.error("Saqlashda xatolik. Qayta urinib ko'ring."); }
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
              <Button size="icon" variant="ghost" onClick={async () => { if (confirm("O'chirish?")) { await deleteFn({ data: { password: ADMIN_PANEL_PASSWORD, id: b.id } }); refetch(); } }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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

/* ---------------- USERS ---------------- */
function UsersAdmin() {
  const listFn = useServerFn(adminListUsers);
  const resetFn = useServerFn(adminResetPassword);
  const updateFn = useServerFn(adminUpdateUser);
  const deleteFn = useServerFn(adminDeleteUser);

  const { data, refetch, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => listFn({ data: { password: ADMIN_PANEL_PASSWORD } }),
  });

  const [editing, setEditing] = useState<any | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [pwdUser, setPwdUser] = useState<any | null>(null);
  const [newPwd, setNewPwd] = useState("");

  const saveEdit = async () => {
    if (!editing) return;
    try {
      await updateFn({ data: { password: ADMIN_PANEL_PASSWORD, user_id: editing.id, full_name: editing.full_name, phone: editing.phone, email: editing.email } });
      toast.success("Saqlandi"); setEditOpen(false); refetch();
    } catch (e: any) { toast.error(e.message); }
  };

  const savePwd = async () => {
    if (!pwdUser || newPwd.length < 6) return toast.error("Parol kamida 6 ta belgi");
    try {
      await resetFn({ data: { password: ADMIN_PANEL_PASSWORD, user_id: pwdUser.id, new_password: newPwd } });
      toast.success(`Yangi parol o'rnatildi: ${newPwd}`);
      setPwdUser(null); setNewPwd("");
    } catch (e: any) { toast.error(e.message); }
  };

  const delUser = async (id: string) => {
    if (!confirm("Foydalanuvchini butunlay o'chirasizmi?")) return;
    try {
      await deleteFn({ data: { password: ADMIN_PANEL_PASSWORD, user_id: id } });
      toast.success("O'chirildi"); refetch();
    } catch (e: any) { toast.error(e.message); }
  };

  if (isLoading) return <p className="text-muted-foreground">Yuklanmoqda...</p>;

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Jami: {data?.users.length ?? 0} foydalanuvchi. Parolni unutgan foydalanuvchiga yangi parol o'rnatishingiz mumkin.</p>
      <div className="grid md:grid-cols-2 gap-3">
        {data?.users.map((u) => (
          <Card key={u.id} className="p-4 space-y-2">
            <div>
              <p className="font-medium">{u.full_name || "(Ism kiritilmagan)"}</p>
              <p className="text-xs text-muted-foreground break-all">📧 {u.email}</p>
              {u.phone && <p className="text-xs text-muted-foreground">📞 {u.phone}</p>}
              <p className="text-xs text-muted-foreground mt-1">Ro'yxatdan: {new Date(u.created_at).toLocaleDateString()}</p>
            </div>
            <div className="flex gap-2 pt-2">
              <Button size="sm" variant="outline" className="gap-1" onClick={() => { setEditing({ ...u }); setEditOpen(true); }}>
                <Pencil className="h-3.5 w-3.5" /> Tahrirlash
              </Button>
              <Button size="sm" variant="outline" className="gap-1" onClick={() => { setPwdUser(u); setNewPwd(""); }}>
                <KeyRound className="h-3.5 w-3.5" /> Parol
              </Button>
              <Button size="sm" variant="ghost" onClick={() => delUser(u.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Foydalanuvchini tahrirlash</DialogTitle></DialogHeader>
          {editing && <div className="space-y-3">
            <div><Label>Ism</Label><Input value={editing.full_name ?? ""} onChange={(e) => setEditing({ ...editing, full_name: e.target.value })} /></div>
            <div><Label>Email</Label><Input type="email" value={editing.email ?? ""} onChange={(e) => setEditing({ ...editing, email: e.target.value })} /></div>
            <div><Label>Telefon</Label><Input value={editing.phone ?? ""} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} /></div>
            <Button onClick={saveEdit} className="w-full">Saqlash</Button>
          </div>}
        </DialogContent>
      </Dialog>

      <Dialog open={!!pwdUser} onOpenChange={(v) => { if (!v) { setPwdUser(null); setNewPwd(""); } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Yangi parol o'rnatish</DialogTitle></DialogHeader>
          {pwdUser && <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Foydalanuvchi: <b>{pwdUser.email}</b></p>
            <Input type="text" placeholder="Yangi parol (kamida 6 ta belgi)" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} />
            <Button onClick={savePwd} className="w-full">O'rnatish</Button>
            <p className="text-xs text-muted-foreground">⚠️ Eski parol qaytarib bo'lmaydi — tizim parollarni shifrlangan saqlaydi. Faqat yangi parol o'rnatish mumkin.</p>
          </div>}
        </DialogContent>
      </Dialog>
    </div>
  );
}
