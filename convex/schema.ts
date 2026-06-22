import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const schema = defineSchema({
  ...authTables,

  // Site-wide settings (single document)
  siteSettings: defineTable({
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
    heroImageStorageId: v.optional(v.id("_storage")),
    adminPassword: v.optional(v.string()),
  }),

  // Custom sections (user-created blocks on the landing page)
  customSections: defineTable({
    title: v.string(),
    subtitle: v.optional(v.string()),
    content: v.string(), // Markdown or plain text
    imageStorageId: v.optional(v.id("_storage")),
    layout: v.union(
      v.literal("text"),           // Just text
      v.literal("image_left"),     // Image on the left, text on the right
      v.literal("image_right"),    // Image on the right, text on the left
      v.literal("image_top"),      // Image on top, text below
      v.literal("cards"),          // Content as comma-separated cards
    ),
    backgroundColor: v.optional(v.string()), // "default" | "accent" | "dark"
    sortOrder: v.number(),
    isVisible: v.boolean(),
  }).index("by_sort", ["sortOrder"]),

  // Services offered
  services: defineTable({
    name: v.string(),
    description: v.string(),
    price: v.number(),
    duration: v.string(), // e.g. "1.5-2 часа"
    category: v.string(), // e.g. "Наращивание", "Уход", "Коррекция"
    sortOrder: v.number(),
    isActive: v.boolean(),
  }).index("by_category", ["category"]),

  // Gallery images
  gallery: defineTable({
    storageId: v.id("_storage"),
    caption: v.string(),
    sortOrder: v.number(),
    isVisible: v.boolean(),
  }),

  // Client reviews / testimonials
  reviews: defineTable({
    clientName: v.string(),
    text: v.string(),
    rating: v.number(), // 1-5
    photoStorageId: v.optional(v.id("_storage")),
    date: v.string(), // "2026-06-22"
    sortOrder: v.number(),
    isVisible: v.boolean(),
    source: v.union(v.literal("admin"), v.literal("client")), // who submitted
    status: v.union(
      v.literal("approved"),
      v.literal("pending"),
      v.literal("rejected"),
    ),
  })
    .index("by_status", ["status"])
    .index("by_sort", ["sortOrder"]),

  // Bookings from clients
  bookings: defineTable({
    clientName: v.string(),
    clientPhone: v.string(),
    clientTelegram: v.optional(v.string()),
    serviceId: v.id("services"),
    serviceName: v.string(),
    preferredDate: v.string(),
    preferredTime: v.string(),
    slotId: v.optional(v.id("availableSlots")),
    notes: v.optional(v.string()),
    status: v.union(
      v.literal("new"),
      v.literal("confirmed"),
      v.literal("completed"),
      v.literal("cancelled"),
    ),
  })
    .index("by_status", ["status"])
    .index("by_date", ["preferredDate"]),

  // Available time slots set by admin
  availableSlots: defineTable({
    date: v.string(), // "2026-06-25"
    time: v.string(), // "10:00"
    isBooked: v.boolean(),
  })
    .index("by_date", ["date", "time"])
    .index("by_available", ["isBooked", "date"]),
});

export default schema;
