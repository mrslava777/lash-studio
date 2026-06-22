import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { LashLogo } from "./LashLogo";

export function PublicHeader() {
  const settings = useQuery(api.siteSettings.get);
  const studioName = settings?.studioName || "Lash Studio";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="sticky top-0 z-50 bg-background/70 backdrop-blur-xl border-b border-border/50">
      <div className="container">
        <div className="flex h-16 items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2.5 font-semibold text-lg hover:opacity-80 transition-opacity"
          >
            {settings?.logoUrl ? (
              <img src={settings.logoUrl} alt={studioName} className="h-12 w-auto object-contain" />
            ) : (
              <LashLogo className="size-12 text-primary" />
            )}
            <span className="font-serif tracking-tight">
              {studioName}
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm">
            <button
              type="button"
              onClick={() => scrollTo("services")}
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Услуги
            </button>
            <button
              type="button"
              onClick={() => scrollTo("gallery")}
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Портфолио
            </button>
            <button
              type="button"
              onClick={() => scrollTo("contacts")}
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Контакты
            </button>
            <button
              type="button"
              onClick={() => scrollTo("booking")}
              className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30"
            >
              Записаться
            </button>
          </nav>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </button>
        </div>

        {/* Mobile nav */}
        {mobileMenuOpen && (
          <nav className="md:hidden border-t border-border/50 py-4 space-y-1">
            {[
              { id: "services", label: "Услуги" },
              { id: "gallery", label: "Портфолио" },
              { id: "contacts", label: "Контакты" },
            ].map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="block w-full text-left px-3 py-2.5 text-sm rounded-xl hover:bg-muted transition-colors font-medium"
              >
                {item.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => scrollTo("booking")}
              className="block w-full text-center mt-2 px-3 py-2.5 text-sm font-medium text-primary-foreground bg-primary rounded-xl"
            >
              Записаться
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}
