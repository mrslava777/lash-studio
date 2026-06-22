import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useState, useRef } from "react";
import { Plus, Trash2, Eye, EyeOff, ImageIcon, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function GalleryPage() {
  const gallery = useQuery(api.gallery.list);
  const generateUrl = useMutation(api.gallery.generateUploadUrl);
  const createItem = useMutation(api.gallery.create);
  const updateItem = useMutation(api.gallery.update);
  const removeItem = useMutation(api.gallery.remove);

  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const uploadUrl = await generateUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        const { storageId } = await result.json();

        await createItem({
          storageId,
          caption: file.name.replace(/\.[^/.]+$/, ""),
          sortOrder: (gallery?.length ?? 0) + i + 1,
        });
      }
      toast.success(
        `${files.length} ${files.length === 1 ? "фото загружено" : "фото загружены"}`,
      );
    } catch {
      toast.error("Ошибка при загрузке");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const toggleVisibility = async (
    item: NonNullable<typeof gallery>[number],
  ) => {
    await updateItem({
      id: item._id,
      caption: item.caption,
      isVisible: !item.isVisible,
      sortOrder: item.sortOrder,
    });
    toast.success(item.isVisible ? "Фото скрыто" : "Фото показано");
  };

  const updateCaption = async (
    id: Id<"gallery">,
    caption: string,
    item: NonNullable<typeof gallery>[number],
  ) => {
    await updateItem({
      id,
      caption,
      isVisible: item.isVisible,
      sortOrder: item.sortOrder,
    });
  };

  const handleDelete = async (id: Id<"gallery">) => {
    if (!confirm("Удалить это фото?")) return;
    await removeItem({ id });
    toast.success("Фото удалено");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-serif">
            Галерея
          </h1>
          <p className="text-muted-foreground mt-1">
            Загружайте фото ваших работ
          </p>
        </div>
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleUpload}
            accept="image/*"
            multiple
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="rounded-xl"
          >
            {uploading ? (
              "Загрузка..."
            ) : (
              <>
                <Upload className="size-4 mr-2" />
                Загрузить фото
              </>
            )}
          </Button>
        </div>
      </div>

      {gallery && gallery.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <ImageIcon className="size-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">Фотографий пока нет</p>
          <p className="text-sm mb-4">
            Загрузите фото работ для портфолио
          </p>
          <Button onClick={() => fileInputRef.current?.click()}>
            <Plus className="size-4 mr-2" />
            Загрузить
          </Button>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {gallery?.map((item) => (
          <div
            key={item._id}
            className={`group relative rounded-xl overflow-hidden border ${
              !item.isVisible ? "opacity-50" : ""
            }`}
          >
            {item.url ? (
              <img
                src={item.url}
                alt={item.caption}
                className="w-full aspect-[3/4] object-cover"
              />
            ) : (
              <div className="w-full aspect-[3/4] bg-muted flex items-center justify-center">
                <ImageIcon className="size-8 text-muted-foreground" />
              </div>
            )}

            {/* Overlay controls */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
              <div className="flex justify-end gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-8 text-white hover:bg-white/20 hover:text-white"
                  onClick={() => toggleVisibility(item)}
                >
                  {item.isVisible ? (
                    <Eye className="size-4" />
                  ) : (
                    <EyeOff className="size-4" />
                  )}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-8 text-white hover:bg-white/20 hover:text-white"
                  onClick={() => handleDelete(item._id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <div>
                <Input
                  value={item.caption}
                  onChange={(e) =>
                    updateCaption(item._id, e.target.value, item)
                  }
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 text-sm"
                  placeholder="Подпись..."
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
