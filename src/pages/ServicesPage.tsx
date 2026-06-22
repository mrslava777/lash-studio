import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

type ServiceForm = {
  name: string;
  description: string;
  price: string;
  duration: string;
  category: string;
  sortOrder: string;
  isActive: boolean;
};

const emptyForm: ServiceForm = {
  name: "",
  description: "",
  price: "",
  duration: "",
  category: "",
  sortOrder: "0",
  isActive: true,
};

export function ServicesPage() {
  const services = useQuery(api.services.list);
  const createService = useMutation(api.services.create);
  const updateService = useMutation(api.services.update);
  const removeService = useMutation(api.services.remove);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<Id<"services"> | null>(null);
  const [form, setForm] = useState<ServiceForm>(emptyForm);

  const openCreate = () => {
    setEditingId(null);
    setForm({
      ...emptyForm,
      sortOrder: String((services?.length ?? 0) + 1),
    });
    setDialogOpen(true);
  };

  const openEdit = (service: NonNullable<typeof services>[number]) => {
    setEditingId(service._id);
    setForm({
      name: service.name,
      description: service.description,
      price: String(service.price),
      duration: service.duration,
      category: service.category,
      sortOrder: String(service.sortOrder),
      isActive: service.isActive,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const data = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      duration: form.duration,
      category: form.category,
      sortOrder: Number(form.sortOrder),
      isActive: form.isActive,
    };

    if (editingId) {
      await updateService({ id: editingId, ...data });
      toast.success("Услуга обновлена");
    } else {
      await createService(data);
      toast.success("Услуга добавлена");
    }
    setDialogOpen(false);
  };

  const handleDelete = async (id: Id<"services">) => {
    if (!confirm("Удалить эту услугу?")) return;
    await removeService({ id });
    toast.success("Услуга удалена");
  };

  const categories = [...new Set(services?.map((s) => s.category) ?? [])];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-serif">
            Услуги
          </h1>
          <p className="text-muted-foreground mt-1">
            Управляйте списком услуг и ценами
          </p>
        </div>
        <Button onClick={openCreate} className="rounded-xl">
          <Plus className="size-4 mr-2" />
          Добавить
        </Button>
      </div>

      {categories.map((category) => (
        <div key={category}>
          <h2 className="text-lg font-semibold text-primary mb-3">
            {category}
          </h2>
          <div className="space-y-2">
            {services
              ?.filter((s) => s.category === category)
              .map((service) => (
                <div
                  key={service._id}
                  className={`bg-card border rounded-xl p-4 flex items-center gap-4 ${
                    !service.isActive ? "opacity-50" : ""
                  }`}
                >
                  <GripVertical className="size-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{service.name}</h3>
                      {!service.isActive && (
                        <span className="text-xs text-muted-foreground">
                          (скрыта)
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {service.description}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-primary">
                      {service.price} BYN
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {service.duration}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => openEdit(service)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(service._id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}

      {services?.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg font-medium">Услуг пока нет</p>
          <p className="text-sm mb-4">Добавьте первую услугу</p>
          <Button onClick={openCreate}>
            <Plus className="size-4 mr-2" />
            Добавить услугу
          </Button>
        </div>
      )}

      {/* Edit/Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">
              {editingId ? "Редактировать услугу" : "Новая услуга"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Название
              </label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Классика"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Описание
              </label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Описание услуги..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Цена (BYN)
                </label>
                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="45"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Длительность
                </label>
                <Input
                  value={form.duration}
                  onChange={(e) =>
                    setForm({ ...form, duration: e.target.value })
                  }
                  placeholder="1.5-2 часа"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Категория
                </label>
                <Input
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  placeholder="Наращивание"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Порядок
                </label>
                <Input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) =>
                    setForm({ ...form, sortOrder: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Показывать на сайте
              </label>
              <Switch
                checked={form.isActive}
                onCheckedChange={(checked) =>
                  setForm({ ...form, isActive: checked })
                }
              />
            </div>
            <Button
              onClick={handleSave}
              className="w-full"
              disabled={!form.name || !form.price}
            >
              {editingId ? "Сохранить" : "Добавить"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
