import { ConvexReactClient } from "convex/react";

const CONVEX_URL =
  import.meta.env.VITE_CONVEX_URL || "https://formal-dog-297.convex.cloud";

export const convex = new ConvexReactClient(CONVEX_URL);
