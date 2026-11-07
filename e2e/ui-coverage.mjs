import { test } from "@playwright/test";
import { writeFile } from "node:fs/promises";

// Mantém evidências de execução dos componentes sem instalar instrumentadores.
test.beforeEach(async ({ page }) => {
  await page.coverage.startJSCoverage({ resetOnNavigation: false });
});

test.afterEach(async ({ page }, testInfo) => {
  const coverage = (await page.coverage.stopJSCoverage()).filter(({ url }) => url.includes("/src/"));
  const path = testInfo.outputPath("ui-coverage.json");
  await writeFile(path, JSON.stringify(coverage));
  await testInfo.attach("ui-coverage", { path, contentType: "application/json" });
});
