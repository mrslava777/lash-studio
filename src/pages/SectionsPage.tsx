import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useState, useRef } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Upload,
  X,
  GripVertical,
  ArrowUp,
  ArrowDown,
  LayoutTemplate,
  ImageIcon,
  Type,
  Columns2,
  LayoutList,
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

type Layout = "text" | "image_left" | "image_right" | "image_top" | "cards";
type Section = {
  _id: Id<"customSections">;
  _creationTime: number;
  title: string;
  subtitle?: string;
  content: string;
  imageStorageId?: Id<"_storage">;
  imageUrl: string | null;
  layout: Layout;
  backgroundColor?: string;
  sortOrder: number;
  isVisible: boolean;
};

const LAYOUT_OPTIONS: { value: Layout; label: string; icon: typeof Type }[] = [
  { value: "text", label: "Только текст", icon: Type },
  { value: "image_left", label: "Картинка слева", icon: Columns2 },
  { value: "image_right", label: "Картинка справа", icon: Columns2 },
  { value: "image_top", label: "Картинка сверху", icon: ImageIcon },
  { value: "cards", label: "Карточки", icon: LayoutList },
];

const BG_OPTIONS = [
  { value: "default", label: "Белый" },
  { value: "accent", label: "Розовый" },
  { value: "dark", label: "Тёмный" },
];

export function SectionsPage() {
  const sections = useQuery(api.customSections.list) ?? [];
  const createSection = useMutation(api.customSections.create);
  const updateSection = useMutation(api.customSections.update);
  const removeSection = useMutation(api.customSections.remove);
  const reorderSections = useMutation(api.customSections.reorder);
  const generateUploadUrl = useMutation(api.customSections.generateUploadUrl);

  const [editing, setEditing] = useState<Section | null>(null);
  const [creating, setCreating] = useState(false);

  const moveUp = async (idx: number) => {
    if (idx <= 0) return;
    const ids = sections.map((s) => s._id);
    [ids[idx - 1], ids[idx]] = [ids[idx], ids[idx - 1]];
    await reorderSections({ ids });
  };

  const moveDown = async (idx: number) => {
    if (idx >= sections.length - 1) return;
    const ids = sections.map((s) => s._id);
    [ids[idx], ids[idx + 1]] = [ids[idx + 1], ids[idx]];
    await reorderSections({ ids });
  };

  const toggleVisibility = async (section: Section) => {
    await updateSection({
      id: section._id,
      title: section.title,
      subtitle: section.subtitle,
      content: section.content,
      imageStorageId: section.imageStorageId,
      layout: section.layout,
      backgroundColor: section.backgroundColor,
      sortOrder: section.sortOrder,
      isVisible: !section.isVisible,
    });
    toast.success(section.isVisible ? "Раздел скрыт" : "Раздел показан");
  };

  const handleDelete = async (id: Id<"customSections">) => {
    if (!confirm("Удалить этот раздел?")) return;
    await removeSection({ id });
    toast.success("Раздел удалён");
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-serif">
            Разделы сайта
          </h1>
          <p className="text-muted-foreground mt-1">
            Добавляйте и редактируйте разделы на главной странице
          </p>
        </div>
        <Button onClick={() => setCreating(true)} className="gap-2">
          <Plus className="size-4" />
          Добавить раздел
        </Button>
      </div>

      {/* Section list */}
      {sections.length === 0 && !creating ? (
        <div className="text-center py-16 bg-card border rounded-xl">
          <LayoutTemplate className="size-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">Пока нет разделов</p>
          <Button onClick={() => setCreating(true)} variant="outline" className="gap-2">
            <Plus className="size-4" />
            Создать первый раздел
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {sections.map((section, idx) =>
            editing?._id === section._id ? (
              <SectionEditor
                key={section._id}
                section={section}
                onSave={async (data) => {
                  await updateSection({ id: section._id, sortOrder: section.sortOrder, isVisible: section.isVisible, ...data });
                  setEditing(null);
                  toast.success("Раздел обновлён");
                }}
                onCancel={() => setEditing(null)}
                generateUploadUrl={generateUploadUrl}
              />
            ) : (
              <div
                key={section._id}
                className={`bg-card border rounded-xl p-4 flex items-center gap-4 transition-opacity ${!section.isVisible ? "opacity-50" : ""}`}
              >
                <GripVertical className="size-5 text-muted-foreground/40 shrink-0" />

                {section.imageUrl && (
                  <img
                    src={section.imageUrl}
                    alt=""
                    className="size-14 rounded-lg object-cover shrink-0"
                  />
                )}

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{section.title}</h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span className="px-2 py-0.5 rounded-full bg-muted">
                      {LAYOUT_OPTIONS.find((l) => l.value === section.layout)?.label}
                    </span>
                    {section.backgroundColor && section.backgroundColor !== "default" && (
                      <span className="px-2 py-0.5 rounded-full bg-muted">
                        Фон: {BG_OPTIONS.find((b) => b.value === section.backgroundColor)?.label}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="size-8" onClick={() => moveUp(idx)} disabled={idx === 0}>
                    <ArrowUp className="size-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="size-8" onClick={() => moveDown(idx)} disabled={idx === sections.length - 1}>
                    <ArrowDown className="size-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="size-8" onClick={() => toggleVisibility(section)}>
                    {section.isVisible ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="size-8" onClick={() => setEditing(section)}>
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="size-8 text-destructive hover:text-destructive" onClick={() => handleDelete(section._id)}>
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            ),
          )}
        </div>
      )}

      {/* Create form */}
      {creating && (
        <SectionEditor
          section={null}
          onSave={async (data) => {
            await createSection(data);
            setCreating(false);
            toast.success("Раздел создан!");
          }}
          onCancel={() => setCreating(false)}
          generateUploadUrl={generateUploadUrl}
        />
      )}
    </div>
  );
}

/* ───── Section Editor ───── */
function SectionEditor({
  section,
  onSave,
  onCancel,
  generateUploadUrl,
}: {
  section: Section | null;
  onSave: (data: {
    title: string;
    subtitle?: string;
    content: string;
    imageStorageId?: Id<"_storage">;
    layout: Layout;
    backgroundColor?: string;
  }) => Promise<void>;
  onCancel: () => void;
  generateUploadUrl: () => Promise<string>;
}) {
  const [title, setTitle] = useState(section?.title ?? "");
  const [subtitle, setSubtitle] = useState(section?.subtitle ?? "");
  const [content, setContent] = useState(section?.content ?? "");
  const [layout, setLayout] = useState<Layout>(section?.layout ?? "text");
  const [bg, setBg] = useState(section?.backgroundColor ?? "default");
  const [imageStorageId, setImageStorageId] = useState<Id<"_storage"> | undefined>(section?.imageStorageId);
  const [imagePreview, setImagePreview] = useState<string | null>(section?.imageUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const needsImage = layout !== "text" && layout !== "cards";

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Выберите изображение");
      return;
    }
    setUploading(true);
    try {
      const url = await generateUploadUrl();
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await res.json();
      setImageStorageId(storageId);
      setImagePreview(URL.createObjectURL(file));
      toast.success("Картинка загружена");
    } catch {
      toast.error("Ошибка загрузки");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Введите название раздела");
      return;
    }
    setSaving(true);
    try {
      await onSave({
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        content: content.trim(),
        imageStorageId: needsImage ? imageStorageId : undefined,
        layout,
        backgroundColor: bg !== "default" ? bg : undefined,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-card border-2 border-primary/20 rounded-xl p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">
          {section ? "Редактировать раздел" : "Новый раздел"}
        </h3>
        <Button variant="ghost" size="icon" className="size-8" onClick={onCancel}>
          <X className="size-4" />
        </Button>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">Название раздела *</label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Например: О нас, Акции, Отзывы..." />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">Подзаголовок</label>
        <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Краткое описание раздела" />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Макет</label>
          <Select value={layout} onValueChange={(v) => setLayout(v as Layout)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LAYOUT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Фон</label>
          <Select value={bg} onValueChange={setBg}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BG_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {needsImage && (
        <div>
          <label className="block text-sm font-medium mb-2">Картинка</label>
          <div className="flex items-center gap-4">
            {imagePreview ? (
              <div className="relative size-24 rounded-xl overflow-hidden border">
                <img src={imagePreview} alt="" className="size-full object-cover" />
                <button
                  type="button"
                  onClick={() => { setImageStorageId(undefined); setImagePreview(null); }}
                  className="absolute top-1 right-1 size-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
                >
                  <X className="size-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="size-24 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
              >
                <Upload className="size-5" />
                <span className="text-xs">Загрузить</span>
              </button>
            )}
            {imagePreview && (
              <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
                {uploading ? "Загрузка..." : "Заменить"}
              </Button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1.5">
          {layout === "cards" ? "Содержимое (каждая карточка с новой строки: заголовок | описание)" : "Текст"}
        </label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={
            layout === "cards"
              ? "Натуральный эффект | Лёгкие ресницы для повседневного образа\nГолливудский объём | Яркий и выразительный взгляд\nLash Lifting | Завивка и питание натуральных ресниц"
              : "Текст раздела..."
          }
          rows={layout === "cards" ? 6 : 4}
          className="resize-none"
        />
        {layout === "cards" && (
          <p className="text-xs text-muted-foreground mt-1">
            Каждая строка = отдельная карточка. Разделяйте заголовок и описание символом |
          </p>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <Button onClick={handleSave} disabled={saving || !title.trim()} className="gap-2">
          {saving ? "Сохранение..." : section ? "Сохранить" : "Создать раздел"}
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Отмена
        </Button>
      </div>
    </div>
  );
}
