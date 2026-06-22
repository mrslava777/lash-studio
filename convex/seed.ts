import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const seedData = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // Check if already seeded
    const existing = await ctx.db.query("siteSettings").first();
    if (existing) return null;

    // Seed site settings
    await ctx.db.insert("siteSettings", {
      studioName: "Lash Studio",
      tagline: "Красота в каждом взгляде",
      aboutText:
        "Профессиональное наращивание ресниц с заботой о здоровье ваших глаз. Использую только премиальные материалы и современные техники для создания идеального взгляда.",
      heroTitle: "Идеальные ресницы для вашего взгляда",
      heroSubtitle:
        "Профессиональное наращивание ресниц. Подчеркните естественную красоту ваших глаз",
      phone: "+375 (29) 000-00-00",
      instagram: "@lash.studio",
      telegram: "@lash_studio",
      address: "ул. Примерная, 10, оф. 5",
      city: "Минск",
      workingHours: "Пн-Сб: 9:00 – 20:00",
    });

    // Seed services
    const services = [
      {
        name: "Классика",
        description:
          "Наращивание по одной ресничке на каждую натуральную. Естественный и элегантный эффект.",
        price: 45,
        duration: "1.5-2 часа",
        category: "Наращивание",
        sortOrder: 1,
        isActive: true,
      },
      {
        name: "2D объём",
        description:
          "Двойной объём — на каждую натуральную ресницу крепится пучок из 2 искусственных.",
        price: 55,
        duration: "2-2.5 часа",
        category: "Наращивание",
        sortOrder: 2,
        isActive: true,
      },
      {
        name: "3D объём",
        description:
          "Роскошный тройной объём для выразительного и яркого взгляда.",
        price: 65,
        duration: "2.5-3 часа",
        category: "Наращивание",
        sortOrder: 3,
        isActive: true,
      },
      {
        name: "Мега-объём (4D-6D)",
        description:
          "Максимальная густота и драматический эффект. Для любительниц яркого макияжа.",
        price: 80,
        duration: "3-3.5 часа",
        category: "Наращивание",
        sortOrder: 4,
        isActive: true,
      },
      {
        name: "Ламинирование ресниц",
        description:
          "Питание, укрепление и красивый изгиб ваших натуральных ресниц.",
        price: 35,
        duration: "1-1.5 часа",
        category: "Уход",
        sortOrder: 5,
        isActive: true,
      },
      {
        name: "Коррекция",
        description:
          "Обновление наращенных ресниц. Рекомендуется каждые 2-3 недели.",
        price: 30,
        duration: "1-1.5 часа",
        category: "Коррекция",
        sortOrder: 6,
        isActive: true,
      },
      {
        name: "Снятие ресниц",
        description: "Бережное снятие наращенных ресниц без вреда натуральным.",
        price: 15,
        duration: "30-40 мин",
        category: "Уход",
        sortOrder: 7,
        isActive: true,
      },
    ];

    for (const service of services) {
      await ctx.db.insert("services", service);
    }

    return null;
  },
});
