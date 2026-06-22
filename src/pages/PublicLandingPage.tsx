import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useState, useRef } from "react";
import {
  Phone,
  MapPin,
  Clock,
  Send,
  Sparkles,
  Star,
  ArrowRight,
  CheckCircle2,
  Instagram,
  X,
  ChevronLeft,
  ChevronRight,
  Shield,
  Award,
  MessageSquare,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export function PublicLandingPage() {
  const settings = useQuery(api.siteSettings.get);
  const services = useQuery(api.services.listActive);
  const galleryItems = useQuery(api.gallery.listVisible);
  const customSections = useQuery(api.customSections.listVisible);
  const reviews = useQuery(api.reviews.listPublic);

  const studioName = settings?.studioName || "Lash Studio";

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <HeroSection settings={settings} />
      <ServicesSection services={services ?? []} />
      <GallerySection items={galleryItems ?? []} />
      <ReviewsSection reviews={reviews ?? []} />
      {/* Custom sections */}
      {(customSections ?? []).map((section) => (
        <CustomSection key={section._id} section={section} />
      ))}
      <BookingSection services={services ?? []} />
      <ContactSection settings={settings} />
      <Footer studioName={studioName} />
    </div>
  );
}

/* ───── Hero ───── */
function HeroSection({
  settings,
}: { settings: ReturnType<typeof useQuery<typeof api.siteSettings.get>> }) {
  const scrollToBooking = () => {
    document
      .getElementById("booking")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
      {/* Background: hero image or gradient */}
      <div className="absolute inset-0 -z-10">
        {settings?.heroImageUrl ? (
          <>
            <img
              src={settings.heroImageUrl}
              alt={settings.studioName || "Hero"}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.04] via-background to-background" />
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-primary/8 to-transparent blur-[100px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tl from-rose-gold/10 to-transparent blur-[100px]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,oklch(0.65_0.12_15/0.03)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.65_0.12_15/0.03)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
          </>
        )}
      </div>

      <div className={`container text-center py-20 px-4 ${settings?.heroImageUrl ? "text-white" : ""}`} style={settings?.heroImageUrl ? { textShadow: "0 2px 16px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.4)" } : undefined}>
        {/* Title */}
        <h1 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-6 font-serif ${settings?.heroImageUrl ? "" : "text-foreground"}`}>
          {(() => {
            const title = settings?.heroTitle || "Идеальные ресницы для вашего взгляда";
            const words = title.split(" ");
            const mid = Math.ceil(words.length / 2);
            return (
              <>
                {words.slice(0, mid).join(" ")}
                <br />
                <span className={settings?.heroImageUrl ? "text-white/80" : "text-primary"}>
                  {words.slice(mid).join(" ")}
                </span>
              </>
            );
          })()}
        </h1>

        <p className={`text-base md:text-lg max-w-xl mx-auto leading-relaxed mb-10 ${settings?.heroImageUrl ? "text-white/80" : "text-foreground/70"}`}>
          {settings?.heroSubtitle ||
            "Профессиональное наращивание ресниц. Подчеркните естественную красоту ваших глаз"}
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            size="lg"
            onClick={scrollToBooking}
            className="px-8 py-6 text-base rounded-full shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 hover:scale-[1.02] transition-all"
          >
            Записаться
            <ArrowRight className="size-4 ml-2" />
          </Button>
          <Button
            variant="ghost"
            size="lg"
            onClick={() =>
              document
                .getElementById("services")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className={`px-8 py-6 text-base rounded-full ${settings?.heroImageUrl ? "text-white/80 hover:text-white hover:bg-white/10" : "text-muted-foreground hover:text-foreground"}`}
          >
            Смотреть услуги
          </Button>
        </div>

        {/* Trust indicators - glass cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-16 max-w-2xl mx-auto">
          {[
            { icon: Star, label: "Премиальные материалы" },
            { icon: Award, label: "Сертифицированный мастер" },
            { icon: Shield, label: "Гарантия качества" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl backdrop-blur-sm border text-sm ${settings?.heroImageUrl ? "bg-white/10 border-white/20 text-white/90" : "bg-card/60 border-border/50 text-muted-foreground"}`}
            >
              <Icon className="size-4 text-primary shrink-0" />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───── Services ───── */
function ServicesSection({
  services,
}: {
  services: Array<{
    _id: Id<"services">;
    name: string;
    description: string;
    price: number;
    duration: string;
    category: string;
  }>;
}) {
  const categories = [...new Set(services.map((s) => s.category))];

  return (
    <section
      id="services"
      className="py-20 md:py-28 bg-gradient-to-b from-background to-accent/20"
    >
      <div className="container">
        <div className="text-center mb-16">
          <p className="text-sm font-medium text-primary mb-3 tracking-widest uppercase">
            Услуги
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 font-serif">
            Услуги и цены
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            Широкий выбор техник наращивания и ухода за ресницами
          </p>
        </div>

        {categories.map((category) => (
          <div key={category} className="mb-12 last:mb-0">
            <h3 className="text-lg font-semibold text-primary mb-6 flex items-center gap-2">
              <Sparkles className="size-4" />
              {category}
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services
                .filter((s) => s.category === category)
                .map((service) => (
                  <div
                    key={service._id}
                    className="group relative overflow-hidden rounded-2xl bg-card border p-6 transition-all hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20"
                  >
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 size-20 rounded-full bg-primary/5 blur-2xl transition-all group-hover:bg-primary/10" />
                    <div className="relative">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold text-lg">
                          {service.name}
                        </h4>
                        <span className="text-2xl font-bold text-primary whitespace-nowrap ml-4">
                          {service.price} BYN
                        </span>
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                        {service.description}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="size-3.5" />
                        <span>{service.duration}</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ───── Gallery ───── */
function GallerySection({
  items,
}: {
  items: Array<{
    _id: Id<"gallery">;
    url: string | null;
    caption: string;
  }>;
}) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const visibleItems = items.filter((i) => i.url);

  return (
    <section id="gallery" className="py-20 md:py-28">
      <div className="container">
        <div className="text-center mb-16">
          <p className="text-sm font-medium text-primary mb-3 tracking-widest uppercase">
            Портфолио
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 font-serif">
            Мои работы
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            Каждый взгляд — произведение искусства
          </p>
        </div>

        {visibleItems.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {visibleItems.map((item, idx) => (
              <button
                type="button"
                key={item._id}
                className="group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer"
                onClick={() => setSelectedIdx(idx)}
              >
                <img
                  src={item.url!}
                  alt={item.caption}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {item.caption && (
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                    {item.caption}
                  </div>
                )}
              </button>
            ))}
          </div>
        ) : (
          /* Placeholder grid when no photos uploaded yet */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gradient-to-br from-primary/[0.06] via-accent/40 to-primary/[0.04] border border-border/40 flex items-center justify-center"
              >
                <div className="text-center px-4">
                  <div className="inline-flex size-12 items-center justify-center rounded-full bg-primary/10 mb-3">
                    <Sparkles className="size-5 text-primary/50" />
                  </div>
                  <p className="text-xs text-muted-foreground/60">Скоро здесь появятся фото работ</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selectedIdx !== null && visibleItems[selectedIdx] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setSelectedIdx(null)}
        >
          <button
            type="button"
            className="absolute top-4 right-4 text-white/80 hover:text-white z-10"
            onClick={() => setSelectedIdx(null)}
          >
            <X className="size-8" />
          </button>
          {selectedIdx > 0 && (
            <button
              type="button"
              className="absolute left-4 text-white/80 hover:text-white z-10"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIdx(selectedIdx - 1);
              }}
            >
              <ChevronLeft className="size-10" />
            </button>
          )}
          {selectedIdx < visibleItems.length - 1 && (
            <button
              type="button"
              className="absolute right-4 text-white/80 hover:text-white z-10"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIdx(selectedIdx + 1);
              }}
            >
              <ChevronRight className="size-10" />
            </button>
          )}
          <img
            src={visibleItems[selectedIdx]?.url ?? ""}
            alt={visibleItems[selectedIdx]?.caption ?? ""}
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          {visibleItems[selectedIdx]?.caption && (
            <p className="absolute bottom-6 text-white text-center font-medium">
              {visibleItems[selectedIdx].caption}
            </p>
          )}
        </div>
      )}
    </section>
  );
}

/* ───── Reviews ───── */
function ReviewsSection({
  reviews,
}: {
  reviews: Array<{
    _id: Id<"reviews">;
    clientName: string;
    text: string;
    rating: number;
    photoUrl: string | null;
    date: string;
  }>;
}) {
  const submitReview = useMutation(api.reviews.submit);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !text.trim()) {
      toast.error("Пожалуйста, заполните имя и текст отзыва");
      return;
    }
    setSubmitting(true);
    try {
      await submitReview({
        clientName: name.trim(),
        text: text.trim(),
        rating,
      });
      toast.success("Спасибо за отзыв! Он появится после модерации");
      setName("");
      setText("");
      setRating(5);
      setShowForm(false);
    } catch {
      toast.error("Ошибка при отправке");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="reviews" className="py-20 md:py-28 bg-accent/30">
      <div className="container">
        <div className="text-center mb-16">
          <p className="text-sm font-medium text-primary mb-3 tracking-widest uppercase">
            Отзывы
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 font-serif">
            Что говорят клиенты
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            Доверие наших клиентов — лучшая награда
          </p>
        </div>

        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {reviews.map((review) => (
              <div
                key={review._id}
                className="bg-card rounded-2xl p-6 shadow-sm border border-border/50 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 mb-4">
                  {review.photoUrl ? (
                    <img
                      src={review.photoUrl}
                      alt={review.clientName}
                      className="size-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="size-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <span className="text-lg font-semibold text-primary">
                        {review.clientName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-sm">{review.clientName}</p>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`size-3.5 ${
                            star <= review.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-muted-foreground/20"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  "{review.text}"
                </p>
                <p className="text-xs text-muted-foreground/60">{review.date}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center mb-12">
            <div className="inline-flex size-16 items-center justify-center rounded-full bg-primary/10 mb-4">
              <MessageSquare className="size-7 text-primary/50" />
            </div>
            <p className="text-muted-foreground mb-2">
              Отзывов пока нет
            </p>
            <p className="text-sm text-muted-foreground/60">
              Будьте первым!
            </p>
          </div>
        )}

        {/* Leave a review form */}
        <div className="text-center">
          {!showForm ? (
            <Button
              variant="outline"
              size="lg"
              className="rounded-full px-8"
              onClick={() => setShowForm(true)}
            >
              <MessageSquare className="size-4 mr-2" />
              Оставить отзыв
            </Button>
          ) : (
            <div className="max-w-md mx-auto bg-card rounded-2xl p-6 shadow-sm border">
              <h3 className="font-semibold text-lg mb-4 font-serif">
                Ваш отзыв
              </h3>
              <div className="space-y-3 text-left">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Ваше имя
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Анна"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Оценка
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`size-6 ${
                            star <= rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Отзыв
                  </label>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Расскажите о вашем опыте..."
                    rows={4}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex-1 rounded-xl"
                  >
                    {submitting ? "Отправка..." : "Отправить"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowForm(false)}
                    className="rounded-xl"
                  >
                    Отмена
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ───── Booking ───── */
function BookingSection({
  services,
}: {
  services: Array<{
    _id: Id<"services">;
    name: string;
    price: number;
  }>;
}) {
  const createBooking = useMutation(api.bookings.create);
  const availableSlots = useQuery(api.availableSlots.listAvailable);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlotId, setSelectedSlotId] = useState<string>("");

  // Has admin set up any slots?
  const hasSlots = availableSlots && availableSlots.length > 0;

  // Get unique available dates
  const availableDates = hasSlots
    ? [...new Set(availableSlots.map((s) => s.date))].sort()
    : [];

  // Get times for selected date
  const timesForDate = hasSlots && selectedDate
    ? availableSlots
        .filter((s) => s.date === selectedDate)
        .sort((a, b) => a.time.localeCompare(b.time))
    : [];

  const selectedSlot = timesForDate.find((s) => s._id === selectedSlotId);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      await createBooking({
        clientName: data.get("name") as string,
        clientPhone: data.get("phone") as string,
        clientTelegram: (data.get("telegram") as string) || undefined,
        serviceId: selectedService as Id<"services">,
        slotId: hasSlots && selectedSlotId ? selectedSlotId as Id<"availableSlots"> : undefined,
        preferredDate: hasSlots ? selectedDate : (data.get("date") as string),
        preferredTime: hasSlots && selectedSlot ? selectedSlot.time : (data.get("time") as string),
        notes: (data.get("notes") as string) || undefined,
      });
      setSubmitted(true);
      toast.success("Запись создана! Мы свяжемся с вами для подтверждения.");
    } catch {
      toast.error("Ошибка при создании записи. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  };

  const formatDateLabel = (dateStr: string) => {
    const months = ["янв", "фев", "мар", "апр", "мая", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
    const days = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"];
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return `${d} ${months[m - 1]}, ${days[date.getDay()]}`;
  };

  if (submitted) {
    return (
      <section
        id="booking"
        className="py-20 md:py-28 bg-gradient-to-b from-accent/20 to-background"
      >
        <div className="container">
          <div className="max-w-lg mx-auto text-center">
            <div className="inline-flex size-20 items-center justify-center rounded-full bg-primary/10 mb-6">
              <CheckCircle2 className="size-10 text-primary" />
            </div>
            <h2 className="text-3xl font-bold mb-4 font-serif">
              Запись отправлена!
            </h2>
            <p className="text-muted-foreground text-lg mb-6">
              Спасибо! Мы свяжемся с вами в ближайшее время для подтверждения
              даты и времени.
            </p>
            <Button
              variant="outline"
              onClick={() => { setSubmitted(false); setSelectedDate(""); setSelectedSlotId(""); }}
              className="rounded-full"
            >
              Записаться ещё
            </Button>
          </div>
        </div>
      </section>
    );
  }

  const isFormValid = selectedService && (hasSlots ? (selectedDate && selectedSlotId) : true);

  return (
    <section
      id="booking"
      className="py-20 md:py-28 bg-gradient-to-b from-accent/20 to-background"
    >
      <div className="container">
        <div className="text-center mb-16">
          <p className="text-sm font-medium text-primary mb-3 tracking-widest uppercase">
            Запись
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 font-serif">
            Записаться на процедуру
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            {hasSlots
              ? "Выберите удобную дату и время из доступных"
              : "Заполните форму и мы свяжемся с вами для подтверждения"}
          </p>
        </div>

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="max-w-xl mx-auto space-y-5"
        >
          <div className="bg-card rounded-2xl border p-6 md:p-8 space-y-5 shadow-sm">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Ваше имя *
                </label>
                <Input
                  name="name"
                  placeholder="Анна"
                  required
                  className="rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Телефон *
                </label>
                <Input
                  name="phone"
                  placeholder="+375 (29) 000-00-00"
                  required
                  className="rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Telegram (необязательно)
              </label>
              <Input
                name="telegram"
                placeholder="@username"
                className="rounded-xl"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Услуга *
              </label>
              <Select
                value={selectedService}
                onValueChange={setSelectedService}
                required
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Выберите услугу" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((s) => (
                    <SelectItem key={s._id} value={s._id}>
                      {s.name} — {s.price} BYN
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date/Time: slot-based or free-form */}
            {hasSlots ? (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Выберите дату *
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableDates.map((date) => (
                      <button
                        type="button"
                        key={date}
                        onClick={() => { setSelectedDate(date); setSelectedSlotId(""); }}
                        className={`px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${
                          selectedDate === date
                            ? "bg-primary text-primary-foreground border-primary"
                            : "hover:bg-muted border-border"
                        }`}
                      >
                        {formatDateLabel(date)}
                      </button>
                    ))}
                  </div>
                </div>

                {selectedDate && timesForDate.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Выберите время *
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {timesForDate.map((slot) => (
                        <button
                          type="button"
                          key={slot._id}
                          onClick={() => setSelectedSlotId(slot._id)}
                          className={`px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${
                            selectedSlotId === slot._id
                              ? "bg-primary text-primary-foreground border-primary"
                              : "hover:bg-muted border-border"
                          }`}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedDate && timesForDate.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    На эту дату нет свободного времени
                  </p>
                )}
              </>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Желаемая дата *
                  </label>
                  <Input
                    name="date"
                    type="date"
                    required
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Желаемое время *
                  </label>
                  <Input
                    name="time"
                    type="time"
                    required
                    className="rounded-xl"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Пожелания
              </label>
              <Textarea
                name="notes"
                placeholder="Расскажите о своих пожеланиях..."
                rows={3}
                className="rounded-xl resize-none"
              />
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={loading || !isFormValid}
              className="w-full rounded-xl py-6 text-base shadow-lg shadow-primary/20"
            >
              {loading ? (
                "Отправка..."
              ) : (
                <>
                  <Send className="size-4 mr-2" />
                  Записаться
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}

/* ───── Contact ───── */
function ContactSection({
  settings,
}: { settings: ReturnType<typeof useQuery<typeof api.siteSettings.get>> }) {
  if (!settings) return null;

  const contacts = [
    {
      icon: Phone,
      label: "Телефон",
      value: settings.phone,
      href: `tel:${settings.phone.replace(/[^+\d]/g, "")}`,
    },
    {
      icon: MapPin,
      label: "Адрес",
      value: `${settings.address}, ${settings.city}`,
    },
    { icon: Clock, label: "Время работы", value: settings.workingHours },
  ];

  return (
    <section
      id="contacts"
      className="py-20 md:py-28 bg-gradient-to-b from-background to-accent/20"
    >
      <div className="container">
        <div className="text-center mb-16">
          <p className="text-sm font-medium text-primary mb-3 tracking-widest uppercase">
            Контакты
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 font-serif">
            Свяжитесь со мной
          </h2>
        </div>

        <div className="max-w-3xl mx-auto">
          {/* About */}
          {settings.aboutText && (
            <div className="text-center mb-12">
              <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto">
                {settings.aboutText}
              </p>
            </div>
          )}

          <div className="grid sm:grid-cols-3 gap-4">
            {contacts.map((contact) => (
              <div
                key={contact.label}
                className="bg-card rounded-2xl border p-6 text-center hover:shadow-md transition-shadow"
              >
                <div className="inline-flex size-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                  <contact.icon className="size-5 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  {contact.label}
                </p>
                {contact.href ? (
                  <a
                    href={contact.href}
                    className="text-sm font-medium hover:text-primary transition-colors"
                  >
                    {contact.value}
                  </a>
                ) : (
                  <p className="text-sm font-medium">{contact.value}</p>
                )}
              </div>
            ))}
          </div>

          {/* Social */}
          <div className="flex items-center justify-center gap-4 mt-8">
            {settings.instagram && (
              <a
                href={`https://instagram.com/${settings.instagram.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border hover:bg-primary/5 hover:border-primary/20 transition-colors text-sm font-medium"
              >
                <Instagram className="size-4" />
                {settings.instagram}
              </a>
            )}
            {settings.telegram && (
              <a
                href={`https://t.me/${settings.telegram.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border hover:bg-primary/5 hover:border-primary/20 transition-colors text-sm font-medium"
              >
                <Send className="size-4" />
                {settings.telegram}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───── Custom Section ───── */
function CustomSection({
  section,
}: {
  section: {
    _id: string;
    title: string;
    subtitle?: string;
    content: string;
    imageUrl: string | null;
    layout: string;
    backgroundColor?: string;
  };
}) {
  const bgClass =
    section.backgroundColor === "accent"
      ? "bg-gradient-to-b from-accent/30 to-accent/10"
      : section.backgroundColor === "dark"
        ? "bg-foreground text-background"
        : "bg-background";

  const isDark = section.backgroundColor === "dark";

  const renderContent = () => {
    if (section.layout === "cards") {
      const cards = section.content
        .split("\n")
        .filter((l) => l.trim())
        .map((line) => {
          const [title, ...rest] = line.split("|");
          return { title: title.trim(), desc: rest.join("|").trim() };
        });
      return (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
          {cards.map((card, i) => (
            <div
              key={i}
              className={`rounded-2xl border p-6 ${isDark ? "border-white/10 bg-white/5" : "bg-card hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20"} transition-all`}
            >
              <h4 className="font-semibold text-lg mb-2">{card.title}</h4>
              {card.desc && (
                <p className={`text-sm leading-relaxed ${isDark ? "text-white/70" : "text-muted-foreground"}`}>
                  {card.desc}
                </p>
              )}
            </div>
          ))}
        </div>
      );
    }

    const textBlock = (
      <div className="space-y-4">
        {section.content.split("\n").map((p, i) =>
          p.trim() ? (
            <p key={i} className={`text-base leading-relaxed ${isDark ? "text-white/80" : "text-muted-foreground"}`}>
              {p}
            </p>
          ) : null,
        )}
      </div>
    );

    if (section.layout === "text" || !section.imageUrl) {
      return <div className="max-w-3xl mx-auto mt-10">{textBlock}</div>;
    }

    if (section.layout === "image_top") {
      return (
        <div className="max-w-4xl mx-auto mt-10 space-y-8">
          <div className="rounded-2xl overflow-hidden aspect-video">
            <img src={section.imageUrl} alt="" className="w-full h-full object-cover" />
          </div>
          {textBlock}
        </div>
      );
    }

    // image_left or image_right
    const imgFirst = section.layout === "image_left";
    return (
      <div className={`max-w-5xl mx-auto mt-10 grid md:grid-cols-2 gap-8 md:gap-12 items-center ${!imgFirst ? "direction-rtl" : ""}`}>
        <div className={`rounded-2xl overflow-hidden aspect-[4/3] ${!imgFirst ? "md:order-2" : ""}`}>
          <img src={section.imageUrl} alt="" className="w-full h-full object-cover" />
        </div>
        <div className={!imgFirst ? "md:order-1" : ""}>{textBlock}</div>
      </div>
    );
  };

  return (
    <section className={`py-20 md:py-28 ${bgClass}`}>
      <div className="container">
        <div className="text-center mb-4">
          {section.subtitle && (
            <p className={`text-sm font-medium mb-3 tracking-widest uppercase ${isDark ? "text-white/50" : "text-primary"}`}>
              {section.subtitle}
            </p>
          )}
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight font-serif">
            {section.title}
          </h2>
        </div>
        {renderContent()}
      </div>
    </section>
  );
}

/* ───── Footer ───── */
function Footer({ studioName }: { studioName: string }) {
  return (
    <footer className="border-t py-8">
      <div className="container">
        <div className="flex flex-col items-center gap-4 text-sm text-muted-foreground">
          <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2">
            <a
              href="#services"
              className="hover:text-primary transition-colors"
            >
              Услуги
            </a>
            <a href="#gallery" className="hover:text-primary transition-colors">
              Портфолио
            </a>
            <a href="#booking" className="hover:text-primary transition-colors">
              Запись
            </a>
            <a
              href="#contacts"
              className="hover:text-primary transition-colors"
            >
              Контакты
            </a>
            <a
              href="/admin"
              className="hover:text-primary transition-colors opacity-40 hover:opacity-70"
            >
              Админ
            </a>
          </nav>
          <p className="text-xs text-center">
            © {new Date().getFullYear()} {studioName}. Все права защищены.
          </p>
        </div>
      </div>
    </footer>
  );
}
