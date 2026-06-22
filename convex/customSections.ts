import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const layoutValidator = v.union(
  v.literal("text"),
  v.literal("image_left"),
  v.literal("image_right"),
  v.literal("image_top"),
  v.literal("cards"),
);

const sectionReturn = v.object({
  _id: v.id("customSections"),
  _creationTime: v.number(),
  title: v.string(),
  subtitle: v.optional(v.string()),
  content: v.string(),
  imageStorageId: v.optional(v.id("_storage")),
  imageUrl: v.union(v.string(), v.null()),
  layout: layoutValidator,
  backgroundColor: v.optional(v.string()),
  sortOrder: v.number(),
  isVisible: v.boolean(),
});

export const list = query({
  args: {},
  returns: v.array(sectionReturn),
  handler: async (ctx) => {
    const sections = await ctx.db.query("customSections").collect();
    const withUrls = await Promise.all(
      sections.map(async (s) => ({
        ...s,
        imageUrl: s.imageStorageId
          ? await ctx.storage.getUrl(s.imageStorageId)
          : null,
      })),
    );
    return withUrls.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const listVisible = query({
  args: {},
  returns: v.array(sectionReturn),
  handler: async (ctx) => {
    const sections = await ctx.db.query("customSections").collect();
    const visible = sections.filter((s) => s.isVisible);
    const withUrls = await Promise.all(
      visible.map(async (s) => ({
        ...s,
        imageUrl: s.imageStorageId
          ? await ctx.storage.getUrl(s.imageStorageId)
          : null,
      })),
    );
    return withUrls.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const generateUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    subtitle: v.optional(v.string()),
    content: v.string(),
    imageStorageId: v.optional(v.id("_storage")),
    layout: layoutValidator,
    backgroundColor: v.optional(v.string()),
  },
  returns: v.id("customSections"),
  handler: async (ctx, args) => {
    const all = await ctx.db.query("customSections").collect();
    const maxSort = all.length > 0 ? Math.max(...all.map((s) => s.sortOrder)) : 0;
    return await ctx.db.insert("customSections", {
      ...args,
      sortOrder: maxSort + 1,
      isVisible: true,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("customSections"),
    title: v.string(),
    subtitle: v.optional(v.string()),
    content: v.string(),
    imageStorageId: v.optional(v.id("_storage")),
    layout: layoutValidator,
    backgroundColor: v.optional(v.string()),
    sortOrder: v.number(),
    isVisible: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { id, ...data } = args;
    const existing = await ctx.db.get(id);
    // If image changed, delete old one
    if (
      existing?.imageStorageId &&
      data.imageStorageId !== existing.imageStorageId
    ) {
      await ctx.storage.delete(existing.imageStorageId);
    }
    await ctx.db.patch(id, data);
    return null;
  },
});

export const remove = mutation({
  args: { id: v.id("customSections") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (item) {
      if (item.imageStorageId) {
        await ctx.storage.delete(item.imageStorageId);
      }
      await ctx.db.delete(args.id);
    }
    return null;
  },
});

export const reorder = mutation({
  args: {
    ids: v.array(v.id("customSections")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    for (let i = 0; i < args.ids.length; i++) {
      await ctx.db.patch(args.ids[i], { sortOrder: i });
    }
    return null;
  },
});
