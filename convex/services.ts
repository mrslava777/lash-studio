import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("services"),
      _creationTime: v.number(),
      name: v.string(),
      description: v.string(),
      price: v.number(),
      duration: v.string(),
      category: v.string(),
      sortOrder: v.number(),
      isActive: v.boolean(),
    }),
  ),
  handler: async (ctx) => {
    const services = await ctx.db.query("services").collect();
    return services.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const listActive = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("services"),
      _creationTime: v.number(),
      name: v.string(),
      description: v.string(),
      price: v.number(),
      duration: v.string(),
      category: v.string(),
      sortOrder: v.number(),
      isActive: v.boolean(),
    }),
  ),
  handler: async (ctx) => {
    const services = await ctx.db.query("services").collect();
    return services
      .filter((s) => s.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    price: v.number(),
    duration: v.string(),
    category: v.string(),
    sortOrder: v.number(),
    isActive: v.boolean(),
  },
  returns: v.id("services"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("services", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("services"),
    name: v.string(),
    description: v.string(),
    price: v.number(),
    duration: v.string(),
    category: v.string(),
    sortOrder: v.number(),
    isActive: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { id, ...data } = args;
    await ctx.db.patch(id, data);
    return null;
  },
});

export const remove = mutation({
  args: { id: v.id("services") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return null;
  },
});
