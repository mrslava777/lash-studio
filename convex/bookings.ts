import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const bookings = await ctx.db.query("bookings").collect();
    return bookings.sort((a, b) => {
      if (a.preferredDate !== b.preferredDate)
        return a.preferredDate.localeCompare(b.preferredDate);
      return a.preferredTime.localeCompare(b.preferredTime);
    });
  },
});

export const listByStatus = query({
  args: {
    status: v.union(
      v.literal("new"),
      v.literal("confirmed"),
      v.literal("completed"),
      v.literal("cancelled"),
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("bookings")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
  },
});

export const create = mutation({
  args: {
    clientName: v.string(),
    clientPhone: v.string(),
    clientTelegram: v.optional(v.string()),
    serviceId: v.id("services"),
    slotId: v.optional(v.id("availableSlots")),
    preferredDate: v.string(),
    preferredTime: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const service = await ctx.db.get(args.serviceId);
    if (!service) throw new Error("Услуга не найдена");

    // Mark slot as booked if provided
    if (args.slotId) {
      const slot = await ctx.db.get(args.slotId);
      if (slot && !slot.isBooked) {
        await ctx.db.patch(args.slotId, { isBooked: true });
      }
    }

    const { slotId, ...bookingArgs } = args;
    return await ctx.db.insert("bookings", {
      ...bookingArgs,
      serviceName: service.name,
      slotId: slotId,
      status: "new",
    });
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("bookings"),
    status: v.union(
      v.literal("new"),
      v.literal("confirmed"),
      v.literal("completed"),
      v.literal("cancelled"),
    ),
  },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.id);
    if (!booking) return;

    // If cancelling, free up the slot
    if (args.status === "cancelled" && booking.slotId) {
      const slot = await ctx.db.get(booking.slotId);
      if (slot) {
        await ctx.db.patch(booking.slotId, { isBooked: false });
      }
    }

    await ctx.db.patch(args.id, { status: args.status });
  },
});

export const remove = mutation({
  args: { id: v.id("bookings") },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.id);
    if (!booking) return;

    // Free up the slot
    if (booking.slotId) {
      const slot = await ctx.db.get(booking.slotId);
      if (slot) {
        await ctx.db.patch(booking.slotId, { isBooked: false });
      }
    }

    await ctx.db.delete(args.id);
  },
});
