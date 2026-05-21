import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  uz: {
    translation: {
      nav: { home: "Bosh Menyu", news: "Yangiliklar", medicines: "Dorilar", branches: "Bizning Filiallar", cart: "Savatcha", profile: "Profil", orders: "Buyurtmalarim" },
      home: { hero_title: "Eng sara va arzon dorilar", hero_sub: "MediLife — sog'lig'ingiz uchun ishonchli onlayn dorixona", cta: "Dorilarni ko'rish", news_title: "Yangiliklar", medicines_title: "Dorilar", about_title: "Biz haqimizda", about_text: "MediLife — Namangan shahrida joylashgan zamonaviy dorixona tarmog'i. Bizning maqsadimiz — sifatli va arzon dorilarni har bir oilaga yetkazish." },
      cart: { add: "Savatchaga qo'shildi", remove: "Savatchadan olib tashlandi", empty: "Savatcha bo'sh", checkout: "Rasmiylashtirish", pickup: "O'zim olib ketaman", courier: "Kuryer orqali", free_courier: "Kuryer 10:00–22:00 bepul", outside_hours: "Vaqtdan tashqari — +20 000 so'm", total: "Jami", subtotal: "Mahsulotlar", delivery_fee: "Yetkazib berish", submit: "Buyurtma berish", submitted: "Buyurtma yuborildi!", current_time: "Hozirgi vaqt (O'zbekiston Namangan)" },
      auth: { login: "Kirish", register: "Ro'yxatdan o'tish", logout: "Chiqish", google: "Google bilan davom etish", email: "Email", password: "Parol", confirm_password: "Parolni takrorlash", full_name: "Ism", phone: "Telefon raqam", passwords_mismatch: "Parollar mos kelmadi", phone_invalid: "Telefon noto'g'ri", success_signup: "Ro'yxatdan o'tdingiz", success_login: "Xush kelibsiz" },
      common: { loading: "Yuklanmoqda...", save: "Saqlash", cancel: "Bekor qilish", delete: "O'chirish", edit: "Tahrirlash", add: "Qo'shish", search: "Qidirish", language: "Til", theme: "Tema", stock: "Mavjud", out_of_stock: "Tugagan", sum: "so'm" },
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
      cart: { add: "Добавлено в корзину", remove: "Убрано из корзины", empty: "Корзина пуста", checkout: "Оформление", pickup: "Самовывоз", courier: "Курьер", free_courier: "Курьер 10:00–22:00 бесплатно", outside_hours: "Вне графика — +20 000 сум", total: "Итого", subtotal: "Товары", delivery_fee: "Доставка", submit: "Заказать", submitted: "Заказ отправлен!", current_time: "Текущее время (Узбекистан Наманган)" },
      auth: { login: "Войти", register: "Регистрация", logout: "Выйти", google: "Продолжить с Google", email: "Email", password: "Пароль", confirm_password: "Повторите пароль", full_name: "Имя", phone: "Телефон", passwords_mismatch: "Пароли не совпадают", phone_invalid: "Неверный телефон", success_signup: "Регистрация прошла успешно", success_login: "Добро пожаловать" },
      common: { loading: "Загрузка...", save: "Сохранить", cancel: "Отмена", delete: "Удалить", edit: "Изменить", add: "Добавить", search: "Поиск", language: "Язык", theme: "Тема", stock: "В наличии", out_of_stock: "Нет в наличии", sum: "сум" },
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
      cart: { add: "Added to cart", remove: "Removed from cart", empty: "Cart is empty", checkout: "Checkout", pickup: "Pickup", courier: "Courier", free_courier: "Courier 10:00–22:00 free", outside_hours: "Off-hours — +20 000 sum", total: "Total", subtotal: "Subtotal", delivery_fee: "Delivery", submit: "Place order", submitted: "Order placed!", current_time: "Time (Namangan)" },
      auth: { login: "Login", register: "Sign up", logout: "Logout", google: "Continue with Google", email: "Email", password: "Password", confirm_password: "Confirm password", full_name: "Name", phone: "Phone number", passwords_mismatch: "Passwords don't match", phone_invalid: "Invalid phone", success_signup: "Account created", success_login: "Welcome" },
      common: { loading: "Loading...", save: "Save", cancel: "Cancel", delete: "Delete", edit: "Edit", add: "Add", search: "Search", language: "Language", theme: "Theme", stock: "In stock", out_of_stock: "Out of stock", sum: "sum" },
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
  i18n.use(initReactI18next).init({
    resources,
    lng: stored || "uz",
    fallbackLng: "uz",
    interpolation: { escapeValue: false },
  });
}

export default i18n;
