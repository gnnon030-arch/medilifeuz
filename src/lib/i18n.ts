import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  uz_cyrl: {
    translation: {
      nav: { home: "Бош Меню", news: "Янгиликлар", medicines: "Дорилар", branches: "Бизнинг Филиаллар", cart: "Саватча", profile: "Профил", orders: "Буюртмаларим" },
      home: { hero_title: "Энг сара ва арзон дорилар", hero_sub: "MediLife — соғлиғингиз учун ишончли онлайн дорихона", cta: "Дориларни кўриш", news_title: "Янгиликлар", medicines_title: "Дорилар", about_title: "Биз ҳақимизда", about_text: "MediLife — Наманган шаҳрида жойлашган замонавий дорихона тармоғи. Бизнинг мақсадимиз — сифатли ва арзон дориларни ҳар бир оилага етказиш." },
      cart: { add: "Саватчага қўшилди", remove: "Саватчадан олиб ташланди", empty: "Саватча бўш", checkout: "Расмийлаштириш", delivery_only: "Фақат етказиб бериш хизмати орқали", delivery_free_city: "Етказиб бериш хизмати шаҳар бўйлаб бепул", total: "Жами", subtotal: "Маҳсулотлар", delivery_fee: "Етказиб бериш", submit: "Буюртма бериш", submitted: "Буюртма юборилди!", current_time: "Ҳозирги вақт (Ўзбекистон Наманган)", address_text: "Манзил (матн)", address_text_ph: "Кўча, уй, хонадон...", address_map: "Картадан танлаш", address_map_btn: "Yandex Карта орқали танлаш", address_picked: "Танланган манзил", note_ph: "Эслатма (ихтиёрий)", order_list: "Буюртма рўйхати", my_location: "Менинг жойлашувим", map_hint: "Картага босиб ёки маркерни кўчириб манзилни белгиланг", delete_order: "Буюртмани ўчириш" },
      auth: { login: "Кириш", register: "Рўйхатдан ўтиш", logout: "Чиқиш", google: "Google билан давом этиш", email: "Email", password: "Парол", confirm_password: "Паролни такрорлаш", full_name: "Исм", phone: "Телефон рақам", passwords_mismatch: "Пароллар мос келмади", phone_invalid: "Телефон нотўғри", success_signup: "Рўйхатдан ўтдингиз", success_login: "Хуш келибсиз" },
      common: { loading: "Юкланмоқда...", save: "Сақлаш", cancel: "Бекор қилиш", delete: "Ўчириш", edit: "Таҳрирлаш", add: "Қўшиш", search: "Қидириш", language: "Тил", theme: "Тема", stock: "Мавжуд", out_of_stock: "Тугаган", sum: "сўм", confirm: "Тасдиқлаш", close: "Ёпиш" },
      news: { title: "Янгиликлар", empty: "Янгиликлар йўқ" },
      medicines: { title: "Дорилар", empty: "Дорилар йўқ" },
      branches: { title: "Бизнинг Филиаллар", view_map: "Харитада кўриш" },
      admin: { title: "Админ Панел", tabs: { news: "Янгиликлар", medicines: "Дорилар", branches: "Филиаллар", orders: "Буюртмалар" } },
      orders: { title: "Буюртмаларим", status: { pending: "Кутилмоқда", confirmed: "Тасдиқланган", delivering: "Етказилмоқда", delivered: "Етказилди", cancelled: "Бекор қилинган" }, rate: "Баҳолаш", rating: "Рейтинг", comment: "Шарҳ" },
      footer: { tagline: "Соғлиғингиз учун ишончли онлайн дорихона. Энг сара ва арзон дорилар — Наманган шаҳрида.", call_center: "Колл марказ", manager: "Масъул", manager_name: "Абдулқуддус Одилов", address: "Наманган шаҳри, Ўзбекистон", rights: "© 2000 MediLife. Барча ҳуқуқлар ҳимояланган." },
    },
  },
  uz: {
    translation: {
      nav: { home: "Bosh Menyu", news: "Yangiliklar", medicines: "Dorilar", branches: "Bizning Filiallar", cart: "Savatcha", profile: "Profil", orders: "Buyurtmalarim" },
      home: { hero_title: "Eng sara va arzon dorilar", hero_sub: "MediLife — sog'lig'ingiz uchun ishonchli onlayn dorixona", cta: "Dorilarni ko'rish", news_title: "Yangiliklar", medicines_title: "Dorilar", about_title: "Biz haqimizda", about_text: "MediLife — Namangan shahrida joylashgan zamonaviy dorixona tarmog'i. Bizning maqsadimiz — sifatli va arzon dorilarni har bir oilaga yetkazish." },
      cart: { add: "Savatchaga qo'shildi", remove: "Savatchadan olib tashlandi", empty: "Savatcha bo'sh", checkout: "Rasmiylashtirish", delivery_only: "Faqat yetkazib berish xizmati orqali", delivery_free_city: "Yetkazib berish xizmati shahar bo'ylab bepul", total: "Jami", subtotal: "Mahsulotlar", delivery_fee: "Yetkazib berish", submit: "Buyurtma berish", submitted: "Buyurtma yuborildi!", current_time: "Hozirgi vaqt (O'zbekiston Namangan)", address_text: "Manzil (matn)", address_text_ph: "Ko'cha, uy, xonadon...", address_map: "Kartadan tanlash", address_map_btn: "Yandex Karta orqali tanlash", address_picked: "Tanlangan manzil", note_ph: "Eslatma (ixtiyoriy)", order_list: "Buyurtma ro'yxati", my_location: "Mening joylashuvim", map_hint: "Kartaga bosib yoki markerni surib manzilni belgilang", delete_order: "Buyurtmani o'chirish" },
      auth: { login: "Kirish", register: "Ro'yxatdan o'tish", logout: "Chiqish", google: "Google bilan davom etish", email: "Email", password: "Parol", confirm_password: "Parolni takrorlash", full_name: "Ism", phone: "Telefon raqam", passwords_mismatch: "Parollar mos kelmadi", phone_invalid: "Telefon noto'g'ri", success_signup: "Ro'yxatdan o'tdingiz", success_login: "Xush kelibsiz" },
      common: { loading: "Yuklanmoqda...", save: "Saqlash", cancel: "Bekor qilish", delete: "O'chirish", edit: "Tahrirlash", add: "Qo'shish", search: "Qidirish", language: "Til", theme: "Tema", stock: "Mavjud", out_of_stock: "Tugagan", sum: "so'm", confirm: "Tasdiqlash", close: "Yopish" },
      news: { title: "Yangiliklar", empty: "Yangiliklar yo'q" },
      medicines: { title: "Dorilar", empty: "Dorilar yo'q" },
      branches: { title: "Bizning Filiallar", view_map: "Xaritada ko'rish" },
      admin: { title: "Admin Panel", tabs: { news: "Yangiliklar", medicines: "Dorilar", branches: "Filiallar", orders: "Buyurtmalar" } },
      orders: { title: "Buyurtmalarim", status: { pending: "Kutilmoqda", confirmed: "Tasdiqlangan", delivering: "Yetkazilmoqda", delivered: "Yetkazildi", cancelled: "Bekor qilingan" }, rate: "Baholash", rating: "Reyting", comment: "Sharh" },
      footer: { tagline: "Sog'lig'ingiz uchun ishonchli onlayn dorixona. Eng sara va arzon dorilar — Namangan shahrida.", call_center: "Call markaz", manager: "Mas'ul", manager_name: "Abdulquddus Odilov", address: "Namangan shahri, O'zbekiston", rights: "© 2000 MediLife. Barcha huquqlar himoyalangan." },
    },
  },
  ru: {
    translation: {
      nav: { home: "Главная", news: "Новости", medicines: "Лекарства", branches: "Наши филиалы", cart: "Корзина", profile: "Профиль", orders: "Мои заказы" },
      home: { hero_title: "Лучшие и доступные лекарства", hero_sub: "MediLife — надёжная онлайн-аптека", cta: "Смотреть лекарства", news_title: "Новости", medicines_title: "Лекарства", about_title: "О нас", about_text: "MediLife — современная сеть аптек в г. Наманган." },
      cart: { add: "Добавлено в корзину", remove: "Убрано из корзины", empty: "Корзина пуста", checkout: "Оформление", delivery_only: "Только через службу доставки", delivery_free_city: "Доставка по всему городу бесплатно", total: "Итого", subtotal: "Товары", delivery_fee: "Доставка", submit: "Заказать", submitted: "Заказ отправлен!", current_time: "Текущее время (Узбекистан Наманган)", address_text: "Адрес (текст)", address_text_ph: "Улица, дом, квартира...", address_map: "Выбрать на карте", address_map_btn: "Выбрать через Yandex Карты", address_picked: "Выбранный адрес", note_ph: "Заметка (необязательно)", order_list: "Список заказа", my_location: "Моё местоположение", map_hint: "Кликните по карте или перетащите маркер", delete_order: "Удалить заказ" },
      auth: { login: "Войти", register: "Регистрация", logout: "Выйти", google: "Продолжить с Google", email: "Email", password: "Пароль", confirm_password: "Повторите пароль", full_name: "Имя", phone: "Телефон", passwords_mismatch: "Пароли не совпадают", phone_invalid: "Неверный телефон", success_signup: "Регистрация прошла успешно", success_login: "Добро пожаловать" },
      common: { loading: "Загрузка...", save: "Сохранить", cancel: "Отмена", delete: "Удалить", edit: "Изменить", add: "Добавить", search: "Поиск", language: "Язык", theme: "Тема", stock: "В наличии", out_of_stock: "Нет в наличии", sum: "сум", confirm: "Подтвердить", close: "Закрыть" },
      news: { title: "Новости", empty: "Новостей нет" },
      medicines: { title: "Лекарства", empty: "Нет лекарств" },
      branches: { title: "Наши филиалы", view_map: "Открыть карту" },
      admin: { title: "Админ панель", tabs: { news: "Новости", medicines: "Лекарства", branches: "Филиалы", orders: "Заказы" } },
      orders: { title: "Мои заказы", status: { pending: "Ожидание", confirmed: "Подтверждён", delivering: "Доставляется", delivered: "Доставлен", cancelled: "Отменён" }, rate: "Оценить", rating: "Рейтинг", comment: "Отзыв" },
      footer: { tagline: "Надёжная онлайн-аптека для вашего здоровья. Лучшие и доступные лекарства — в г. Наманган.", call_center: "Колл-центр", manager: "Ответственный", manager_name: "Абдулкуддус Одилов", address: "г. Наманган, Узбекистан", rights: "© 2000 MediLife. Все права защищены." },
    },
  },
  en: {
    translation: {
      nav: { home: "Home", news: "News", medicines: "Medicines", branches: "Our Branches", cart: "Cart", profile: "Profile", orders: "My Orders" },
      home: { hero_title: "Best & affordable medicines", hero_sub: "MediLife — trusted online pharmacy", cta: "Browse medicines", news_title: "News", medicines_title: "Medicines", about_title: "About us", about_text: "MediLife is a modern pharmacy network in Namangan." },
      cart: { add: "Added to cart", remove: "Removed from cart", empty: "Cart is empty", checkout: "Checkout", delivery_only: "Delivery service only", delivery_free_city: "Delivery is free across the city", total: "Total", subtotal: "Subtotal", delivery_fee: "Delivery", submit: "Place order", submitted: "Order placed!", current_time: "Current time (Uzbekistan Namangan)", address_text: "Address (text)", address_text_ph: "Street, house, apartment...", address_map: "Pick on map", address_map_btn: "Pick via Yandex Maps", address_picked: "Picked address", note_ph: "Note (optional)", order_list: "Order list", my_location: "My location", map_hint: "Click the map or drag the marker", delete_order: "Delete order" },
      auth: { login: "Login", register: "Sign up", logout: "Logout", google: "Continue with Google", email: "Email", password: "Password", confirm_password: "Confirm password", full_name: "Name", phone: "Phone number", passwords_mismatch: "Passwords don't match", phone_invalid: "Invalid phone", success_signup: "Account created", success_login: "Welcome" },
      common: { loading: "Loading...", save: "Save", cancel: "Cancel", delete: "Delete", edit: "Edit", add: "Add", search: "Search", language: "Language", theme: "Theme", stock: "In stock", out_of_stock: "Out of stock", sum: "sum", confirm: "Confirm", close: "Close" },
      news: { title: "News", empty: "No news" },
      medicines: { title: "Medicines", empty: "No medicines" },
      branches: { title: "Our Branches", view_map: "Open map" },
      admin: { title: "Admin Panel", tabs: { news: "News", medicines: "Medicines", branches: "Branches", orders: "Orders" } },
      orders: { title: "My Orders", status: { pending: "Pending", confirmed: "Confirmed", delivering: "Delivering", delivered: "Delivered", cancelled: "Cancelled" }, rate: "Rate", rating: "Rating", comment: "Comment" },
      footer: { tagline: "Trusted online pharmacy for your health. Best & affordable medicines — in Namangan.", call_center: "Call center", manager: "Manager", manager_name: "Abdulquddus Odilov", address: "Namangan, Uzbekistan", rights: "© 2000 MediLife. All rights reserved." },
    },
  },
};

if (!i18n.isInitialized) {
  const stored = typeof window !== "undefined" ? localStorage.getItem("medilife-lang") : null;
  const valid = ["uz_cyrl", "uz", "ru", "en"];
  const initial = stored && valid.includes(stored) ? stored : "uz_cyrl";
  i18n.use(initReactI18next).init({
    resources,
    lng: initial,
    fallbackLng: "uz_cyrl",
    interpolation: { escapeValue: false },
  });
}

export default i18n;
