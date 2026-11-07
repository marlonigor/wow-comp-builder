import { defineConfig } from "@playwright/test";

const baseURL = "http://127.0.0.1:4175";

export default defineConfig({
  testDir: "./e2e",
  reporter: "line",
  timeout: 15_000,
  use: { baseURL, browserName: "chromium", headless: true },
  webServer: {
    command: "npm run dev -- --host 127.0.0.1 --port 4175 --strictPort",
    url: baseURL,
    timeout: 30_000,
    reuseExistingServer: false,
  },
});
