import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Admin: list all slots
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("availableSlots")
      .order("asc")
      .collect();
  },
});

// Public: list available (unbooked) slots grouped by date
export const listAvailable = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("availableSlots")
      .withIndex("by_available", (q) => q.eq("isBooked", false))
      .order("asc")
      .collect();
  },
});

// Public: list available dates (unique dates that have free slots)
export const listAvailableDates = query({
  args: {},
  handler: async (ctx) => {
    const slots = await ctx.db
      .query("availableSlots")
      .withIndex("by_available", (q) => q.eq("isBooked", false))
      .collect();
    const dates = [...new Set(slots.map((s) => s.date))].sort();
    return dates;
  },
});

// Public: list available times for a specific date
export const listAvailableTimesForDate = query({
  args: { date: v.string() },
  handler: async (ctx, { date }) => {
    const slots = await ctx.db
      .query("availableSlots")
      .withIndex("by_date", (q) => q.eq("date", date))
      .order("asc")
      .collect();
    return slots.filter((s) => !s.isBooked).map((s) => ({ _id: s._id, time: s.time }));
  },
});

// Admin: add slots for a date
export const addSlots = mutation({
  args: {
    date: v.string(),
    times: v.array(v.string()),
  },
  handler: async (ctx, { date, times }) => {
    // Check existing slots for this date
    const existing = await ctx.db
      .query("availableSlots")
      .withIndex("by_date", (q) => q.eq("date", date))
      .collect();
    const existingTimes = new Set(existing.map((s) => s.time));

    for (const time of times) {
      if (!existingTimes.has(time)) {
        await ctx.db.insert("availableSlots", {
          date,
          time,
          isBooked: false,
        });
      }
    }
  },
});

// Admin: remove a slot
export const removeSlot = mutation({
  args: { id: v.id("availableSlots") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

// Admin: remove all slots for a date
export const removeSlotsForDate = mutation({
  args: { date: v.string() },
  handler: async (ctx, { date }) => {
    const slots = await ctx.db
      .query("availableSlots")
      .withIndex("by_date", (q) => q.eq("date", date))
      .collect();
    for (const slot of slots) {
      await ctx.db.delete(slot._id);
    }
  },
});

// Mark slot as booked (called when booking is created)
export const markBooked = mutation({
  args: { id: v.id("availableSlots") },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, { isBooked: true });
  },
});

// Unbook slot (called when booking is cancelled)
export const markAvailable = mutation({
  args: { id: v.id("availableSlots") },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, { isBooked: false });
  },
});
