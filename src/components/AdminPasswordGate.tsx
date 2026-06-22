import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect } from "react";
import { Lock, Eye, EyeOff, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LashLogo } from "./LashLogo";
import { toast } from "sonner";

const SESSION_KEY = "lash-admin-auth";

export function AdminPasswordGate({ children }: { children: React.ReactNode }) {
  const settings = useQuery(api.siteSettings.get);
  const verifyPassword = useMutation(api.siteSettings.verifyAdminPassword);
  const setAdminPassword = useMutation(api.siteSettings.setAdminPassword);

  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");

  // Check session on mount
  useEffect(() => {
    const session = sessionStorage.getItem(SESSION_KEY);
    if (session === "true") {
      setAuthenticated(true);
    }
  }, []);

  // Loading state while settings load
  if (settings === undefined) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Загрузка...</div>
      </div>
    );
  }

  // If no admin password set, show setup screen
  if (!settings?.hasAdminPassword && !authenticated) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/4 size-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 size-96 rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="w-full max-w-sm space-y-6">
          <div className="text-center space-y-3">
            <div className="inline-flex size-16 items-center justify-center rounded-2xl bg-primary/10 mb-2">
              <KeyRound className="size-7 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight font-serif">
              Настройка админ-панели
            </h1>
            <p className="text-muted-foreground text-sm">
              Установите пароль для входа в админ-панель. Этот пароль будет нужен для управления сайтом.
            </p>
          </div>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (password.length < 4) {
                toast.error("Пароль должен быть не менее 4 символов");
                return;
              }
              if (password !== confirmPassword) {
                toast.error("Пароли не совпадают");
                return;
              }
              setLoading(true);
              try {
                await setAdminPassword({ password });
                sessionStorage.setItem(SESSION_KEY, "true");
                setAuthenticated(true);
                toast.success("Пароль установлен!");
              } catch {
                toast.error("Ошибка при установке пароля");
              } finally {
                setLoading(false);
              }
            }}
            className="space-y-4"
          >
            <div className="bg-card border rounded-2xl p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Придумайте пароль
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Минимум 4 символа"
                    className="pr-10 rounded-xl"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Повторите пароль
                </label>
                <Input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Повторите пароль"
                  className="rounded-xl"
                />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={loading || password.length < 4}
              className="w-full rounded-xl py-6"
            >
              {loading ? "Сохранение..." : "Установить пароль"}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // If authenticated, show admin content
  if (authenticated) {
    return <>{children}</>;
  }

  // Login screen
  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 size-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 size-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center mb-2">
            {settings?.logoUrl ? (
              <img src={settings.logoUrl} alt="" className="h-14 w-auto object-contain" />
            ) : (
              <LashLogo className="size-14 text-primary" />
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight font-serif">
            Админ-панель
          </h1>
          <p className="text-muted-foreground text-sm">
            Введите пароль для доступа к управлению сайтом
          </p>
        </div>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            try {
              const ok = await verifyPassword({ password });
              if (ok) {
                sessionStorage.setItem(SESSION_KEY, "true");
                setAuthenticated(true);
              } else {
                toast.error("Неверный пароль");
              }
            } catch {
              toast.error("Ошибка проверки пароля");
            } finally {
              setLoading(false);
            }
          }}
          className="space-y-4"
        >
          <div className="bg-card border rounded-2xl p-6">
            <label className="block text-sm font-medium mb-1.5">Пароль</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль"
                className="pl-10 pr-10 rounded-xl"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={loading || !password}
            className="w-full rounded-xl py-6"
          >
            {loading ? "Проверка..." : "Войти"}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          <a href="/" className="hover:text-primary transition-colors">← Вернуться на сайт</a>
        </p>
      </div>
    </div>
  );
}
