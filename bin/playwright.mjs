import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

// O navegador fica junto da versão do Playwright instalada neste projeto.
process.env.PLAYWRIGHT_BROWSERS_PATH = "0";
process.env.PLAYWRIGHT_DOWNLOAD_CONNECTION_TIMEOUT = "20000";

const result = spawnSync(process.execPath, [require.resolve("@playwright/test/cli"), ...process.argv.slice(2)], {
  stdio: "inherit",
});

if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
