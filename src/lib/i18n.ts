import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  uz_cyrl: {
    translation: {
      nav: { home: "Бош Меню", news: "Янгиликлар", medicines: "Дорилар", branches: "Бизнинг Филиаллар", cart: "Саватча", profile: "Профил", orders: "Буюртмаларим" },
      home: { hero_title: "Энг сара ва арзон дорилар", hero_sub: "MediLife — соғлиғингиз учун ишончли онлайн дорихона", cta: "Дориларни кўриш", news_title: "Янгиликлар", medicines_title: "Дорилар", about_title: "Биз ҳақимизда", about_text: "MediLife — Наманган шаҳрида жойлашган замонавий дорихона тармоғи. Бизнинг мақсадимиз — сифатли ва арзон дориларни ҳар бир оилага етказиш." },
      cart: { add: "Саватчага қўшилди", remove: "Саватчадан олиб ташланди", empty: "Саватча бўш", checkout: "Расмийлаштириш", delivery_only: "Фақат етказиб бериш хизмати орқали", delivery_free_city: "Етказиб бериш хизмати шаҳар бўйлаб бепул", total: "Жами", subtotal: "Маҳсулотлар", delivery_fee: "Етказиб бериш", submit: "Буюртма бериш", submitted: "Буюртма юборилди!", current_time: "Ҳозирги вақт (Ўзбекистон Наманган)", address_text: "Манзил (матн)", address_text_ph: "Кўча, уй, хонадон... (камида 20 та белги)", address_map: "Yandex Картадан танлаш", address_map_google: "Google Maps дан танлаш", address_map_btn: "Yandex Карта орқали танлаш", address_map_btn_google: "Google Maps орқали танлаш", address_picked: "Танланган манзил", address_method: "Манзилни киритиш усули", address_method_text: "Матн", address_method_google: "Google Maps", address_method_yandex: "Yandex Maps", address_min: "Манзил камида 20 та белгидан иборат бўлиши керак (бўшлиқлар ҳисобланмайди)", note_ph: "Эслатма (ихтиёрий)", order_list: "Буюртма рўйхати", my_location: "Менинг жойлашувим", map_hint: "Картага босиб ёки маркерни кўчириб манзилни белгиланг", delete_order: "Буюртмани ўчириш", google_map_unavailable: "Google Maps ҳозир юкланмади. Илтимос, Yandex Maps ёки матнли манзилдан фойдаланинг." },
      auth: { login: "Кириш", register: "Рўйхатдан ўтиш", logout: "Чиқиш", google: "Google билан давом этиш", email: "Email", password: "Парол", confirm_password: "Паролни такрорлаш", full_name: "Исм", phone: "Телефон рақам", passwords_mismatch: "Пароллар мос келмади", phone_invalid: "Телефон нотўғри", success_signup: "Рўйхатдан ўтдингиз", success_login: "Хуш келибсиз" },
      common: { loading: "Юкланмоқда...", save: "Сақлаш", cancel: "Бекор қилиш", delete: "Ўчириш", edit: "Таҳрирлаш", add: "Қўшиш", search: "Қидириш", language: "Тил", theme: "Тема", stock: "Мавжуд", out_of_stock: "Тугаган", sum: "сўм", confirm: "Тасдиқлаш", close: "Ёпиш" },
      news: { title: "Янгиликлар", empty: "Янгиликлар йўқ" },
      medicines: { title: "Дорилар", empty: "Дорилар йўқ" },
      branches: { title: "Бизнинг Филиаллар", view_map: "Харитада кўриш", view_google: "Google Maps да очиш", view_yandex: "Yandex Maps да очиш", empty: "Ҳозирча филиаллар йўқ" },
      admin: { title: "Админ Панел", tabs: { news: "Янгиликлар", medicines: "Дорилар", branches: "Филиаллар", orders: "Буюртмалар" } },
      orders: { title: "Буюртмаларим", status: { pending: "Кутилмоқда", confirmed: "Тасдиқланган", delivering: "Етказилмоқда", delivered: "Етказилди", cancelled: "Бекор қилинган" }, rate: "Баҳолаш", rating: "Рейтинг", comment: "Шарҳ" },
      footer: { tagline: "Соғлиғингиз учун ишончли онлайн дорихона. Энг сара ва арзон дорилар — Наманган шаҳрида.", call_center: "Колл марказ", manager: "Масъул", manager_name: "Абдулқуддус Одилов", address: "Наманган шаҳри, Ўзбекистон", rights: "© 2000 MediLife. Барча ҳуқуқлар ҳимояланган." },
    },
  },
  uz: {
    translation: {
      nav: { home: "Bosh Menyu", news: "Yangiliklar", medicines: "Dorilar", branches: "Bizning Filiallar", cart: "Savatcha", profile: "Profil", orders: "Buyurtmalarim" },
      home: { hero_title: "Eng sara va arzon dorilar", hero_sub: "MediLife — sog'lig'ingiz uchun ixtisoslashgan onlayn dorixona", cta: "Dorilarni ko'rish", news_title: "Yangiliklar", medicines_title: "Dorilar", about_title: "Biz haqimizda", about_text: "MediLife — Namangan shahrida joylashgan zamonaviy dorixona tarmog'i. Bizning maqsadimiz — sifatli va arzon dorilarni har bir oilaga yetkazish." },
      cart: { add: "Savatchaga qo'shildi", remove: "Savatchadan olib tashlandi", empty: "Savatcha bo'sh", checkout: "Rasmiylashtirish", delivery_only: "Faqat yetkazib berish xizmati orqali", delivery_free_city: "Yetkazib berish xizmati shahar bo'ylab bepul", total: "Jami", subtotal: "Mahsulotlar", delivery_fee: "Yetkazib berish", submit: "Buyurtma berish", submitted: "Buyurtma yuborildi!", current_time: "Hozirgi vaqt (O'zbekiston Namangan)", address_text: "Manzil (matn)", address_text_ph: "Ko'cha, uy, xonadon... (kamida 20 ta belgi)", address_map: "Yandex Kartadan tanlash", address_map_google: "Google Maps dan tanlash", address_map_btn: "Yandex Karta orqali tanlash", address_map_btn_google: "Google Maps orqali tanlash", address_picked: "Tanlangan manzil", address_method: "Manzilni kiritish usuli", address_method_text: "Matn", address_method_google: "Google Maps", address_method_yandex: "Yandex Maps", address_min: "Manzil kamida 20 ta belgidan iborat bo'lishi kerak (bo'shliqlar hisoblanmaydi)", note_ph: "Eslatma (ixtiyoriy)", order_list: "Buyurtma ro'yxati", my_location: "Mening joylashuvim", map_hint: "Kartaga bosib yoki markerni surib manzilni belgilang", delete_order: "Buyurtmani o'chirish", google_map_unavailable: "Google Maps hozir yuklanmadi. Iltimos, Yandex Maps yoki matnli manzildan foydalaning." },
      auth: { login: "Kirish", register: "Ro'yxatdan o'tish", logout: "Chiqish", google: "Google bilan davom etish", email: "Email", password: "Parol", confirm_password: "Parolni takrorlash", full_name: "Ism", phone: "Telefon raqam", passwords_mismatch: "Parollar mos kelmadi", phone_invalid: "Telefon noto'g'ri", success_signup: "Ro'yxatdan o'tdingiz", success_login: "Xush kelibsiz" },
      common: { loading: "Yuklanmoqda...", save: "Saqlash", cancel: "Bekor qilish", delete: "O'chirish", edit: "Tahrirlash", add: "Qo'shish", search: "Qidirish", language: "Til", theme: "Tema", stock: "Mavjud", out_of_stock: "Tugagan", sum: "so'm", confirm: "Tasdiqlash", close: "Yopish" },
      news: { title: "Yangiliklar", empty: "Yangiliklar yo'q" },
      medicines: { title: "Dorilar", empty: "Dorilar yo'q" },
      branches: { title: "Bizning Filiallar", view_map: "Xaritada ko'rish", view_google: "Google Maps da ochish", view_yandex: "Yandex Maps da ochish", empty: "Hozircha filiallar yo'q" },
      admin: { title: "Admin Panel", tabs: { news: "Yangiliklar", medicines: "Dorilar", branches: "Filiallar", orders: "Buyurtmalar" } },
      orders: { title: "Buyurtmalarim", status: { pending: "Kutilmoqda", confirmed: "Tasdiqlangan", delivering: "Yetkazilmoqda", delivered: "Yetkazildi", cancelled: "Bekor qilingan" }, rate: "Baholash", rating: "Reyting", comment: "Sharh" },
      footer: { tagline: "Sog'lig'ingiz uchun ishonchli onlayn dorixona. Eng sara va arzon dorilar — Namangan shahrida.", call_center: "Call markaz", manager: "Mas'ul", manager_name: "Abdulquddus Odilov", address: "Namangan shahri, O'zbekiston", rights: "© 2000 MediLife. Barcha huquqlar himoyalangan." },
    },
  },
};

if (!i18n.isInitialized) {
  const stored = typeof window !== "undefined" ? localStorage.getItem("medilife-lang") : null;
  const valid = ["uz_cyrl", "uz"];
  const initial = stored && valid.includes(stored) ? stored : "uz_cyrl";
  i18n.use(initReactI18next).init({
    resources,
    lng: initial,
    fallbackLng: "uz_cyrl",
    interpolation: { escapeValue: false },
  });
}

export default i18n;
