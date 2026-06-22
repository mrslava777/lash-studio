import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
const TMP_DIR = join(projectRoot, "tmp");
const PORT = 4174;

async function main() {
  const filename = process.argv[2] || "landing.png";

  // Use Bun's built-in static file server
  const server = Bun.serve({
    port: PORT,
    static: undefined,
    async fetch(req) {
      const url = new URL(req.url);
      let filePath = url.pathname === "/" ? "/index.html" : url.pathname;
      const fullPath = join(projectRoot, "dist", filePath);
      const file = Bun.file(fullPath);
      if (await file.exists()) return new Response(file);
      // SPA fallback
      return new Response(Bun.file(join(projectRoot, "dist", "index.html")));
    },
  });

  console.log(`🚀 Serving at http://localhost:${PORT}`);

  try {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(`http://localhost:${PORT}`, { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(2000);
    await mkdir(TMP_DIR, { recursive: true });
    const filepath = join(TMP_DIR, filename);
    await page.screenshot({ path: filepath, fullPage: true });
    console.log(`📸 ${filepath}`);
    await browser.close();
  } finally {
    server.stop();
  }
}
main().catch(console.error);
