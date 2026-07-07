import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
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
import { useAuth } from "@/hooks/use-auth";
import {
  adminBulkImportMedicines,
  adminDeleteAllMedicines,
  adminDeleteBranch,
  adminDeleteMedicine,
  adminDeleteNews,
  adminDeleteOrder,
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
import * as XLSX from "xlsx";


export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({ meta: [{ title: "Admin — MediLife" }] }),
});

function AdminPage() {
  const navigate = useNavigate();
  const { isAdmin, loading, user } = useAuth();

  if (loading) {
    return <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Yuklanmoqda...</div>;
  }
  if (!user || !isAdmin) {
    return (
      <div className="container mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="text-2xl font-semibold">Admin panel yopiq</h1>
        <p className="text-muted-foreground">Bu sahifa faqat administratorlar uchun.</p>
        <Button onClick={() => navigate({ to: "/" })}>Bosh sahifaga qaytish</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <Button variant="outline" size="sm" onClick={() => navigate({ to: "/" })} className="gap-2">
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
          const { url } = await uploadFn({ data: { file_name: f.name, content_type: f.type || "application/octet-stream", base64 } });
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
  const { data = [], refetch } = useQuery({ queryKey: ["admin-news"], queryFn: () => listFn({ data: {} }) });
  const [editing, setEditing] = useState<any | null>(null);
  const [open, setOpen] = useState(false);

  const save = async (n: any) => {
    try {
      await saveFn({ data: { id: n.id, title: n.title, body: n.body, image_url: n.image_url || null } });
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
              <Button size="icon" variant="ghost" onClick={async () => { if (confirm("O'chirish?")) { await deleteFn({ data: { id: n.id } }); refetch(); } }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
  const bulkFn = useServerFn(adminBulkImportMedicines);
  const deleteAllFn = useServerFn(adminDeleteAllMedicines);
  const { data = [], refetch } = useQuery({ queryKey: ["admin-meds"], queryFn: () => listFn({ data: {} }) });
  const [editing, setEditing] = useState<any | null>(null);
  const [open, setOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<string>("");
  const [search, setSearch] = useState("");

  const handleXlsxImport = async (e: React.ChangeEvent<HTMLInputElement>, lang: "latin" | "cyrillic") => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setImporting(true);
    setImportProgress("Fayl o'qilmoqda...");
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<any>(sheet, { defval: "" });

      const norm = (k: string) => k.toString().trim().toLowerCase().replace(/\s+/g, "_");
      const parsed = rows.map((r) => {
        const obj: any = {};
        for (const k of Object.keys(r)) obj[norm(k)] = r[k];
        const nameVal = String(obj.name ?? obj.nomi ?? obj["nomi_(lotin)"] ?? obj["nomi_(kirill)"] ?? obj.lotin ?? obj.kirill ?? "").trim();
        const priceRaw = obj.price ?? obj.narx ?? 0;
        const price = Number(String(priceRaw).replace(/[^0-9.]/g, "")) || 0;
        const image_url = String(obj.image_url ?? obj.rasm ?? "").trim();
        return lang === "latin"
          ? { name: nameVal, name_cyrl: null, price, image_url: image_url || null }
          : { name: nameVal, name_cyrl: nameVal, price, image_url: image_url || null };
      }).filter((r) => r.name);

      if (parsed.length === 0) {
        toast.error("Faylda 'name' ustuni bo'lgan qatorlar topilmadi");
        return;
      }

      let total = 0;
      const chunkSize = 500;
      for (let i = 0; i < parsed.length; i += chunkSize) {
        const chunk = parsed.slice(i, i + chunkSize);
        setImportProgress(`Yuklanmoqda: ${i}/${parsed.length}...`);
        const res = await bulkFn({ data: { items: chunk } });
        total += res.inserted;
      }
      toast.success(`${total} ta dori muvaffaqiyatli yuklandi`);
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Faylni yuklashda xatolik");
    } finally {
      setImporting(false);
      setImportProgress("");
    }
  };

  const save = async (m: any) => {
    try {
      await saveFn({ data: { id: m.id, name: m.name, name_cyrl: m.name_cyrl || null, description: null, image_url: m.image_url || null, price: Number(m.price) || 0, unit: "dona", stock: 0 } });
      toast.success("Saqlandi"); setOpen(false); refetch();
    } catch { toast.error("Saqlashda xatolik. Qayta urinib ko'ring."); }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button onClick={() => setEditing({ name: "", name_cyrl: "", image_url: "", price: 0 })} className="gap-1"><Plus className="h-4 w-4" /> Qo'shish</Button></DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Dori</DialogTitle></DialogHeader>
            {editing && <div className="space-y-3">
              <div><Label>Nomi (Lotin)</Label><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="Masalan: Paratsetamol" /></div>
              <div><Label>Nomi (Kirill)</Label><Input value={editing.name_cyrl ?? ""} onChange={(e) => setEditing({ ...editing, name_cyrl: e.target.value })} placeholder="Масалан: Парацетамол" /></div>
              <div><Label>Rasm (URL yoki yuklash)</Label><ImageInput value={editing.image_url ?? ""} onChange={(v) => setEditing({ ...editing, image_url: v })} /></div>
              <div><Label>Narx (so'm)</Label><Input type="number" value={editing.price} onChange={(e) => setEditing({ ...editing, price: e.target.value })} /></div>
              <Button onClick={() => save(editing)} className="w-full">Saqlash</Button>
            </div>}
          </DialogContent>
        </Dialog>
        <Label htmlFor="xlsx-upload" className="cursor-pointer">
          <div className="inline-flex items-center gap-1 h-9 px-4 rounded-md border border-input bg-background hover:bg-accent text-sm font-medium">
            <Plus className="h-4 w-4" /> {importing ? (importProgress || "Yuklanmoqda...") : ".xlsx dan import"}
          </div>
          <input id="xlsx-upload" type="file" accept=".xlsx,.xls" className="hidden" disabled={importing} onChange={handleXlsxImport} />
        </Label>
        <Button variant="outline" size="sm" onClick={() => exportXlsx("latin")}>⬇ Lotin (.xlsx)</Button>
        <Button variant="outline" size="sm" onClick={() => exportXlsx("cyrillic")}>⬇ Kirill (.xlsx)</Button>
        <Button variant="destructive" size="sm" disabled={!data.length || importing} onClick={async () => {
          if (!confirm(`DIQQAT: Barcha ${data.length} ta dori o'chiriladi. Davom etilsinmi?`)) return;
          if (!confirm("Rostdan ham hamma dorilarni o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.")) return;
          try {
            const res = await deleteAllFn({ data: {} });
            toast.success(`${res.deleted} ta dori o'chirildi`);
            refetch();
          } catch (err: any) {
            toast.error(err.message || "O'chirishda xatolik");
          }
        }} className="gap-1"><Trash2 className="h-4 w-4" /> Hammasini o'chirish</Button>
        <span className="text-xs text-muted-foreground w-full">Import ustunlari: <b>name</b> (Lotin), <b>name_cyrl</b> (Kirill), <b>price</b> (narx), <b>image_url</b> (rasm)</span>
      </div>
      <Input placeholder="Qidirish (nomi bo'yicha)..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
      <div className="text-xs text-muted-foreground">Jami: {data.length} ta dori{search && ` · Topildi: ${data.filter((m: any) => { const s = search.toLowerCase(); return m.name?.toLowerCase().includes(s) || m.name_cyrl?.toLowerCase().includes(s); }).length}`}</div>
      <div className="grid md:grid-cols-2 gap-3">
        {data.filter((m: any) => {
          if (!search) return true;
          const s = search.toLowerCase();
          return m.name?.toLowerCase().includes(s) || m.name_cyrl?.toLowerCase().includes(s);
        }).map((m: any) => (
          <Card key={m.id} className="p-3 flex gap-3">
            {m.image_url && <img src={m.image_url} alt="" className="h-16 w-16 object-cover rounded" />}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate">{m.name}</h3>
              <p className="text-xs text-muted-foreground">{Number(m.price).toLocaleString()} so'm</p>
            </div>
            <div className="flex flex-col gap-1">
              <Button size="icon" variant="ghost" onClick={() => { setEditing(m); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" onClick={async () => { if (confirm("O'chirish?")) { await deleteFn({ data: { id: m.id } }); refetch(); } }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
  const { data = [], refetch } = useQuery({ queryKey: ["admin-branches"], queryFn: () => listFn({ data: {} }) });
  const [editing, setEditing] = useState<any | null>(null);
  const [open, setOpen] = useState(false);

  const save = async (b: any) => {
    try {
      await saveFn({ data: { id: b.id, name: b.name, image_url: b.image_url || null, phone: b.phone, address: b.address, map_url: b.map_url, map_type: "yandex", google_map_url: null, yandex_map_url: b.yandex_map_url || null } });
      toast.success("Saqlandi"); setOpen(false); refetch();
    } catch { toast.error("Saqlashda xatolik. Qayta urinib ko'ring."); }
  };


  return (
    <div className="space-y-4">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild><Button onClick={() => setEditing({ name: "", image_url: "", phone: "", address: "", map_url: "", map_type: "yandex", yandex_map_url: "" })} className="gap-1"><Plus className="h-4 w-4" /> Qo'shish</Button></DialogTrigger>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Filial</DialogTitle></DialogHeader>
          {editing && <div className="space-y-3">
            <div><Label>Nomi</Label><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
            <div><Label>Rasm</Label><ImageInput value={editing.image_url ?? ""} onChange={(v) => setEditing({ ...editing, image_url: v })} /></div>
            <div><Label>Telefon</Label><Input value={editing.phone ?? ""} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} /></div>
            <div><Label>Manzil (matn)</Label><Input value={editing.address ?? ""} onChange={(e) => setEditing({ ...editing, address: e.target.value })} placeholder="Ko'cha, uy, mo'ljal..." /></div>
            <div><Label>Yandex Maps havolasi</Label><Input value={editing.yandex_map_url ?? ""} placeholder="https://yandex.uz/maps/..." onChange={(e) => setEditing({ ...editing, yandex_map_url: e.target.value })} /></div>
            <Button onClick={() => save({ ...editing, map_type: "yandex" })} className="w-full">Saqlash</Button>
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
              <Button size="icon" variant="ghost" onClick={async () => { if (confirm("O'chirish?")) { await deleteFn({ data: { id: b.id } }); refetch(); } }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ---------------- ORDERS ---------------- */
function OrdersAdmin() {
  const listFn = useServerFn(adminListOrders);
  const statusFn = useServerFn(adminSetOrderStatus);
  const delFn = useServerFn(adminDeleteOrder);
  const { data = [], refetch } = useQuery({ queryKey: ["admin-orders"], queryFn: () => listFn({ data: {} }) });
  const setStatus = async (id: string, status: string) => {
    try {
      await statusFn({ data: { id, status: status as any } });
      toast.success("Holat o'zgartirildi"); refetch();
    } catch { toast.error("Holatni o'zgartirishda xatolik"); }
  };
  const del = async (id: string, status: string) => {
    if (status !== "delivered") {
      toast.error("Faqat 'Yetkazildi' bo'lgan buyurtmani o'chirish mumkin");
      return;
    }
    if (!confirm("Buyurtmani o'chirasizmi?")) return;
    try {
      await delFn({ data: { id } });
      toast.success("O'chirildi"); refetch();
    } catch (e: any) { toast.error(e.message || "Xatolik"); }
  };

  return (
    <div className="space-y-3">
      {data.map((o: any) => (
        <Card key={o.id} className="p-4">
          <div className="flex justify-between mb-2 gap-2">
            <div className="min-w-0">
              <p className="font-medium truncate">{o.customer_name} · {o.customer_phone}</p>
              <p className="text-xs text-muted-foreground">#{o.id.slice(0, 8)} · {new Date(o.created_at).toLocaleString()} · {o.delivery_type === "courier" ? "Kuryer" : "O'zi"}</p>
              {o.address && <p className="text-xs text-muted-foreground truncate">📍 {o.address}</p>}
            </div>
            <div className="flex items-center gap-2 shrink-0">
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
              <Button size="icon" variant="ghost" disabled={o.status !== "delivered"} title={o.status !== "delivered" ? "Faqat yetkazilgan buyurtmani o'chirish mumkin" : "O'chirish"} onClick={() => del(o.id, o.status)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
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
    queryFn: () => listFn({ data: {} }),
  });

  const [editing, setEditing] = useState<any | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [pwdUser, setPwdUser] = useState<any | null>(null);
  const [newPwd, setNewPwd] = useState("");

  const saveEdit = async () => {
    if (!editing) return;
    try {
      await updateFn({ data: { user_id: editing.id, full_name: editing.full_name, phone: editing.phone, email: editing.email } });
      toast.success("Saqlandi"); setEditOpen(false); refetch();
    } catch (e: any) { toast.error(e.message); }
  };

  const savePwd = async () => {
    if (!pwdUser || newPwd.length < 6) return toast.error("Parol kamida 6 ta belgi");
    try {
      await resetFn({ data: { user_id: pwdUser.id, new_password: newPwd } });
      toast.success(`Yangi parol o'rnatildi: ${newPwd}`);
      setPwdUser(null); setNewPwd("");
    } catch (e: any) { toast.error(e.message); }
  };

  const delUser = async (id: string) => {
    if (!confirm("Foydalanuvchini butunlay o'chirasizmi?")) return;
    try {
      await deleteFn({ data: { user_id: id } });
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
