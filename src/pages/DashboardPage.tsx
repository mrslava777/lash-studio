import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  XCircle,
  Phone,
  MessageCircle,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const STATUS_LABELS: Record<string, string> = {
  new: "Новая",
  confirmed: "Подтверждена",
  completed: "Завершена",
  cancelled: "Отменена",
};

const STATUS_VARIANTS: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  new: "default",
  confirmed: "secondary",
  completed: "outline",
  cancelled: "destructive",
};

export function DashboardPage() {
  const bookings = useQuery(api.bookings.list);
  const updateStatus = useMutation(api.bookings.updateStatus);
  const removeBooking = useMutation(api.bookings.remove);

  const newCount = bookings?.filter((b) => b.status === "new").length ?? 0;
  const confirmedCount =
    bookings?.filter((b) => b.status === "confirmed").length ?? 0;
  const completedCount =
    bookings?.filter((b) => b.status === "completed").length ?? 0;

  const handleStatus = async (
    id: Id<"bookings">,
    status: "new" | "confirmed" | "completed" | "cancelled",
  ) => {
    await updateStatus({ id, status });
    toast.success(`Статус изменён на "${STATUS_LABELS[status]}"`);
  };

  const handleDelete = async (id: Id<"bookings">) => {
    await removeBooking({ id });
    toast.success("Запись удалена");
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-serif">
          Панель управления
        </h1>
        <p className="text-muted-foreground mt-1">Записи клиентов</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Clock className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{newCount}</p>
              <p className="text-sm text-muted-foreground">Новые</p>
            </div>
          </div>
        </div>
        <div className="bg-card border rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-info/10 flex items-center justify-center">
              <CalendarDays className="size-5 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold">{confirmedCount}</p>
              <p className="text-sm text-muted-foreground">Подтверждённые</p>
            </div>
          </div>
        </div>
        <div className="bg-card border rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="size-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{completedCount}</p>
              <p className="text-sm text-muted-foreground">Завершённые</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bookings list */}
      <div className="space-y-3">
        {!bookings && (
          <p className="text-muted-foreground text-center py-10">
            Загрузка...
          </p>
        )}
        {bookings && bookings.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <CalendarDays className="size-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">Записей пока нет</p>
            <p className="text-sm">
              Новые записи появятся здесь автоматически
            </p>
          </div>
        )}
        {bookings?.map((booking) => (
          <div
            key={booking._id}
            className="bg-card border rounded-xl p-5 space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{booking.clientName}</h3>
                  <Badge variant={STATUS_VARIANTS[booking.status]}>
                    {STATUS_LABELS[booking.status]}
                  </Badge>
                </div>
                <p className="text-sm text-primary font-medium">
                  {booking.serviceName}
                </p>
              </div>
              <div className="text-right text-sm">
                <p className="font-medium flex items-center gap-1.5">
                  <CalendarDays className="size-3.5" />
                  {booking.preferredDate}
                </p>
                <p className="text-muted-foreground flex items-center gap-1.5">
                  <Clock className="size-3.5" />
                  {booking.preferredTime}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Phone className="size-3.5" />
                {booking.clientPhone}
              </span>
              {booking.clientTelegram && (
                <span className="flex items-center gap-1">
                  <MessageCircle className="size-3.5" />
                  {booking.clientTelegram}
                </span>
              )}
              {booking.notes && (
                <span className="flex items-center gap-1">
                  <FileText className="size-3.5" />
                  {booking.notes}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {booking.status === "new" && (
                <Button
                  size="sm"
                  onClick={() => handleStatus(booking._id, "confirmed")}
                >
                  <CheckCircle2 className="size-3.5 mr-1" />
                  Подтвердить
                </Button>
              )}
              {(booking.status === "new" ||
                booking.status === "confirmed") && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatus(booking._id, "completed")}
                >
                  Завершить
                </Button>
              )}
              {booking.status !== "cancelled" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatus(booking._id, "cancelled")}
                >
                  <XCircle className="size-3.5 mr-1" />
                  Отменить
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive hover:text-destructive"
                onClick={() => handleDelete(booking._id)}
              >
                Удалить
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
