import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect, useRef } from "react";
import { Save, Settings, Upload, Trash2, ImageIcon, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LashLogo } from "@/components/LashLogo";
import { toast } from "sonner";

export function SettingsPage() {
  const settings = useQuery(api.siteSettings.get);
  const updateSettings = useMutation(api.siteSettings.update);
  const generateUploadUrl = useMutation(api.siteSettings.generateUploadUrl);
  const updateLogo = useMutation(api.siteSettings.updateLogo);
  const removeLogo = useMutation(api.siteSettings.removeLogo);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    studioName: "",
    tagline: "",
    aboutText: "",
    heroTitle: "",
    heroSubtitle: "",
    phone: "",
    instagram: "",
    telegram: "",
    address: "",
    city: "",
    workingHours: "",
  });

  useEffect(() => {
    if (settings) {
      setForm({
        studioName: settings.studioName,
        tagline: settings.tagline,
        aboutText: settings.aboutText,
        heroTitle: settings.heroTitle,
        heroSubtitle: settings.heroSubtitle,
        phone: settings.phone,
        instagram: settings.instagram,
        telegram: settings.telegram,
        address: settings.address,
        city: settings.city,
        workingHours: settings.workingHours,
      });
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings(form);
      toast.success("Настройки сохранены!");
    } catch {
      toast.error("Ошибка при сохранении");
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Пожалуйста, выберите изображение");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Файл слишком большой (максимум 5 МБ)");
      return;
    }

    setUploadingLogo(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await response.json();
      await updateLogo({ storageId });
      toast.success("Логотип обновлён!");
    } catch {
      toast.error("Ошибка при загрузке логотипа");
    } finally {
      setUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  };

  const handleRemoveLogo = async () => {
    try {
      await removeLogo();
      toast.success("Логотип удалён — будет показан стандартный");
    } catch {
      toast.error("Ошибка при удалении логотипа");
    }
  };

  const Field = ({
    label,
    field,
    placeholder,
    multiline,
  }: {
    label: string;
    field: keyof typeof form;
    placeholder?: string;
    multiline?: boolean;
  }) => (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      {multiline ? (
        <Textarea
          value={form[field]}
          onChange={(e) => setForm({ ...form, [field]: e.target.value })}
          placeholder={placeholder}
          rows={3}
          className="resize-none"
        />
      ) : (
        <Input
          value={form[field]}
          onChange={(e) => setForm({ ...form, [field]: e.target.value })}
          placeholder={placeholder}
        />
      )}
    </div>
  );

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-serif">
          Настройки сайта
        </h1>
        <p className="text-muted-foreground mt-1">
          Редактируйте информацию на сайте
        </p>
      </div>

      {/* Logo */}
      <section className="bg-card border rounded-xl p-6 space-y-4">
        <h2 className="font-semibold flex items-center gap-2">
          <ImageIcon className="size-4 text-primary" />
          Логотип
        </h2>
        <p className="text-sm text-muted-foreground">
          Загрузите свой логотип или оставьте стандартный
        </p>

        <div className="flex items-center gap-6">
          {/* Current logo preview */}
          <div className="shrink-0 size-20 rounded-2xl border-2 border-dashed border-border flex items-center justify-center bg-muted/30 overflow-hidden">
            {settings?.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt="Логотип"
                className="size-full object-contain p-1"
              />
            ) : (
              <LashLogo className="size-10 text-primary/60" />
            )}
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => logoInputRef.current?.click()}
                disabled={uploadingLogo}
                className="gap-2"
              >
                <Upload className="size-3.5" />
                {uploadingLogo ? "Загрузка..." : settings?.logoUrl ? "Заменить" : "Загрузить"}
              </Button>
              {settings?.logoUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveLogo}
                  className="gap-2 text-destructive hover:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                  Удалить
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              PNG, JPG или SVG. Рекомендуемый размер: 200×200 px
            </p>
          </div>
        </div>

        <input
          ref={logoInputRef}
          type="file"
          accept="image/*"
          onChange={handleLogoUpload}
          className="hidden"
        />
      </section>

      {/* General */}
      <section className="bg-card border rounded-xl p-6 space-y-4">
        <h2 className="font-semibold flex items-center gap-2">
          <Settings className="size-4 text-primary" />
          Основная информация
        </h2>
        <Field
          label="Название студии"
          field="studioName"
          placeholder="Lash Studio"
        />
        <Field
          label="Слоган"
          field="tagline"
          placeholder="Красота в каждом взгляде"
        />
        <Field
          label="О мастере / студии"
          field="aboutText"
          placeholder="Расскажите о себе..."
          multiline
        />
      </section>

      {/* Hero */}
      <section className="bg-card border rounded-xl p-6 space-y-4">
        <h2 className="font-semibold">Главный экран</h2>
        <Field
          label="Заголовок"
          field="heroTitle"
          placeholder="Идеальные ресницы для вашего взгляда"
        />
        <Field
          label="Подзаголовок"
          field="heroSubtitle"
          placeholder="Профессиональное наращивание ресниц"
        />
      </section>

      {/* Contacts */}
      <section className="bg-card border rounded-xl p-6 space-y-4">
        <h2 className="font-semibold">Контакты</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field
            label="Телефон"
            field="phone"
            placeholder="+375 (29) 000-00-00"
          />
          <Field label="Город" field="city" placeholder="Минск" />
        </div>
        <Field
          label="Адрес"
          field="address"
          placeholder="ул. Примерная, 10"
        />
        <div className="grid sm:grid-cols-2 gap-4">
          <Field
            label="Instagram"
            field="instagram"
            placeholder="@lash.studio"
          />
          <Field
            label="Telegram"
            field="telegram"
            placeholder="@lash_studio"
          />
        </div>
        <Field
          label="Время работы"
          field="workingHours"
          placeholder="Пн-Сб: 9:00 – 20:00"
        />
      </section>

      <Button
        onClick={handleSave}
        disabled={saving}
        size="lg"
        className="w-full sm:w-auto"
      >
        <Save className="size-4 mr-2" />
        {saving ? "Сохранение..." : "Сохранить изменения"}
      </Button>

      {/* Password section */}
      <PasswordSection />
    </div>
  );
}

/* ───── Password management section ───── */
function PasswordSection() {
  const settings = useQuery(api.siteSettings.get);
  const changePassword = useMutation(api.siteSettings.changeAdminPassword);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);

  const hasPassword = settings?.hasAdminPassword;

  const handleChangePassword = async () => {
    if (newPw.length < 4) {
      toast.error("Пароль должен быть не менее 4 символов");
      return;
    }
    if (newPw !== confirmPw) {
      toast.error("Пароли не совпадают");
      return;
    }
    setSaving(true);
    try {
      const ok = await changePassword({ currentPassword: currentPw, newPassword: newPw });
      if (ok) {
        toast.success("Пароль изменён!");
        setCurrentPw("");
        setNewPw("");
        setConfirmPw("");
      } else {
        toast.error("Неверный текущий пароль");
      }
    } catch {
      toast.error("Ошибка при смене пароля");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="bg-card border rounded-xl p-6 space-y-4 mt-6">
      <div className="flex items-center gap-2">
        <Lock className="size-5 text-primary" />
        <h2 className="text-lg font-semibold font-serif">Пароль админ-панели</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        {hasPassword ? "Измените пароль для входа в админ-панель" : "Установите пароль для защиты админ-панели"}
      </p>

      <div className="space-y-3 max-w-md">
        {hasPassword && (
          <div>
            <label className="block text-sm font-medium mb-1.5">Текущий пароль</label>
            <div className="relative">
              <Input
                type={showPw ? "text" : "password"}
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                placeholder="Введите текущий пароль"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium mb-1.5">Новый пароль</label>
          <Input
            type={showPw ? "text" : "password"}
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
            placeholder="Минимум 4 символа"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Повторите новый пароль</label>
          <Input
            type={showPw ? "text" : "password"}
            value={confirmPw}
            onChange={(e) => setConfirmPw(e.target.value)}
            placeholder="Повторите пароль"
          />
        </div>
        <Button
          onClick={handleChangePassword}
          disabled={saving || newPw.length < 4}
          className="gap-2"
        >
          <Lock className="size-4" />
          {saving ? "Сохранение..." : hasPassword ? "Изменить пароль" : "Установить пароль"}
        </Button>
      </div>
    </section>
  );
}
