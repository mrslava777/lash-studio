import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// All reviews (admin view)
export const list = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("reviews"),
      _creationTime: v.number(),
      clientName: v.string(),
      text: v.string(),
      rating: v.number(),
      photoStorageId: v.optional(v.id("_storage")),
      photoUrl: v.union(v.string(), v.null()),
      date: v.string(),
      sortOrder: v.number(),
      isVisible: v.boolean(),
      source: v.union(v.literal("admin"), v.literal("client")),
      status: v.union(
        v.literal("approved"),
        v.literal("pending"),
        v.literal("rejected"),
      ),
    }),
  ),
  handler: async (ctx) => {
    const reviews = await ctx.db.query("reviews").collect();
    const withPhotos = await Promise.all(
      reviews.map(async (r) => ({
        ...r,
        photoUrl: r.photoStorageId
          ? await ctx.storage.getUrl(r.photoStorageId)
          : null,
      })),
    );
    return withPhotos.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

// Only visible + approved reviews (public view)
export const listPublic = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("reviews"),
      _creationTime: v.number(),
      clientName: v.string(),
      text: v.string(),
      rating: v.number(),
      photoUrl: v.union(v.string(), v.null()),
      date: v.string(),
    }),
  ),
  handler: async (ctx) => {
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_status", (q) => q.eq("status", "approved"))
      .collect();
    const visible = reviews
      .filter((r) => r.isVisible)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    const withPhotos = await Promise.all(
      visible.map(async (r) => ({
        _id: r._id,
        _creationTime: r._creationTime,
        clientName: r.clientName,
        text: r.text,
        rating: r.rating,
        photoUrl: r.photoStorageId
          ? await ctx.storage.getUrl(r.photoStorageId)
          : null,
        date: r.date,
      })),
    );
    return withPhotos;
  },
});

// Count pending reviews (for admin badge)
export const countPending = query({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const pending = await ctx.db
      .query("reviews")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();
    return pending.length;
  },
});

// Generate upload URL for photos
export const generateUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Create a review (from admin)
export const create = mutation({
  args: {
    clientName: v.string(),
    text: v.string(),
    rating: v.number(),
    photoStorageId: v.optional(v.id("_storage")),
    date: v.string(),
    sortOrder: v.number(),
  },
  returns: v.id("reviews"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("reviews", {
      ...args,
      isVisible: true,
      source: "admin",
      status: "approved",
    });
  },
});

// Submit a review (from client on public page)
export const submit = mutation({
  args: {
    clientName: v.string(),
    text: v.string(),
    rating: v.number(),
  },
  returns: v.id("reviews"),
  handler: async (ctx, args) => {
    const all = await ctx.db.query("reviews").collect();
    const maxSort = all.reduce((max, r) => Math.max(max, r.sortOrder), 0);
    const today = new Date().toISOString().split("T")[0];
    return await ctx.db.insert("reviews", {
      ...args,
      date: today,
      sortOrder: maxSort + 1,
      isVisible: false,
      source: "client",
      status: "pending",
    });
  },
});

// Update review
export const update = mutation({
  args: {
    id: v.id("reviews"),
    clientName: v.string(),
    text: v.string(),
    rating: v.number(),
    date: v.string(),
    sortOrder: v.number(),
    isVisible: v.boolean(),
    status: v.union(
      v.literal("approved"),
      v.literal("pending"),
      v.literal("rejected"),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { id, ...data } = args;
    await ctx.db.patch(id, data);
    return null;
  },
});

// Approve a review
export const approve = mutation({
  args: { id: v.id("reviews") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: "approved", isVisible: true });
    return null;
  },
});

// Reject a review
export const reject = mutation({
  args: { id: v.id("reviews") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: "rejected", isVisible: false });
    return null;
  },
});

// Delete a review
export const remove = mutation({
  args: { id: v.id("reviews") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const review = await ctx.db.get(args.id);
    if (review?.photoStorageId) {
      await ctx.storage.delete(review.photoStorageId);
    }
    await ctx.db.delete(args.id);
    return null;
  },
});
