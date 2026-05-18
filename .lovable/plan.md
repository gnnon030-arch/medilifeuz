# MediLife — Dorixona sayti

Yashil brendli (logo: yashil yurak + MediLife) onlayn dorixona. Quyidagi bosqichlarda quraman, har bosqich tugagach ko'rib chiqasiz.

## Texnologiyalar
- TanStack Start + React + Tailwind (dizayn tizimi yashil ohangda)
- **Lovable Cloud** — auth (Google + email/parol), ma'lumotlar bazasi (dorilar, yangiliklar, filiallar, buyurtmalar, sharhlar, foydalanuvchi rollari), fayl yuklash (dori/yangilik/filial rasmlari)
- Google Maps JS API (filiallar uchun)
- Telegram Bot API — buyurtmalar avtomatik `Telegram_id` ga yuboriladi
- i18next — uz / ru / en
- Dark/Light mode (class-based)

## Bosqich 1 — Fundament va dizayn
- Logo yuklash (`src/assets/medilife-logo.jpg`)
- Yashil dizayn tizimi (`styles.css`: primary = yashil oklch, dark/light tokenlar)
- Layout: tepada **markazda sticky navbar** — Bosh Menyu • Yangiliklar • Dorilar • Bizning Filiallar • Savatcha (badge bilan) • Til (uz/ru/en) • 🌙 Tema • 👤 Profil (o'ng tepada)
- Marshrutlar: `/`, `/yangiliklar`, `/dorilar`, `/filiallar`, `/savatcha`, `/profil`, `/buyurtmalarim`, `/login`, `/register`
- Footer: Aloqa (+998 91 362 00 80, Ismoil, gnnon030@gmail.com), © 2000

## Bosqich 2 — Lovable Cloud + Auth
- Cloud yoqaman
- Jadvallar: `profiles` (id, full_name, phone, email, language, theme), `user_roles` (admin role), `news`, `medicines`, `branches`, `orders`, `order_items`, `reviews`
- RLS siyosatlari + `has_role()` SECURITY DEFINER funksiya
- Google OAuth + email/parol auth
- Telefon raqam `+998 90 123 45 67` formatlash (prefix qulflangan), majburiy
- Parol + tasdiqlash (mos kelishi tekshiriladi)
- Google bilan kirgan foydalanuvchidan telefon yo'q bo'lsa — onboarding bosqichida so'raladi

## Bosqich 3 — Asosiy sahifalar
- **Bosh sahifa (hero + qisqacha)**
- **Yangiliklar**: katta avtomatik karusel banner (2 sek), chap/o'ng strelka, chap pastda matn — admin qo'shadi
- **Dorilar**: katalog, har karta — rasm, nom, narx, miqdor (1 dona / 1 paket / 1g), **+** tugma (savatchaga qo'shadi → toast bildirishnoma "{nom} savatchaga qo'shildi"), agar savatchada bor bo'lsa **− / soni / +** ko'rinadi (− toast: "{nom} savatchadan olib tashlandi"), savatchada yo'q bo'lsa faqat **+**
- **Filiallar**: kartalar (rasm, telefon, matnli manzil, Google Maps embed)

## Bosqich 4 — Savatcha va buyurtma
- Savatcha 2 ta tab:
  1. **Savatcha** — dorilar ro'yxati, jami; "Kuryer 10:00–22:00 bepul" eslatma; Namangan vaqti (Asia/Tashkent) avtomatik ko'rsatiladi
  2. **Rasmiylashtirish** — ism, telefon, ro'yxat, yetkazish: **O'zim olib ketaman** / **Kuryer orqali**. Vaqt 10:00–22:00 dan tashqarida bo'lsa kuryerga +20 000 so'm avtomatik qo'shiladi
- Buyurtma yuborilganda **Telegram botga** to'liq ma'lumot yuboriladi (server function orqali)

## Bosqich 5 — Profil, buyurtmalar, sharhlar
- Profil: ma'lumotlar, til, tema
- **Buyurtmalarim**: holat, mahsulotlar
- Yetkazilgan buyurtmaga **sharh + reyting 0–10**

## Bosqich 6 — Admin panel
- Maxfiy ochish: **Alt+Shift+5** klaviatura kombinatsiyasi (faqat admin role bo'lsa)
- Tablar: **Yangiliklar** (CRUD) • **Dorilar** (CRUD, rasm: URL yoki upload, narx, miqdor, ta'rif, ombor — buyurtma kelganda kamayadi) • **Filiallar** (CRUD + rasm + telefon + manzil + Google Maps URL) • **Buyurtmalar** (barcha buyurtmalar ro'yxati, holat o'zgartirish)

## Bosqich 7 — Integratsiyalar
- Google Maps API key (siz bergan) — `index.html` ga script
- Telegram bot token va chat ID **secrets** ga saqlanadi (kodda ochiq qoldirilmaydi) — server function buyurtmani `sendMessage` orqali yuboradi

## Eslatma
Bu juda katta hajm. Avval **Bosqich 1–3** ni qilib ko'rsataman (sayt asosi, dizayn, auth, katalog, yangiliklar, filiallar). Tasdiqlasangiz keyin savatcha + admin + Telegram qismlariga o'taman. Bu sifatni saqlab qolish uchun eng yaxshi yo'l.

Tasdiqlaysizmi?
