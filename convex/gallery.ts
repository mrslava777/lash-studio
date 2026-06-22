import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("gallery"),
      _creationTime: v.number(),
      storageId: v.id("_storage"),
      url: v.union(v.string(), v.null()),
      caption: v.string(),
      sortOrder: v.number(),
      isVisible: v.boolean(),
    }),
  ),
  handler: async (ctx) => {
    const items = await ctx.db.query("gallery").collect();
    const withUrls = await Promise.all(
      items.map(async (item) => ({
        ...item,
        url: await ctx.storage.getUrl(item.storageId),
      })),
    );
    return withUrls.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const listVisible = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("gallery"),
      _creationTime: v.number(),
      storageId: v.id("_storage"),
      url: v.union(v.string(), v.null()),
      caption: v.string(),
      sortOrder: v.number(),
      isVisible: v.boolean(),
    }),
  ),
  handler: async (ctx) => {
    const items = await ctx.db.query("gallery").collect();
    const visible = items.filter((i) => i.isVisible);
    const withUrls = await Promise.all(
      visible.map(async (item) => ({
        ...item,
        url: await ctx.storage.getUrl(item.storageId),
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
    storageId: v.id("_storage"),
    caption: v.string(),
    sortOrder: v.number(),
  },
  returns: v.id("gallery"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("gallery", {
      ...args,
      isVisible: true,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("gallery"),
    caption: v.string(),
    isVisible: v.boolean(),
    sortOrder: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { id, ...data } = args;
    await ctx.db.patch(id, data);
    return null;
  },
});

export const remove = mutation({
  args: { id: v.id("gallery") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (item) {
      await ctx.storage.delete(item.storageId);
      await ctx.db.delete(args.id);
    }
    return null;
  },
});
