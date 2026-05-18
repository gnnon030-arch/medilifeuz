import { Phone, Mail, MapPin } from "lucide-react";
import logo from "@/assets/medilife-logo.jpg";

export function Footer() {
  return (
    <footer className="border-t bg-card mt-16">
      <div className="container mx-auto px-4 py-10 grid gap-8 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <img src={logo} alt="MediLife" className="h-10 w-10 rounded-md object-cover" />
            <span className="font-bold text-xl text-primary">MediLife</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Sog'lig'ingiz uchun ishonchli onlayn dorixona. Eng sara va arzon dorilar — Namangan shahrida.
          </p>
        </div>
        <div>
          <h3 className="font-semibold mb-3">Call markaz</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> <a href="tel:+998913620080">+998 91 362 00 80</a></li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> <a href="mailto:gnnon030@gmail.com">gnnon030@gmail.com</a></li>
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Namangan shahri, O'zbekiston</li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-3">Mas'ul</h3>
          <p className="text-sm text-muted-foreground">Ismoil</p>
          <p className="text-sm text-muted-foreground mt-4">© 2000 MediLife. Barcha huquqlar himoyalangan.</p>
        </div>
      </div>
    </footer>
  );
}
