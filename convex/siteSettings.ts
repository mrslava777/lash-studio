import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: {},
  returns: v.union(
    v.object({
      _id: v.id("siteSettings"),
      _creationTime: v.number(),
      studioName: v.string(),
      tagline: v.string(),
      aboutText: v.string(),
      heroTitle: v.string(),
      heroSubtitle: v.string(),
      phone: v.string(),
      instagram: v.string(),
      telegram: v.string(),
      address: v.string(),
      city: v.string(),
      workingHours: v.string(),
      logoStorageId: v.optional(v.id("_storage")),
      logoUrl: v.union(v.string(), v.null()),
      heroImageStorageId: v.optional(v.id("_storage")),
      heroImageUrl: v.union(v.string(), v.null()),
      hasAdminPassword: v.boolean(),
    }),
    v.null(),
  ),
  handler: async (ctx) => {
    const settings = await ctx.db.query("siteSettings").first();
    if (!settings) return null;
    const logoUrl = settings.logoStorageId
      ? await ctx.storage.getUrl(settings.logoStorageId)
      : null;
    const heroImageUrl = settings.heroImageStorageId
      ? await ctx.storage.getUrl(settings.heroImageStorageId)
      : null;
    // Never expose the actual password to the frontend
    const { adminPassword: _pw, ...rest } = settings;
    return { ...rest, logoUrl, heroImageUrl, hasAdminPassword: !!_pw };
  },
});

export const update = mutation({
  args: {
    studioName: v.string(),
    tagline: v.string(),
    aboutText: v.string(),
    heroTitle: v.string(),
    heroSubtitle: v.string(),
    phone: v.string(),
    instagram: v.string(),
    telegram: v.string(),
    address: v.string(),
    city: v.string(),
    workingHours: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("siteSettings").first();
    if (existing) {
      await ctx.db.patch(existing._id, args);
    } else {
      await ctx.db.insert("siteSettings", args);
    }
    return null;
  },
});

export const generateUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const updateLogo = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("siteSettings").first();
    if (existing) {
      // Delete old logo from storage if it exists
      if (existing.logoStorageId) {
        await ctx.storage.delete(existing.logoStorageId);
      }
      await ctx.db.patch(existing._id, { logoStorageId: args.storageId });
    }
    return null;
  },
});

export const verifyAdminPassword = mutation({
  args: { password: v.string() },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const settings = await ctx.db.query("siteSettings").first();
    if (!settings?.adminPassword) return false;
    return settings.adminPassword === args.password;
  },
});

export const setAdminPassword = mutation({
  args: { password: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    if (args.password.length < 4) {
      throw new Error("Пароль должен быть не менее 4 символов");
    }
    const existing = await ctx.db.query("siteSettings").first();
    if (existing) {
      await ctx.db.patch(existing._id, { adminPassword: args.password });
    }
    return null;
  },
});

export const changeAdminPassword = mutation({
  args: {
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    if (args.newPassword.length < 4) {
      throw new Error("Пароль должен быть не менее 4 символов");
    }
    const settings = await ctx.db.query("siteSettings").first();
    if (!settings?.adminPassword) {
      // No password set yet, just set it
      if (settings) {
        await ctx.db.patch(settings._id, { adminPassword: args.newPassword });
      }
      return true;
    }
    if (settings.adminPassword !== args.currentPassword) {
      return false;
    }
    await ctx.db.patch(settings._id, { adminPassword: args.newPassword });
    return true;
  },
});

export const updateHeroImage = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("siteSettings").first();
    if (existing) {
      if (existing.heroImageStorageId) {
        await ctx.storage.delete(existing.heroImageStorageId);
      }
      await ctx.db.patch(existing._id, { heroImageStorageId: args.storageId });
    }
    return null;
  },
});

export const removeHeroImage = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const existing = await ctx.db.query("siteSettings").first();
    if (existing?.heroImageStorageId) {
      await ctx.storage.delete(existing.heroImageStorageId);
      await ctx.db.patch(existing._id, { heroImageStorageId: undefined });
    }
    return null;
  },
});

export const removeLogo = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const existing = await ctx.db.query("siteSettings").first();
    if (existing?.logoStorageId) {
      await ctx.storage.delete(existing.logoStorageId);
      await ctx.db.patch(existing._id, { logoStorageId: undefined });
    }
    return null;
  },
});
