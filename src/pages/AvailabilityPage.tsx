import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";
import { Plus, Trash2, Calendar, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const DEFAULT_TIMES = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30",
];

export function AvailabilityPage() {
  const slots = useQuery(api.availableSlots.list);
  const addSlots = useMutation(api.availableSlots.addSlots);
  const removeSlot = useMutation(api.availableSlots.removeSlot);
  const removeSlotsForDate = useMutation(api.availableSlots.removeSlotsForDate);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [customTime, setCustomTime] = useState("");

  // Group slots by date
  const slotsByDate: Record<string, Array<{ _id: Id<"availableSlots">; time: string; isBooked: boolean }>> = {};
  if (slots) {
    for (const slot of slots) {
      if (!slotsByDate[slot.date]) slotsByDate[slot.date] = [];
      slotsByDate[slot.date].push(slot);
    }
    // Sort times within each date
    for (const date in slotsByDate) {
      slotsByDate[date].sort((a, b) => a.time.localeCompare(b.time));
    }
  }

  const sortedDates = Object.keys(slotsByDate).sort();

  const openAddDialog = () => {
    // Default to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow.toISOString().split("T")[0]);
    setSelectedTimes([]);
    setDialogOpen(true);
  };

  const toggleTime = (time: string) => {
    setSelectedTimes((prev) =>
      prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time],
    );
  };

  const selectAllTimes = () => setSelectedTimes([...DEFAULT_TIMES]);
  const clearAllTimes = () => setSelectedTimes([]);

  const addCustomTime = () => {
    if (customTime && !selectedTimes.includes(customTime)) {
      setSelectedTimes((prev) => [...prev, customTime].sort());
      setCustomTime("");
    }
  };

  const handleSave = async () => {
    if (!selectedDate || selectedTimes.length === 0) return;
    await addSlots({ date: selectedDate, times: selectedTimes });
    toast.success(`Добавлено ${selectedTimes.length} слотов на ${formatDate(selectedDate)}`);
    setDialogOpen(false);
  };

  const handleRemoveSlot = async (id: Id<"availableSlots">) => {
    await removeSlot({ id });
    toast.success("Слот удалён");
  };

  const handleRemoveDate = async (date: string) => {
    if (!confirm(`Удалить все слоты на ${formatDate(date)}?`)) return;
    await removeSlotsForDate({ date });
    toast.success("Все слоты удалены");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-serif">
            Расписание
          </h1>
          <p className="text-muted-foreground mt-1">
            Укажите свободные даты и время для записи клиентов
          </p>
        </div>
        <Button onClick={openAddDialog} className="rounded-xl">
          <Plus className="size-4 mr-2" />
          Добавить дату
        </Button>
      </div>

      {sortedDates.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Calendar className="size-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">Расписание пока пустое</p>
          <p className="text-sm mb-4">
            Добавьте свободные даты и время
          </p>
          <Button onClick={openAddDialog}>
            <Plus className="size-4 mr-2" />
            Добавить дату
          </Button>
        </div>
      )}

      {sortedDates.map((date) => {
        const dateSlots = slotsByDate[date];
        const freeCount = dateSlots.filter((s) => !s.isBooked).length;
        const bookedCount = dateSlots.filter((s) => s.isBooked).length;
        const isPast = date < new Date().toISOString().split("T")[0];

        return (
          <div
            key={date}
            className={`bg-card border rounded-xl p-5 ${isPast ? "opacity-50" : ""}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar className="size-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{formatDate(date)}</h3>
                  <p className="text-sm text-muted-foreground">
                    {freeCount} свободных · {bookedCount} занятых
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive hover:text-destructive"
                onClick={() => handleRemoveDate(date)}
              >
                <Trash2 className="size-4 mr-1" />
                Удалить день
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {dateSlots.map((slot) => (
                <div
                  key={slot._id}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm ${
                    slot.isBooked
                      ? "bg-destructive/5 border-destructive/20 text-destructive"
                      : "bg-primary/5 border-primary/20"
                  }`}
                >
                  <Clock className="size-3" />
                  <span className="font-medium">{slot.time}</span>
                  {slot.isBooked && (
                    <Badge variant="destructive" className="text-[10px] px-1 py-0 ml-1">
                      занято
                    </Badge>
                  )}
                  {!slot.isBooked && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSlot(slot._id)}
                      className="ml-1 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="size-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Add Slots Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif">
              Добавить свободные слоты
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5">Дата</label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Время</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={selectAllTimes}
                    className="text-xs text-primary hover:underline"
                  >
                    Выбрать все
                  </button>
                  <button
                    type="button"
                    onClick={clearAllTimes}
                    className="text-xs text-muted-foreground hover:underline"
                  >
                    Очистить
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                {DEFAULT_TIMES.map((time) => (
                  <button
                    type="button"
                    key={time}
                    onClick={() => toggleTime(time)}
                    className={`px-2 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                      selectedTimes.includes(time)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "hover:bg-muted border-border"
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Своё время
              </label>
              <div className="flex gap-2">
                <Input
                  type="time"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addCustomTime}
                  disabled={!customTime}
                >
                  <Plus className="size-4" />
                </Button>
              </div>
            </div>

            {selectedTimes.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Выбрано: {selectedTimes.length} слотов
              </p>
            )}

            <Button
              onClick={handleSave}
              className="w-full"
              disabled={!selectedDate || selectedTimes.length === 0}
            >
              Добавить {selectedTimes.length} слотов
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function formatDate(dateStr: string): string {
  const days = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"];
  const months = [
    "января", "февраля", "марта", "апреля", "мая", "июня",
    "июля", "августа", "сентября", "октября", "ноября", "декабря",
  ];
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return `${d} ${months[m - 1]}, ${days[date.getDay()]}`;
}
