import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useState, useRef } from "react";
import {
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Star,
  MessageSquare,
  Check,
  X,
  Upload,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type Review = NonNullable<ReturnType<typeof useQuery<typeof api.reviews.list>>>[number];

function StarRating({
  value,
  onChange,
  readonly = false,
}: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
}) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          className={`${readonly ? "cursor-default" : "cursor-pointer hover:scale-110"} transition-transform`}
        >
          <Star
            className={`size-5 ${
              star <= value
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground/30"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function AddReviewDialog({
  open,
  onClose,
  reviewCount,
}: {
  open: boolean;
  onClose: () => void;
  reviewCount: number;
}) {
  const createReview = useMutation(api.reviews.create);
  const generateUrl = useMutation(api.reviews.generateUploadUrl);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [photoId, setPhotoId] = useState<Id<"_storage"> | undefined>();
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await generateUrl();
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await res.json();
      setPhotoId(storageId);
      setPhotoPreview(URL.createObjectURL(file));
    } catch {
      toast.error("Ошибка загрузки фото");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !text.trim()) {
      toast.error("Заполните имя и текст отзыва");
      return;
    }
    setSaving(true);
    try {
      await createReview({
        clientName: name.trim(),
        text: text.trim(),
        rating,
        date,
        photoStorageId: photoId,
        sortOrder: reviewCount + 1,
      });
      toast.success("Отзыв добавлен");
      setName("");
      setText("");
      setRating(5);
      setDate(new Date().toISOString().split("T")[0]);
      setPhotoId(undefined);
      setPhotoPreview(null);
      onClose();
    } catch {
      toast.error("Ошибка при сохранении");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card rounded-2xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold font-serif mb-4">Добавить отзыв</h2>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">
              Имя клиента *
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Анна"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Оценка</label>
            <StarRating value={rating} onChange={setRating} />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">
              Текст отзыва *
            </label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Очень довольна результатом! Реснички выглядят идеально..."
              rows={4}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Дата</label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">
              Фото клиента (необязательно)
            </label>
            <input
              type="file"
              ref={fileRef}
              onChange={handlePhotoUpload}
              accept="image/*"
              className="hidden"
            />
            <div className="flex items-center gap-3">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="size-16 rounded-full object-cover border-2 border-primary/20"
                />
              ) : (
                <div className="size-16 rounded-full bg-muted flex items-center justify-center">
                  <User className="size-6 text-muted-foreground" />
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  "Загрузка..."
                ) : (
                  <>
                    <Upload className="size-4 mr-1" />
                    {photoPreview ? "Заменить" : "Загрузить"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Сохранение..." : "Добавить"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ReviewCard({
  review,
  onApprove,
  onReject,
  onToggleVisibility,
  onDelete,
}: {
  review: Review;
  onApprove: () => void;
  onReject: () => void;
  onToggleVisibility: () => void;
  onDelete: () => void;
}) {
  const statusColors = {
    approved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };

  const statusLabels = {
    approved: "Одобрен",
    pending: "На модерации",
    rejected: "Отклонён",
  };

  const sourceLabels = {
    admin: "Админ",
    client: "Клиент",
  };

  return (
    <div
      className={`rounded-xl border p-4 space-y-3 ${
        !review.isVisible ? "opacity-60" : ""
      } ${review.status === "pending" ? "border-amber-300 dark:border-amber-700" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {review.photoUrl ? (
            <img
              src={review.photoUrl}
              alt={review.clientName}
              className="size-10 rounded-full object-cover"
            />
          ) : (
            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="size-5 text-primary" />
            </div>
          )}
          <div>
            <p className="font-medium text-sm">{review.clientName}</p>
            <div className="flex items-center gap-2">
              <StarRating value={review.rating} readonly />
              <span className="text-xs text-muted-foreground">
                {review.date}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span
            className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColors[review.status]}`}
          >
            {statusLabels[review.status]}
          </span>
          <span className="text-[10px] text-muted-foreground px-1.5 py-0.5 rounded-full bg-muted">
            {sourceLabels[review.source]}
          </span>
        </div>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed">
        {review.text}
      </p>

      <div className="flex items-center justify-between pt-1">
        <div className="flex gap-1">
          {review.status === "pending" && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                onClick={onApprove}
              >
                <Check className="size-3 mr-1" />
                Одобрить
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50"
                onClick={onReject}
              >
                <X className="size-3 mr-1" />
                Отклонить
              </Button>
            </>
          )}
          {review.status === "rejected" && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={onApprove}
            >
              <Check className="size-3 mr-1" />
              Одобрить
            </Button>
          )}
        </div>

        <div className="flex gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="size-7"
            onClick={onToggleVisibility}
            title={review.isVisible ? "Скрыть" : "Показать"}
          >
            {review.isVisible ? (
              <Eye className="size-3.5" />
            ) : (
              <EyeOff className="size-3.5" />
            )}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="size-7 text-destructive hover:bg-destructive/10"
            onClick={onDelete}
            title="Удалить"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ReviewsPage() {
  const reviews = useQuery(api.reviews.list);
  const pendingCount = useQuery(api.reviews.countPending);
  const approveMut = useMutation(api.reviews.approve);
  const rejectMut = useMutation(api.reviews.reject);
  const updateMut = useMutation(api.reviews.update);
  const removeMut = useMutation(api.reviews.remove);

  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");

  const filtered = reviews?.filter((r) => {
    if (filter === "all") return true;
    return r.status === filter;
  });

  const handleApprove = async (id: Id<"reviews">) => {
    await approveMut({ id });
    toast.success("Отзыв одобрен");
  };

  const handleReject = async (id: Id<"reviews">) => {
    await rejectMut({ id });
    toast.success("Отзыв отклонён");
  };

  const handleToggleVisibility = async (review: Review) => {
    await updateMut({
      id: review._id,
      clientName: review.clientName,
      text: review.text,
      rating: review.rating,
      date: review.date,
      sortOrder: review.sortOrder,
      isVisible: !review.isVisible,
      status: review.status,
    });
    toast.success(review.isVisible ? "Отзыв скрыт" : "Отзыв показан");
  };

  const handleDelete = async (id: Id<"reviews">) => {
    if (!confirm("Удалить этот отзыв?")) return;
    await removeMut({ id });
    toast.success("Отзыв удалён");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-serif">
            Отзывы
          </h1>
          <p className="text-muted-foreground mt-1">
            Управление отзывами клиентов
            {pendingCount ? (
              <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                {pendingCount} на модерации
              </span>
            ) : null}
          </p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="rounded-xl">
          <Plus className="size-4 mr-2" />
          Добавить отзыв
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(["all", "pending", "approved", "rejected"] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f)}
            className="rounded-lg text-xs"
          >
            {f === "all" && "Все"}
            {f === "pending" && `На модерации${pendingCount ? ` (${pendingCount})` : ""}`}
            {f === "approved" && "Одобренные"}
            {f === "rejected" && "Отклонённые"}
          </Button>
        ))}
      </div>

      {/* Empty state */}
      {filtered && filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <MessageSquare className="size-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">
            {filter === "all"
              ? "Отзывов пока нет"
              : filter === "pending"
                ? "Нет отзывов на модерации"
                : filter === "approved"
                  ? "Нет одобренных отзывов"
                  : "Нет отклонённых отзывов"}
          </p>
          {filter === "all" && (
            <>
              <p className="text-sm mb-4">
                Добавьте отзывы или клиенты смогут оставлять их на сайте
              </p>
              <Button onClick={() => setShowAdd(true)}>
                <Plus className="size-4 mr-2" />
                Добавить отзыв
              </Button>
            </>
          )}
        </div>
      )}

      {/* Reviews grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered?.map((review) => (
          <ReviewCard
            key={review._id}
            review={review}
            onApprove={() => handleApprove(review._id)}
            onReject={() => handleReject(review._id)}
            onToggleVisibility={() => handleToggleVisibility(review)}
            onDelete={() => handleDelete(review._id)}
          />
        ))}
      </div>

      <AddReviewDialog
        open={showAdd}
        onClose={() => setShowAdd(false)}
        reviewCount={reviews?.length ?? 0}
      />
    </div>
  );
}
